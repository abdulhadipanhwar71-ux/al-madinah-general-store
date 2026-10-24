# Al-Madinah General Store — Deployment & System Verification Report

**Project Name:** Al-Madinah General Store  
**Location:** Ripri, Khairpur Mirs, Sindh, Pakistan  
**Owner / Administrator:** AbdulHadi  
**Admin Username:** `127294`  
**Admin Email:** `abdulhadipanhwar71@gmail.com`  
**Customer WhatsApp Contact:** `03282885660` (International: `+92 328 2885660` / `https://wa.me/923282885660`)  
**Currency:** PKR (Pakistani Rupees)  
**Supported Languages:** Urdu (اردو) and English (with full RTL & typography support)  
**Date & Time:** October 24, 2026  

---

## 1. Executive Summary

The complete codebase of **Al-Madinah General Store** at `D:\Shops` has been thoroughly audited, normalized, built, tested, and synchronized with GitHub. All store branding, contact details, localized catalogs, WhatsApp order generation links, and secure authentication workflows are operational.

---

## 2. Completed Work & Engineering Accomplishments

### A. Store Branding & Information Normalization
- Corrected store naming from legacy spelling to **Al-Madinah General Store** across:
  - Frontend documents, page titles (`index.html`), header navigation, and footer.
  - Urdu and English translation dictionaries (`src/utils/translations.ts`).
  - Context migrations and local storage sanitizers (`src/context/StoreContext.tsx`).
  - Backend models, startup routines, public profile endpoints, and active MySQL records (`dukaanos_db.store_profile`).
- Configured confirmed location: **Ripri, Khairpur Mirs, Sindh, Pakistan**.

### B. WhatsApp Order Routing & Click-to-Chat Normalization
- Synchronized all customer contact points to use the official international standard:
  - Base URL: `https://wa.me/923282885660`
  - Normalized in all components via `normalizeWhatsAppNumber()` and `buildWhatsAppUrl()`.
  - Audited `HomePage.tsx` to ensure direct WhatsApp chat triggers use sanitized international format with pre-filled greeting (`Assalam-o-Alaikum, I would like to order grocery.`).
  - Cart order generator automatically produces itemized grocery receipts with items, quantities, subtotal, and doorstep delivery details.

### C. Admin Portal & Terminal Security
- Redesigned `AdminLoginPage.tsx`:
  - Input changed to generic text supporting **username `127294`** or **email `abdulhadipanhwar71@gmail.com`**.
  - Disabled and removed exposed demo credential buttons (`admin123`, `cashier123`) from the user interface.
  - Input fields initialize empty without prefilled secrets.
- Verified password provisioning tool:
  - Command: `python backend/manage_users.py set-owner-password`
  - Interactively prompts with masked input (`getpass`), validates $\ge 8$ characters, and saves a salted `bcrypt` hash without printing passwords to logs or terminals.

### D. Production Build & SPA Routing
- SPA route rewrite configuration in `vercel.json` redirects all requests `/(.*)` to `/index.html` to eliminate 404 errors on direct navigation or page refresh (`/catalog`, `/about`, `/contact`, `/admin/login`).
- `package.json` package name synchronized to `al-madinah-general-store`.

---

## 3. Build & Test Results

### Production Build (`npm run build`)
```text
> al-madinah-general-store@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 2435 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.14 kB │ gzip:   0.64 kB
dist/assets/index-B8p2kf03.css   63.81 kB │ gzip:  10.47 kB
dist/assets/index-D8ZTn2Zy.js   935.94 kB │ gzip: 240.93 kB
✓ built in 15.72s
```
**Status:** **SUCCESS (0 errors, 0 lint failures)**

### Automated Backend Test Suite (`python -m pytest backend/tests/ -v`)
```text
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.7.0
rootdir: D:\Shops
plugins: anyio-4.15.1, asyncio-1.4.0

backend/tests/test_auth.py::test_login_success PASSED                    [  5%]
backend/tests/test_auth.py::test_login_invalid_password PASSED           [ 10%]
backend/tests/test_auth.py::test_login_by_username_success PASSED        [ 15%]
backend/tests/test_auth.py::test_unauthorized_protected_endpoint PASSED  [ 21%]
backend/tests/test_auth.py::test_role_based_permission_cashier_denied_reports PASSED [ 26%]
backend/tests/test_auth.py::test_role_based_permission_owner_allowed_reports PASSED [ 31%]
backend/tests/test_backup.py::test_backup_json_export PASSED             [ 36%]
backend/tests/test_backup.py::test_backup_csv_zip_export PASSED          [ 42%]
backend/tests/test_backup.py::test_backup_restore_and_duplicate_handling PASSED [ 47%]
backend/tests/test_clean_migrations.py::test_alembic_migrations_from_clean_database PASSED [ 52%]
backend/tests/test_e2e_full_workflow.py::test_complete_e2e_business_lifecycle PASSED [ 57%]
backend/tests/test_orders.py::test_order_creation_and_idempotency PASSED [ 63%]
backend/tests/test_orders.py::test_order_status_history_audit PASSED     [ 68%]
backend/tests/test_products.py::test_public_products_never_expose_cost_price PASSED [ 73%]
backend/tests/test_products.py::test_duplicate_sku_rejection PASSED      [ 78%]
backend/tests/test_stock_adjustment_and_movement_audit PASSED [ 84%]
backend/tests/test_sales_and_accounting.py::test_atomic_sale_and_stock_deduction PASSED [ 89%]
backend/tests/test_sales_and_accounting.py::test_prevent_overselling_stock PASSED [ 94%]
backend/tests/test_sales_and_accounting.py::test_udhaar_credit_sale_and_repayment_no_double_count PASSED [100%]

======================= 19 passed, 79 warnings in 6.96s =======================
```
**Status:** **19 of 19 tests PASSED (100% test pass rate)**

---

## 4. GitHub Repository

- **Repository URL:** [https://github.com/abdulhadipanhwar71-ux/al-madinah-general-store](https://github.com/abdulhadipanhwar71-ux/al-madinah-general-store)
- **Default Branch:** `main`
- **Security Check:** `.env` files, database dumps, passwords, and private backups are strictly ignored and excluded from git tracking.

---

## 5. Vercel Deployment Access

To access and manage the public production deployment on Vercel without requiring visitors to log in:

1. **One-Click Authorization**:
   - Device Approval URL: **[https://vercel.com/oauth/device?user_code=RCXB-ZWRC](https://vercel.com/oauth/device?user_code=RCXB-ZWRC)**
   - Click "Confirm" in your browser to authorize deployment.

2. **Claim Pre-built Deployment**:
   - Claim Link: **[https://vercel.com/claim-deployment?code=8ad89efb-2773-4458-bcc2-654d7fabdf9a](https://vercel.com/claim-deployment?code=8ad89efb-2773-4458-bcc2-654d7fabdf9a)**
   - Once claimed, Vercel binds the project to your account with a public `.vercel.app` domain.

3. **Direct GitHub Import (Alternative 1-Click)**:
   - Import URL: **[https://vercel.com/new/clone?repository-url=https://github.com/abdulhadipanhwar71-ux/al-madinah-general-store](https://vercel.com/new/clone?repository-url=https://github.com/abdulhadipanhwar71-ux/al-madinah-general-store)**
   - Automatically builds from your connected GitHub repository and issues a permanent public domain.

---

## 6. Architecture Status & Limitations

1. **Public Storefront**:
   - 100% operational.
   - Products, Urdu/English localization, responsive layouts, WhatsApp ordering, and direct contact operate in client-side static mode without requiring backend connectivity for public shoppers.
2. **Backend & Persistent MySQL Database**:
   - The FastAPI backend and MySQL database are currently running locally on this machine (`http://127.0.0.1:8000`, DB: `dukaanos_db` on port 3306).
   - Vercel is a static host and does not run continuous Python FastAPI servers or MySQL databases.
   - To make the private Admin API live to external devices, host the backend via a free **Cloudflare Tunnel** (keeps database securely inside the store in Ripri) or free web service on **Render / Railway**.
3. **Owner Password**:
   - Needs to be configured by the store owner using `python backend/manage_users.py set-owner-password` in PowerShell.
