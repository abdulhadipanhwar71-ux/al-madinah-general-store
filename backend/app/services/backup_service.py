import io
import json
import zipfile
import csv
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app import models

def export_full_backup_json(db: Session) -> Dict[str, Any]:
    """
    Exports complete database tables into structured JSON.
    """
    profile = db.query(models.StoreProfile).first()
    products = db.query(models.Product).all()
    customers = db.query(models.Customer).all()
    transactions = db.query(models.Transaction).all()
    expenses = db.query(models.Expense).all()
    repayments = db.query(models.CustomerRepayment).all()
    orders = db.query(models.StoreOrder).all()
    movements = db.query(models.StockMovement).all()

    def serialize_profile(p: models.StoreProfile) -> dict:
        if not p:
            return {}
        return {
            "name": p.name,
            "tagline": p.tagline,
            "owner_name": p.owner_name,
            "country_code": p.country_code,
            "phone": p.phone,
            "whatsapp_number": p.whatsapp_number,
            "email": p.email,
            "address": p.address,
            "city": p.city,
            "store_hours": p.store_hours,
            "ntn_number": p.ntn_number,
            "currency": p.currency,
            "default_low_stock_threshold": p.default_low_stock_threshold,
            "delivery_available": p.delivery_available,
            "delivery_charges": p.delivery_charges,
            "free_delivery_threshold": p.free_delivery_threshold,
            "delivery_areas": p.delivery_areas,
            "return_policy": p.return_policy,
            "receipt_header": p.receipt_header,
            "receipt_footer": p.receipt_footer,
        }

    return {
        "version": "3.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "store_profile": serialize_profile(profile),
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "urdu_name": p.urdu_name,
                "category": p.category,
                "sku": p.sku,
                "price": p.price,
                "cost_price": p.cost_price,
                "stock": p.stock,
                "min_stock_level": p.min_stock_level,
                "unit": p.unit,
                "image": p.image,
                "barcode": p.barcode,
                "status": p.status,
                "is_public": p.is_public,
                "featured": p.featured,
                "allow_backorder": p.allow_backorder,
                "description": p.description,
                "expiry_date": p.expiry_date,
            }
            for p in products
        ],
        "customers": [
            {
                "id": c.id,
                "name": c.name,
                "phone": c.phone,
                "email": c.email,
                "address": c.address,
                "total_spent": c.total_spent,
                "total_orders": c.total_orders,
                "balance": c.balance,
                "membership_tier": c.membership_tier,
                "last_purchase_date": c.last_purchase_date,
                "last_reminder_sent": c.last_reminder_sent,
            }
            for c in customers
        ],
        "transactions": [
            {
                "id": t.id,
                "invoice_number": t.invoice_number,
                "date": t.date,
                "time": t.time,
                "customer_id": t.customer_id,
                "customer_name": t.customer_name,
                "customer_phone": t.customer_phone,
                "subtotal": t.subtotal,
                "discount": t.discount,
                "tax": t.tax,
                "total": t.total,
                "payment_method": t.payment_method,
                "status": t.status,
                "cashier": t.cashier,
                "items": [
                    {
                        "product_id": i.product_id,
                        "name": i.name,
                        "sku": i.sku,
                        "quantity": i.quantity,
                        "unit_price": i.unit_price,
                        "cost_price": i.cost_price,
                        "total": i.total,
                        "unit": i.unit,
                    }
                    for i in t.items
                ]
            }
            for t in transactions
        ],
        "expenses": [
            {
                "id": e.id,
                "date": e.date,
                "category": e.category,
                "description": e.description,
                "amount": e.amount,
                "payment_method": e.payment_method,
                "recorded_by": e.recorded_by,
            }
            for e in expenses
        ],
        "repayments": [
            {
                "id": r.id,
                "customer_id": r.customer_id,
                "customer_name": r.customer_name,
                "date": r.date,
                "time": r.time,
                "amount": r.amount,
                "payment_method": r.payment_method,
                "note": r.note,
                "type": r.type,
                "recorded_by": r.recorded_by,
            }
            for r in repayments
        ],
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "customer_phone": o.customer_phone,
                "delivery_address": o.delivery_address,
                "order_notes": o.order_notes,
                "subtotal": o.subtotal,
                "delivery_charges": o.delivery_charges,
                "total": o.total,
                "payment_method": o.payment_method,
                "payment_status": o.payment_status,
                "status": o.status,
                "channel": o.channel,
                "idempotency_key": o.idempotency_key,
                "items": [
                    {
                        "product_id": i.product_id,
                        "name": i.name,
                        "quantity": i.quantity,
                        "unit_price": i.unit_price,
                        "total": i.total,
                        "unit": i.unit,
                    }
                    for i in o.items
                ],
                "status_history": [
                    {
                        "status": h.status,
                        "timestamp": h.timestamp,
                        "updated_by": h.updated_by,
                        "note": h.note,
                    }
                    for h in o.status_history
                ]
            }
            for o in orders
        ],
        "stock_movements": [
            {
                "id": m.id,
                "product_id": m.product_id,
                "product_name": m.product_name,
                "sku": m.sku,
                "date": m.date,
                "type": m.type,
                "quantity_delta": m.quantity_delta,
                "previous_stock": m.previous_stock,
                "new_stock": m.new_stock,
                "reason": m.reason,
                "recorded_by": m.recorded_by,
            }
            for m in movements
        ]
    }

def export_backup_csv_zip(db: Session) -> bytes:
    """
    Generates a ZIP archive containing CSV files of all business tables.
    """
    backup_data = export_full_backup_json(db)
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # 1. Products CSV
        products_out = io.StringIO()
        if backup_data["products"]:
            writer = csv.DictWriter(products_out, fieldnames=list(backup_data["products"][0].keys()))
            writer.writeheader()
            writer.writerows(backup_data["products"])
        zip_file.writestr("products.csv", products_out.getvalue())

        # 2. Customers CSV
        cust_out = io.StringIO()
        if backup_data["customers"]:
            writer = csv.DictWriter(cust_out, fieldnames=list(backup_data["customers"][0].keys()))
            writer.writeheader()
            writer.writerows(backup_data["customers"])
        zip_file.writestr("customers.csv", cust_out.getvalue())

        # 3. Sales CSV
        sales_out = io.StringIO()
        flat_sales = []
        for s in backup_data["transactions"]:
            s_copy = {k: v for k, v in s.items() if k != "items"}
            flat_sales.append(s_copy)
        if flat_sales:
            writer = csv.DictWriter(sales_out, fieldnames=list(flat_sales[0].keys()))
            writer.writeheader()
            writer.writerows(flat_sales)
        zip_file.writestr("sales_transactions.csv", sales_out.getvalue())

        # 4. Expenses CSV
        exp_out = io.StringIO()
        if backup_data["expenses"]:
            writer = csv.DictWriter(exp_out, fieldnames=list(backup_data["expenses"][0].keys()))
            writer.writeheader()
            writer.writerows(backup_data["expenses"])
        zip_file.writestr("expenses.csv", exp_out.getvalue())

        # 5. Orders CSV
        ord_out = io.StringIO()
        flat_orders = []
        for o in backup_data["orders"]:
            o_copy = {k: v for k, v in o.items() if k not in ["items", "status_history"]}
            flat_orders.append(o_copy)
        if flat_orders:
            writer = csv.DictWriter(ord_out, fieldnames=list(flat_orders[0].keys()))
            writer.writeheader()
            writer.writerows(flat_orders)
        zip_file.writestr("orders.csv", ord_out.getvalue())

        # 6. Repayments CSV
        rep_out = io.StringIO()
        if backup_data["repayments"]:
            writer = csv.DictWriter(rep_out, fieldnames=list(backup_data["repayments"][0].keys()))
            writer.writeheader()
            writer.writerows(backup_data["repayments"])
        zip_file.writestr("repayments.csv", rep_out.getvalue())

    zip_buffer.seek(0)
    return zip_buffer.getvalue()

def restore_backup_json(db: Session, payload: dict) -> dict:
    """
    Safely restores / imports records from a JSON backup.
    Performs duplicate checking and validation before inserting.
    """
    if not isinstance(payload, dict) or "products" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid backup payload format. Missing 'products' array."
        )

    imported_products = 0
    imported_customers = 0
    imported_transactions = 0
    imported_expenses = 0
    imported_repayments = 0
    imported_orders = 0
    skipped_duplicates = 0

    try:
        # 1. Store Profile
        if payload.get("store_profile"):
            prof_data = payload["store_profile"]
            prof = db.query(models.StoreProfile).first()
            if not prof:
                prof = models.StoreProfile()
                db.add(prof)
            for k, v in prof_data.items():
                if hasattr(prof, k):
                    setattr(prof, k, v)

        # 2. Products (Check by SKU)
        for p in payload.get("products", []):
            existing = db.query(models.Product).filter(
                (models.Product.id == p.get("id")) | (models.Product.sku == p.get("sku"))
            ).first()
            if existing:
                skipped_duplicates += 1
                continue

            new_prod = models.Product(
                id=p.get("id"),
                name=p["name"],
                urdu_name=p.get("urdu_name"),
                category=p["category"],
                sku=p["sku"],
                price=float(p["price"]),
                cost_price=float(p.get("cost_price", p["price"] * 0.8)),
                stock=int(p.get("stock", 0)),
                min_stock_level=int(p.get("min_stock_level", 10)),
                unit=p.get("unit", "piece"),
                image=p.get("image"),
                barcode=p.get("barcode"),
                status=p.get("status", "in_stock"),
                is_public=p.get("is_public", True),
                featured=p.get("featured", False),
                allow_backorder=p.get("allow_backorder", False),
                description=p.get("description"),
                expiry_date=p.get("expiry_date"),
            )
            db.add(new_prod)
            imported_products += 1

        # 3. Customers (Check by ID or Phone)
        for c in payload.get("customers", []):
            existing = db.query(models.Customer).filter(
                (models.Customer.id == c.get("id")) | (models.Customer.phone == c.get("phone"))
            ).first()
            if existing:
                skipped_duplicates += 1
                continue

            new_cust = models.Customer(
                id=c.get("id"),
                name=c["name"],
                phone=c["phone"],
                email=c.get("email"),
                address=c.get("address", "Local"),
                total_spent=float(c.get("total_spent", 0.0)),
                total_orders=int(c.get("total_orders", 0)),
                balance=float(c.get("balance", 0.0)),
                membership_tier=c.get("membership_tier", "Regular"),
                last_purchase_date=c.get("last_purchase_date"),
                last_reminder_sent=c.get("last_reminder_sent"),
            )
            db.add(new_cust)
            imported_customers += 1

        # 4. Expenses (Check by ID)
        for e in payload.get("expenses", []):
            if e.get("id") and db.query(models.Expense).filter(models.Expense.id == e["id"]).first():
                skipped_duplicates += 1
                continue
            new_exp = models.Expense(
                id=e.get("id"),
                date=e["date"],
                category=e["category"],
                description=e["description"],
                amount=float(e["amount"]),
                payment_method=e.get("payment_method", "Cash"),
                recorded_by=e.get("recorded_by", "Owner"),
            )
            db.add(new_exp)
            imported_expenses += 1

        # 5. Repayments (Check by ID)
        for r in payload.get("repayments", []):
            if r.get("id") and db.query(models.CustomerRepayment).filter(models.CustomerRepayment.id == r["id"]).first():
                skipped_duplicates += 1
                continue
            new_rep = models.CustomerRepayment(
                id=r.get("id"),
                customer_id=r["customer_id"],
                customer_name=r["customer_name"],
                date=r["date"],
                time=r.get("time", "12:00 PM"),
                amount=float(r["amount"]),
                payment_method=r.get("payment_method", "Cash"),
                note=r.get("note"),
                type=r.get("type", "payment"),
                recorded_by=r.get("recorded_by", "Staff"),
            )
            db.add(new_rep)
            imported_repayments += 1

        # 6. Transactions (Check by invoice_number or ID)
        for t in payload.get("transactions", []):
            if db.query(models.Transaction).filter(
                (models.Transaction.id == t.get("id")) | (models.Transaction.invoice_number == t.get("invoice_number"))
            ).first():
                skipped_duplicates += 1
                continue

            new_tx = models.Transaction(
                id=t.get("id"),
                invoice_number=t["invoice_number"],
                date=t["date"],
                time=t.get("time", "12:00 PM"),
                customer_id=t.get("customer_id"),
                customer_name=t.get("customer_name", "Walk-in Customer"),
                customer_phone=t.get("customer_phone"),
                subtotal=float(t["subtotal"]),
                discount=float(t.get("discount", 0.0)),
                tax=float(t.get("tax", 0.0)),
                total=float(t["total"]),
                payment_method=t.get("payment_method", "Cash"),
                status=t.get("status", "Completed"),
                cashier=t.get("cashier", "Cashier"),
            )
            db.add(new_tx)
            db.flush()

            for item in t.get("items", []):
                ti = models.TransactionItem(
                    transaction_id=new_tx.id,
                    product_id=item.get("product_id"),
                    name=item["name"],
                    sku=item.get("sku", "SKU-AUTO"),
                    quantity=int(item["quantity"]),
                    unit_price=float(item["unit_price"]),
                    cost_price=float(item.get("cost_price", item["unit_price"] * 0.8)),
                    total=float(item["total"]),
                    unit=item.get("unit", "piece"),
                )
                db.add(ti)
            imported_transactions += 1

        # 7. Orders (Check by order_number or ID)
        for o in payload.get("orders", []):
            if db.query(models.StoreOrder).filter(
                (models.StoreOrder.id == o.get("id")) | (models.StoreOrder.order_number == o.get("order_number"))
            ).first():
                skipped_duplicates += 1
                continue

            new_ord = models.StoreOrder(
                id=o.get("id"),
                order_number=o["order_number"],
                customer_name=o["customer_name"],
                customer_phone=o["customer_phone"],
                delivery_address=o["delivery_address"],
                order_notes=o.get("order_notes"),
                subtotal=float(o["subtotal"]),
                delivery_charges=float(o.get("delivery_charges", 0.0)),
                total=float(o["total"]),
                payment_method=o.get("payment_method", "Cash"),
                payment_status=o.get("payment_status", "Pending"),
                status=o.get("status", "New"),
                channel=o.get("channel", "Web Cart"),
                idempotency_key=o.get("idempotency_key"),
            )
            db.add(new_ord)
            db.flush()

            for item in o.get("items", []):
                oi = models.OrderItem(
                    order_id=new_ord.id,
                    product_id=item.get("product_id"),
                    name=item["name"],
                    quantity=int(item["quantity"]),
                    unit_price=float(item["unit_price"]),
                    total=float(item["total"]),
                    unit=item.get("unit", "piece"),
                )
                db.add(oi)

            for hist in o.get("status_history", []):
                osh = models.OrderStatusHistory(
                    order_id=new_ord.id,
                    status=hist["status"],
                    timestamp=hist["timestamp"],
                    updated_by=hist.get("updated_by", "Staff"),
                    note=hist.get("note"),
                )
                db.add(osh)
            imported_orders += 1

        db.commit()

        return {
            "success": True,
            "message": "Backup data restored successfully with duplicate protection.",
            "imported_products": imported_products,
            "imported_customers": imported_customers,
            "imported_transactions": imported_transactions,
            "imported_expenses": imported_expenses,
            "imported_repayments": imported_repayments,
            "imported_orders": imported_orders,
            "skipped_duplicates": skipped_duplicates,
        }

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Restore operation failed: {str(exc)}"
        )
