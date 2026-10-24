# DukaanOS — Production Deployment & Security Hardening Guide

This document provides a comprehensive operational manual for deploying the DukaanOS platform into a secure, production-grade cloud environment.

---

## 🏗 System Architecture Overview

```
                         [ Internet / Clients ]
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
    [ Public Storefront ]                     [ Private Admin Panel ]
 (https://shop.dukaanos.pk)               (https://admin.dukaanos.pk)
               │                                       │
               └───────────────────┬───────────────────┘
                                   │ HTTPS (Port 443)
                                   ▼
                   [ Nginx / Caddy Reverse Proxy ]
               (SSL Termination • Rate Limiting • SPA Routing)
                                   │
                        http://127.0.0.1:8000
                                   ▼
                     [ FastAPI ASGI Application ]
               (Uvicorn / Gunicorn • Python 3.12+ • JWT)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ Managed MySQL 8.0 / Postgres ]         [ Backup Archive Storage ]
   (Relational Data • Row Locks)             (Encrypted Daily Snapshots)
```

---

## 🔒 1. Security Baseline & Hardening

### A. Environment Configuration (`backend/.env`)
Create your production `.env` file from [`backend/.env.example`](file:///D:/Shops/backend/.env.example). **Never commit this file to version control.**

Generate a cryptographically secure 64-character JWT secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Configure your production settings:
```ini
ENVIRONMENT=production
DATABASE_URL=mysql+pymysql://dukaanos_admin:<STRONG_PASSWORD>@<DB_HOST>:3306/dukaanos_db
JWT_SECRET_KEY=<PASTE_GENERATED_64_CHAR_HEX_KEY>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=https://yourstore.com,https://admin.yourstore.com
LOGIN_RATE_LIMIT_PER_MINUTE=5
LOG_LEVEL=warning
```
*Note: In `ENVIRONMENT=production` mode, DukaanOS automatically validates that `JWT_SECRET_KEY` is not a placeholder and rejects wildcard `*` CORS origins on startup.*

### B. Secure First Owner Account Creation
Never use demo passwords (`admin123`, `cashier123`) in production. Run the provisioning CLI tool:
```bash
python backend/manage_users.py create-owner --name "Store Owner" --email owner@yourdomain.pk
```
The script interactively prompts for a password with minimum 8 characters and applies salted bcrypt hashing.

---

## 🗄 2. Database Provisioning & Migrations

### A. Run Database Migrations
On a fresh MySQL 8.0 or PostgreSQL database, apply all schema revisions:
```bash
# Upgrade database to latest revision
python -m alembic upgrade head
```
This automatically initializes the following tables with strict foreign keys:
`users`, `store_profile`, `products`, `stock_movements`, `customers`, `customer_repayments`, `transactions`, `transaction_items`, `expenses`, `store_orders`, `order_items`, `order_status_history`.

### B. Failed Migration Recovery Runbook
If a migration fails due to network timeout or permissions:
1. Check current database revision:
   ```bash
   python -m alembic current
   ```
2. Revert the last uncompleted migration step:
   ```bash
   python -m alembic downgrade -1
   ```
3. Inspect and resolve constraint violations in `backend/alembic/versions/`.
4. Re-run `python -m alembic upgrade head`.

---

## 🌐 3. Nginx Reverse Proxy & SSL Configuration

Deploy Nginx on your Linux server (Ubuntu 22.04 / Debian 12):

```nginx
# /etc/nginx/sites-available/dukaanos.conf

server {
    listen 80;
    server_name store.yourdomain.pk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store.yourdomain.pk;

    # SSL Certificates (managed via Let's Encrypt Certbot)
    ssl_certificate /etc/letsencrypt/live/store.yourdomain.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.yourdomain.pk/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # 1. Frontend Static SPA Assets
    root /var/www/dukaanos/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. FastAPI Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for heavy backup exports
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

---

## ⚙️ 4. Systemd Service for FastAPI Daemon

Create `/etc/systemd/system/dukaanos-backend.service`:
```ini
[Unit]
Description=DukaanOS FastAPI Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dukaanos
ExecStart=/var/www/dukaanos/venv/bin/gunicorn backend.app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/dukaanos/access.log \
    --error-logfile /var/log/dukaanos/error.log
Restart=always
RestartSec=5
EnvironmentFile=/var/www/dukaanos/backend/.env

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable dukaanos-backend
sudo systemctl start dukaanos-backend
sudo systemctl status dukaanos-backend
```

---

## 💾 5. Backup & Disaster Recovery Schedule

### A. Nightly Cron Job
Set up an automated daily backup cron job:
```bash
# Export full JSON backup daily at 2:00 AM PKT
0 2 * * * /usr/bin/curl -H "Authorization: Bearer <OWNER_TOKEN>" https://store.yourdomain.pk/api/admin/backup/export/json -o /var/backups/dukaanos/backup_$(date +\%Y\%m\%d).json
```

### B. Disaster Recovery Runbook
To restore from a backup file:
1. Log in to the Admin Panel (`/admin/login`).
2. Navigate to **Backup & Restore** (`/admin/backup`).
3. Select the target `.json` backup file.
4. Review schema version and record counts.
5. Click **Verify & Restore into Database**.
   - Duplicate detection ensures existing SKUs and phone numbers are not corrupted.

---

## 💰 6. Expected Hosting & Domain Costs

| Component | Free / Low-Cost Option | Recommended Retail Production | Enterprise High-Availability |
| :--- | :--- | :--- | :--- |
| **Frontend** | Cloudflare Pages / Vercel ($0) | Cloudflare Pages Pro ($20/mo) | AWS CloudFront + S3 ($15/mo) |
| **Backend** | Render / Railway ($0 - $5/mo) | DigitalOcean Droplet 2GB ($12/mo) | AWS EC2 t4g.medium ($25/mo) |
| **Database** | Aiven MySQL Free / Supabase ($0) | DigitalOcean Managed MySQL ($15/mo) | AWS RDS Multi-AZ ($45/mo) |
| **Domain (.pk)**| PKNIC (Rs. 4,800 for 2 yrs ≈ $8.50/yr) | PKNIC Domain ($8.50/yr) | PKNIC Domain ($8.50/yr) |
| **SSL Certificate** | Let's Encrypt (Free / $0) | Let's Encrypt (Free / $0) | Let's Encrypt / Cloudflare ($0) |
| **Total Monthly** | **$0 – $13.50 / month** | **~$35 – $47 / month** | **~$85 – $100 / month** |

*Note: For single retail store operations in Pakistan, the **$12 - $15/month** tier (DigitalOcean 2GB Droplet or Hetzner VPS hosting both FastAPI and local MySQL) provides outstanding performance with zero external latency.*
