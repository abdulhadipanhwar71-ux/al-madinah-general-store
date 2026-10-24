# DukaanOS — Public General Store Website & Private Admin Platform

DukaanOS is a complete retail solution comprising two cleanly separated experiences:
1. **Public-Facing General Store Website:** Modern grocery retail website for customers to explore fresh produce, staples, daily rates, and order directly via WhatsApp or grocery basket.
2. **Private Administrative Operations Console:** Dedicated, authenticated portal (`/admin`) for store owners and cashiers to manage products, prices, stock thresholds, sales, customer Udhaar (credit ledger), operational expenses, and profit reports.

---

## 🌐 Public Store Website Experience (Part A)

- **Routes:**
  - `/` — Homepage with grocery retail hero banner, daily specials, department shortcuts, and WhatsApp order guide.
  - `/catalog` — Full store catalog with instant search, category filtering, stock availability, and "Add to Basket" buttons.
  - `/categories` — Clean aisle cards across Fresh Produce, Grains & Pulses, Cooking Oils, Dairy & Beverages, Spices, Snacks, and Household items.
  - `/about` — Store story (Al-Madinah General Store, Ripri, Khairpur Mirs), procurement quality standards, and guarantees.
  - `/contact` — Physical location in Ripri, Khairpur Mirs, Sindh, Pakistan, store timings (8:00 AM - 11:00 PM), direct WhatsApp counter button (`03282885660`), and message inquiry form.
- **Customer Grocery Basket (`CartDrawer`):**
  - Instant slide-over drawer displaying selected items, quantities, and subtotal in PKR.
  - Generates pre-formatted WhatsApp order messages ready to send with one click.
- **Privacy & Security Guarantee:**
  - Public website does **NOT** expose internal cost prices, margins, supplier data, total revenue, customer balances, or admin controls.
  - Customer portraits/avatars have been completely removed.

---

## 🔒 Private Admin Panel Experience (Part B)

- **Authentication Guard:** Accessible only via `/admin/login` or authenticated session.
- **Routes:**
  - `/admin/login` — Dedicated administrator login supporting username (`127294`) or email.
  - `/admin` — Admin Dashboard with Today's Sales, Orders, Expenses, Gross Profit, Net Profit, and Reorder warnings.
  - `/admin/products` — Product Management (Create, Edit name/price/cost/stock/threshold, enable/disable from public storefront, barcode management).
  - `/admin/inventory` — Stock Control & Thresholds (Custom reorder threshold per product, settings default threshold, movement audit ledger).
  - `/admin/sales` — POS Register & Invoices (Product search, live cart, cash/digital/credit payment modes, printable receipt slips).
  - `/admin/customers` — Customer Credit & Udhaar Ledger (Clean initials-based profiles, record repayments without treating as sales, auditable balance corrections).
  - `/admin/expenses` — Store Expense Tracker (Rent, Electricity/Generator fuel, Staff Wages, Packaging, Freight).
  - `/admin/reports` — Financial Analytics (Sales, COGS, Gross Profit = Sales - COGS, Net Profit = Gross Profit - Expenses, Inventory Asset Valuation, CSV Export).
  - `/admin/backup` — Database Backup & Disaster Recovery (Export full JSON Schema v3.0, download multi-table CSV ZIP archive, safe restore with duplicate detection).
  - `/admin/settings` — Store Identity, Public WhatsApp Number, Default Low-Stock Threshold, and Thermal Receipt Header/Footer.

### Staff Credentials
- **Store Owner:** `AbdulHadi` (Email: `abdulhadipanhwar71@gmail.com` | Preferred Username: `127294`)
- **Shift Cashier:** `cashier@dukaanos.pk` / `cashier123` (Counter POS & order processing)

---

## 📊 Business Logic & Accounting Rules (Part C)
1. **Single Source of Truth:** Changes to product selling prices in the Admin panel immediately reflect on the public website and in new sales.
2. **Historical Preservations:** Existing completed sales preserve their original transaction unit price and historical cost price (COGS).
3. **Credit Repayments:** Customer repayments accurately decrease outstanding Udhaar balances and are **never** counted as new sales revenue.
4. **Profit Equations:**
   - $\text{Gross Profit} = \text{Sales Revenue} - \text{Cost of Goods Sold (COGS)}$
   - $\text{Net Profit} = \text{Gross Profit} - \text{Recorded Expenses}$
5. **Concurrency & Oversell Protection:** Database transactions and row locks ensure stock deductions either succeed together or rollback without overselling limited inventory.

---

## 🚀 Running the Project

### 1. Backend Server (FastAPI + MySQL / SQLite)
```bash
# Seed initial database
python backend/seed_data.py

# Launch FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Frontend Development Server (React + Vite)
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

### 3. Automated Backend Pytest Suite
```bash
python -m pytest backend/tests/ -v
```
Runs 16 comprehensive unit & integration tests covering auth, RBAC permissions, atomic POS sales, oversell prevention, Udhaar accounting, order idempotency, and disaster recovery exports.

