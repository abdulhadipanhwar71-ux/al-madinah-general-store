"""
DukaanOS Seed & Data Migration Script
Safely populates database with initial products, customers, orders,
transactions, expenses, and user credentials.
"""
import os
import sys

# Ensure backend package is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import engine, Base, SessionLocal
from backend.app import models, auth

def seed_database():
    print("Initializing DukaanOS Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Users
        print("Checking default user accounts...")
        owner = db.query(models.User).filter(
            (models.User.email == "abdulhadipanhwar71@gmail.com") | (models.User.username == "127294")
        ).first()
        if not owner:
            owner = models.User(
                name="AbdulHadi",
                email="abdulhadipanhwar71@gmail.com",
                username="127294",
                hashed_password=auth.get_password_hash("admin123"),
                role="owner",
                is_active=True
            )
            db.add(owner)
            print("  Created Owner: AbdulHadi (abdulhadipanhwar71@gmail.com / username: 127294)")

        cashier = db.query(models.User).filter(models.User.email == "cashier@dukaanos.pk").first()
        if not cashier:
            cashier = models.User(
                name="Ahmed Ali (Cashier)",
                email="cashier@dukaanos.pk",
                username="cashier",
                hashed_password=auth.get_password_hash("cashier123"),
                role="cashier",
                is_active=True
            )
            db.add(cashier)
            print("  Created Cashier: cashier@dukaanos.pk / cashier123")

        # 2. Store Profile
        print("Checking store profile...")
        profile = db.query(models.StoreProfile).first()
        if not profile:
            profile = models.StoreProfile(
                name="Al-Madinah General Store",
                tagline="Quality Grocery & Household Essentials at Wholesome Prices",
                owner_name="AbdulHadi",
                country_code="+92",
                phone="03282885660",
                whatsapp_number="03282885660",
                email="abdulhadipanhwar71@gmail.com",
                address="Ripri, Khairpur Mirs, Sindh, Pakistan",
                city="Khairpur Mirs, Sindh",
                store_hours="8:00 AM - 11:00 PM (Daily)",
                ntn_number="7492810-4",
                currency="PKR",
                default_low_stock_threshold=10,
                delivery_available=True,
                delivery_charges=100.0,
                free_delivery_threshold=2000.0,
                delivery_areas="Ripri and adjoining areas (Khairpur Mirs)",
                return_policy="Defective or damaged packaged products can be exchanged within 24 hours with original receipt. Fresh produce must be verified upon delivery.",
                tax_rate=0.0,
                receipt_header="Bismillah-ir-Rahman-ir-Rahim\nAl-Madinah General Store - Ripri, Khairpur Mirs",
                receipt_footer="JazakAllah Khair for shopping with us! Please verify items before leaving."
            )
            db.add(profile)
            print("  Created default StoreProfile.")

        # 3. Products
        print("Checking product catalog...")
        sample_products = [
            {
                "id": "prod-1",
                "name": "Red Delicious Apples (Swat)",
                "urdu_name": "سواتی سیب",
                "category": "Fresh Produce",
                "sku": "DK-APL-001",
                "price": 320.0,
                "cost_price": 240.0,
                "stock": 45,
                "min_stock_level": 15,
                "unit": "kg",
                "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964001001",
                "status": "in_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "Crisp and juicy hand-picked organic red apples from high-altitude Swat orchards.",
                "expiry_date": "2026-11-05"
            },
            {
                "id": "prod-2",
                "name": "Farm Fresh Potatoes (Aloo)",
                "urdu_name": "تازہ آلو",
                "category": "Fresh Produce",
                "sku": "DK-VEG-002",
                "price": 95.0,
                "cost_price": 70.0,
                "stock": 180,
                "min_stock_level": 30,
                "unit": "kg",
                "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964001002",
                "status": "in_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "Grade-A firm red potatoes, ideal for handi, curries, and french fries.",
                "expiry_date": "2026-11-20"
            },
            {
                "id": "prod-3",
                "name": "Fresh Pink Onions (Piyaz)",
                "urdu_name": "دیسی پیاز",
                "category": "Fresh Produce",
                "sku": "DK-VEG-003",
                "price": 140.0,
                "cost_price": 105.0,
                "stock": 12,
                "min_stock_level": 25,
                "unit": "kg",
                "image": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964001003",
                "status": "low_stock",
                "is_public": True,
                "featured": False,
                "allow_backorder": False,
                "description": "Pungent, dry-skinned cooking onions sourced directly from Sindh farmlands.",
                "expiry_date": "2026-11-15"
            },
            {
                "id": "prod-6",
                "name": "Super Kernel Basmati Rice (5kg)",
                "urdu_name": "کرنل باسمتی چاول 5 کلو",
                "category": "Grains & Pulses",
                "sku": "DK-GRN-006",
                "price": 1750.0,
                "cost_price": 1450.0,
                "stock": 34,
                "min_stock_level": 10,
                "unit": "bag",
                "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964002001",
                "status": "in_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "Aged long-grain aromatic Basmati rice. Non-sticky, perfect for biryani and pulao.",
                "expiry_date": "2027-05-15"
            },
            {
                "id": "prod-7",
                "name": "Whole Wheat Chakki Atta (10kg)",
                "urdu_name": "چکی کا خالص آٹا 10 کلو",
                "category": "Grains & Pulses",
                "sku": "DK-GRN-007",
                "price": 1350.0,
                "cost_price": 1180.0,
                "stock": 5,
                "min_stock_level": 15,
                "unit": "bag",
                "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964002002",
                "status": "low_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "Stone-ground 100% whole wheat flour, rich in natural dietary fiber for soft rotis.",
                "expiry_date": "2026-12-10"
            },
            {
                "id": "prod-9",
                "name": "Daal Moong Washed (1kg)",
                "urdu_name": "دال مونگ دھلی ہوئی",
                "category": "Grains & Pulses",
                "sku": "DK-GRN-009",
                "price": 340.0,
                "cost_price": 275.0,
                "stock": 0,
                "min_stock_level": 12,
                "unit": "kg",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964002004",
                "status": "out_of_stock",
                "is_public": True,
                "featured": False,
                "allow_backorder": False,
                "description": "Polished split yellow moong lentils with quick cooking and light texture.",
                "expiry_date": "2027-01-20"
            },
            {
                "id": "prod-10",
                "name": "Dalda Cooking Oil (5L Tin)",
                "urdu_name": "ڈالڈا کوکنگ آئل 5 لٹر",
                "category": "Oils & Ghee",
                "sku": "DK-OIL-010",
                "price": 2780.0,
                "cost_price": 2490.0,
                "stock": 22,
                "min_stock_level": 8,
                "unit": "can",
                "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964003001",
                "status": "in_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "Triple refined premium cooking oil with VTF and Vitamins A, D & E.",
                "expiry_date": "2027-08-30"
            },
            {
                "id": "prod-13",
                "name": "Olper's Full Cream Milk (1L)",
                "urdu_name": "اولپرز خالص دودھ 1 لٹر",
                "category": "Dairy & Beverages",
                "sku": "DK-DRY-013",
                "price": 290.0,
                "cost_price": 262.0,
                "stock": 48,
                "min_stock_level": 20,
                "unit": "pack",
                "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
                "barcode": "8964004001",
                "status": "in_stock",
                "is_public": True,
                "featured": True,
                "allow_backorder": False,
                "description": "UHT-treated rich homogenized whole dairy milk for chai and desserts.",
                "expiry_date": "2027-01-15"
            }
        ]

        for p_data in sample_products:
            existing = db.query(models.Product).filter(models.Product.id == p_data["id"]).first()
            if not existing:
                prod = models.Product(**p_data)
                db.add(prod)
        print(f"  Catalog ready ({len(sample_products)} items verified).")

        # 4. Customers
        print("Checking customer ledger accounts...")
        sample_customers = [
            {
                "id": "cust-1",
                "name": "Haji Muhammad Tariq",
                "phone": "0300 9876543",
                "email": "haji.tariq@gmail.com",
                "address": "House 42, Street 8, F-10/2, Islamabad",
                "total_spent": 148500.0,
                "total_orders": 34,
                "balance": 14200.0,
                "membership_tier": "VIP",
                "last_purchase_date": "2026-10-24"
            },
            {
                "id": "cust-2",
                "name": "Malik Zafar Iqbal",
                "phone": "0333 5123456",
                "email": "m.zafar@yahoo.com",
                "address": "Flat 3-A, Mehran Heights, G-10 Markaz, Islamabad",
                "total_spent": 62400.0,
                "total_orders": 18,
                "balance": 4650.0,
                "membership_tier": "Gold",
                "last_purchase_date": "2026-10-22"
            },
            {
                "id": "cust-3",
                "name": "Dr. Sadia Farooq",
                "phone": "0312 9988776",
                "email": "sadia.farooq@shifa.com.pk",
                "address": "Villa 19, Sector F-11/4, Islamabad",
                "total_spent": 215000.0,
                "total_orders": 52,
                "balance": 0.0,
                "membership_tier": "VIP",
                "last_purchase_date": "2026-10-24"
            },
            {
                "id": "cust-4",
                "name": "Master Muhammad Irfan",
                "phone": "0345 7766554",
                "email": "irfan.teacher@edu.pk",
                "address": "Quarter 12, Police Line Road, H-11, Islamabad",
                "total_spent": 38900.0,
                "total_orders": 14,
                "balance": 8200.0,
                "membership_tier": "Silver",
                "last_purchase_date": "2026-10-21"
            },
            {
                "id": "cust-5",
                "name": "Mrs. Shakeel Ur Rehman",
                "phone": "0301 2233445",
                "email": "shakeel.family@gmail.com",
                "address": "Plot 115, Phase 4, Bahria Town, Rawalpindi",
                "total_spent": 94300.0,
                "total_orders": 27,
                "balance": 0.0,
                "membership_tier": "Gold",
                "last_purchase_date": "2026-10-24"
            }
        ]

        for c_data in sample_customers:
            existing = db.query(models.Customer).filter(models.Customer.id == c_data["id"]).first()
            if not existing:
                cust = models.Customer(**c_data)
                db.add(cust)
        print(f"  Customer ledger ready ({len(sample_customers)} accounts verified).")

        # 5. Customer Repayments (DOES NOT COUNT AS SALES REVENUE)
        print("Checking repayment history...")
        sample_repayments = [
            {
                "id": "rep-1",
                "customer_id": "cust-1",
                "customer_name": "Haji Muhammad Tariq",
                "date": "2026-10-22",
                "time": "04:15 PM",
                "amount": 5000.0,
                "payment_method": "Cash",
                "note": "Weekly Udhaar installment paid in cash at counter",
                "type": "payment",
                "recorded_by": "Ahmed Ali"
            },
            {
                "id": "rep-2",
                "customer_id": "cust-4",
                "customer_name": "Master Muhammad Irfan",
                "date": "2026-10-19",
                "time": "11:00 AM",
                "amount": 3000.0,
                "payment_method": "EasyPaisa",
                "note": "Monthly salary credited partial settlement",
                "type": "payment",
                "recorded_by": "Ahmed Ali"
            }
        ]
        for r_data in sample_repayments:
            if not db.query(models.CustomerRepayment).filter(models.CustomerRepayment.id == r_data["id"]).first():
                rep = models.CustomerRepayment(**r_data)
                db.add(rep)

        # 6. Expenses
        print("Checking store expenses...")
        sample_expenses = [
            {
                "id": "exp-1",
                "date": "2026-10-24",
                "category": "Electricity & Generator",
                "description": "Generator diesel top-up (20 Litres for load-shedding backup)",
                "amount": 5800.0,
                "payment_method": "Cash",
                "recorded_by": "AbdulHadi (Owner)"
            },
            {
                "id": "exp-2",
                "date": "2026-10-23",
                "category": "Packaging & Bags",
                "description": "Biodegradable shopping bags & vegetable packaging pouches",
                "amount": 2400.0,
                "payment_method": "Cash",
                "recorded_by": "Ahmed Ali"
            },
            {
                "id": "exp-3",
                "date": "2026-10-22",
                "category": "Carriage & Freight",
                "description": "Sabzi Mandi goods transport van freight fare",
                "amount": 1800.0,
                "payment_method": "Cash",
                "recorded_by": "Ahmed Ali"
            }
        ]
        for e_data in sample_expenses:
            if not db.query(models.Expense).filter(models.Expense.id == e_data["id"]).first():
                exp = models.Expense(**e_data)
                db.add(exp)

        # 7. Orders
        print("Checking store orders...")
        sample_orders = [
            {
                "id": "ord-101",
                "order_number": "ORD-9021",
                "customer_name": "Mrs. Shakeel Ur Rehman",
                "customer_phone": "0301 2233445",
                "delivery_address": "Plot 115, Phase 4, Bahria Town, Rawalpindi",
                "order_notes": "Please ring bell twice. Deliver between 3:00 PM and 5:00 PM.",
                "subtotal": 5690.0,
                "delivery_charges": 0.0,
                "total": 5690.0,
                "payment_method": "Cash",
                "payment_status": "Pending",
                "status": "Awaiting Confirmation",
                "channel": "Web Cart",
                "items": [
                    {"product_id": "prod-10", "name": "Dalda Cooking Oil (5L Tin)", "quantity": 1, "unit_price": 2780.0, "total": 2780.0, "unit": "can"},
                    {"product_id": "prod-6", "name": "Super Kernel Basmati Rice (5kg)", "quantity": 1, "unit_price": 1750.0, "total": 1750.0, "unit": "bag"},
                    {"product_id": "prod-13", "name": "Olper's Full Cream Milk (1L)", "quantity": 4, "unit_price": 290.0, "total": 1160.0, "unit": "pack"},
                ],
                "status_history": [
                    {"status": "New", "timestamp": "2026-10-24 10:15 AM", "updated_by": "Web Cart", "note": "Customer dispatched list via website"},
                    {"status": "Awaiting Confirmation", "timestamp": "2026-10-24 10:20 AM", "updated_by": "Ahmed Ali", "note": "Checked stock availability"}
                ]
            },
            {
                "id": "ord-102",
                "order_number": "ORD-9020",
                "customer_name": "Dr. Sadia Farooq",
                "customer_phone": "0333 4567890",
                "delivery_address": "Apartment B-4, Silver Oaks, F-10, Islamabad",
                "order_notes": "Fresh Swat apples only, no bruised pieces.",
                "subtotal": 2000.0,
                "delivery_charges": 150.0,
                "total": 2150.0,
                "payment_method": "EasyPaisa",
                "payment_status": "Paid",
                "status": "Preparing",
                "channel": "WhatsApp",
                "items": [
                    {"product_id": "prod-1", "name": "Red Delicious Apples (Swat)", "quantity": 3, "unit_price": 320.0, "total": 960.0, "unit": "kg"},
                    {"product_id": "prod-13", "name": "Olper's Full Cream Milk (1L)", "quantity": 4, "unit_price": 290.0, "total": 1160.0, "unit": "pack"},
                ],
                "status_history": [
                    {"status": "New", "timestamp": "2026-10-24 09:00 AM", "updated_by": "WhatsApp Desk", "note": "Direct message inquiry"},
                    {"status": "Confirmed", "timestamp": "2026-10-24 09:10 AM", "updated_by": "Ahmed Ali", "note": "Advance payment received via EasyPaisa"},
                    {"status": "Preparing", "timestamp": "2026-10-24 09:30 AM", "updated_by": "Ahmed Ali", "note": "Rider packing bag"}
                ]
            }
        ]

        for o_data in sample_orders:
            if not db.query(models.StoreOrder).filter(models.StoreOrder.id == o_data["id"]).first():
                items_data = o_data.pop("items")
                hist_data = o_data.pop("status_history")
                order = models.StoreOrder(**o_data)
                db.add(order)
                db.flush()

                for it in items_data:
                    item_obj = models.OrderItem(order_id=order.id, **it)
                    db.add(item_obj)

                for h in hist_data:
                    hist_obj = models.OrderStatusHistory(order_id=order.id, **h)
                    db.add(hist_obj)

        # 8. Transactions & Sale Items
        print("Checking completed POS sales...")
        sample_txs = [
            {
                "id": "txn-101",
                "invoice_number": "INV-2026-1049",
                "date": "2026-10-24",
                "time": "11:42 AM",
                "customer_id": "cust-1",
                "customer_name": "Haji Muhammad Tariq",
                "customer_phone": "0300 9876543",
                "subtotal": 5560.0,
                "discount": 100.0,
                "tax": 0.0,
                "total": 5460.0,
                "payment_method": "Store Credit (Udhaar)",
                "status": "Completed",
                "cashier": "Ahmed Ali",
                "items": [
                    {"product_id": "prod-10", "name": "Dalda Cooking Oil (5L Tin)", "sku": "DK-OIL-010", "quantity": 2, "unit_price": 2780.0, "cost_price": 2490.0, "total": 5560.0, "unit": "can"},
                ]
            },
            {
                "id": "txn-102",
                "invoice_number": "INV-2026-1048",
                "date": "2026-10-24",
                "time": "10:15 AM",
                "customer_id": "cust-3",
                "customer_name": "Dr. Sadia Farooq",
                "customer_phone": "0312 9988776",
                "subtotal": 1750.0,
                "discount": 0.0,
                "tax": 0.0,
                "total": 1750.0,
                "payment_method": "Debit / Credit Card",
                "status": "Completed",
                "cashier": "Ahmed Ali",
                "items": [
                    {"product_id": "prod-6", "name": "Super Kernel Basmati Rice (5kg)", "sku": "DK-GRN-006", "quantity": 1, "unit_price": 1750.0, "cost_price": 1450.0, "total": 1750.0, "unit": "bag"}
                ]
            }
        ]

        for t_data in sample_txs:
            if not db.query(models.Transaction).filter(models.Transaction.id == t_data["id"]).first():
                items_data = t_data.pop("items")
                tx = models.Transaction(**t_data)
                db.add(tx)
                db.flush()

                for it in items_data:
                    ti = models.TransactionItem(transaction_id=tx.id, **it)
                    db.add(ti)

        db.commit()
        print("Database seed completed successfully with zero errors!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
