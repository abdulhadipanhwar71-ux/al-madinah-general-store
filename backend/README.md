# DukaanOS Backend Architecture & Deployment Guide

DukaanOS backend is built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic V2**, and supports **MySQL 8.0**, **PostgreSQL**, and **SQLite**.

---

## 🏛 Architecture & Capabilities

1. **Relational Database & Migrations**:
   - Primary database: **MySQL 8.0** (`dukaanos_db` on `localhost:3306`).
   - SQLite fallback supported for lightweight and test environments.
   - **Alembic** migration tracking configured (`backend/alembic`).
   - Relational schema: `User`, `StoreProfile`, `Product`, `StockMovement`, `Customer`, `CustomerRepayment`, `Transaction`, `TransactionItem`, `Expense`, `StoreOrder`, `OrderItem`, `OrderStatusHistory`.

2. **Concurrency & Oversell Protection**:
   - Atomic POS checkouts enforce database transactions (`db.commit()` / `db.rollback()`).
   - Row-level lock (`SELECT ... FOR UPDATE`) prevents concurrent requests from overselling limited inventory.
   - Detailed stock movement ledger logs quantity deltas, previous/new stock levels, and cashier IDs.

3. **Secure Authentication & RBAC**:
   - Passwords hashed using standard direct **bcrypt** salt & hash.
   - JWT Bearer access tokens with configurable expiration (`JWT_ACCESS_TOKEN_EXPIRE_MINUTES`).
   - Sliding-window login rate limiting (5 attempts per minute per IP) prevents brute force attacks.
   - Role-Based Access Control:
     - `owner`: Unrestricted access including financial reports, expense management, and full database backup/restore.
     - `cashier`: Counter sales, customer lookups, order processing; denied access to private financial summary and database exports.

4. **Privacy & Security Separation**:
   - Public storefront endpoints (`/api/public/*`) strictly exclude `cost_price`, profit margins, and internal accounting records.
   - All private business operations require authenticated JWT authorization.

5. **Accurate Retail Business Accounting**:
   - Gross Profit = Sales Revenue - COGS (Cost of Goods Sold preserved historically at moment of sale).
   - Net Profit = Gross Profit - Store Operating Expenses.
   - **Customer Repayments Ledger**: Counter repayments decrease customer Udhaar balance and are **never** counted as sales revenue, eliminating double-counting.

6. **Idempotent Web & WhatsApp Orders**:
   - Public order placement supports `idempotency_key` preventing duplicate order records during network retries or double clicks.
   - Persistent `OrderStatusHistory` audit trail tracks every status transition (`New` -> `Confirmed` -> `Out for Delivery` -> `Completed`) with timestamp and operator note.

7. **Database Backup & Disaster Recovery**:
   - Admin-only backup router (`/api/admin/backup`):
     - `GET /api/admin/backup/export/json`: Structured JSON dump (Schema v3.0) with UTC timestamp.
     - `GET /api/admin/backup/export/csv`: Compressed ZIP archive containing individual CSV spreadsheets for all business tables.
     - `POST /api/admin/backup/restore`: Safe restore with smart duplicate detection (skipping existing SKUs, phone numbers, invoice IDs).

---

## ⚙️ Environment Configuration

Configuration is loaded from `backend/.env`. Example template is in `backend/.env.example`:

```env
DATABASE_URL=mysql+pymysql://root:1234@localhost:3306/dukaanos_db
JWT_SECRET_KEY=dukaanos_production_jwt_secret_key_change_in_production_9988776655
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
STORE_WHATSAPP_NUMBER=03282885660
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174
```

---

## 🚀 Running the Backend Server

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Seed Initial Database
```bash
python backend/seed_data.py
```
This initializes the schema and seeds:
- Owner: `AbdulHadi` (`abdulhadipanhwar71@gmail.com` / username: `127294`)
- Cashier: `cashier@dukaanos.pk` / `cashier123`
- Store profile: `Al-Madinah General Store`, Ripri, Khairpur Mirs, Sindh, Pakistan with centralized WhatsApp `03282885660`
- Catalog items with SKUs and cost prices
- Customer Udhaar ledgers and historical repayments
- Initial POS sales invoices, orders, and operating expenses

### 3. Start FastAPI Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🧪 Automated Pytest Suite

Run the full automated test suite verifying auth, permissions, POS transactions, oversell prevention, Udhaar accounting, order idempotency, and backup exports:

```bash
python -m pytest backend/tests/ -v
```

All 16 test suites pass cleanly with 100% success rate.
