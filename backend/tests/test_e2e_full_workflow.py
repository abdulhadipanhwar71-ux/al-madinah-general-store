import urllib.parse
from fastapi.testclient import TestClient

def test_complete_e2e_business_lifecycle(client: TestClient, owner_token: str, cashier_token: str):
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    cashier_headers = {"Authorization": f"Bearer {cashier_token}"}

    # -------------------------------------------------------------
    # 1. AUTHENTICATION & RBAC PERMISSION CHECKS
    # -------------------------------------------------------------
    # Unauthenticated access to protected endpoint is denied
    resp_unauth = client.get("/api/admin/products")
    assert resp_unauth.status_code == 401

    # Cashier cannot access owner-only reports or backup
    resp_cashier_report = client.get("/api/admin/reports/summary", headers=cashier_headers)
    assert resp_cashier_report.status_code == 403

    resp_cashier_backup = client.get("/api/admin/backup/export/json", headers=cashier_headers)
    assert resp_cashier_backup.status_code == 403

    # Owner can access reports
    resp_owner_report = client.get("/api/admin/reports/summary", headers=owner_headers)
    assert resp_owner_report.status_code == 200

    # -------------------------------------------------------------
    # 2. CREATE A NEW PRODUCT AND EDIT ITS PRICE
    # -------------------------------------------------------------
    prod_payload = {
        "name": "Organic Honey 500g",
        "urdu_name": "خالص شہد",
        "category": "Pantry",
        "sku": "E2E-HONEY-01",
        "price": 1200.0,
        "cost_price": 900.0,
        "stock": 20,
        "min_stock_level": 5,
        "unit": "jar",
        "is_public": True,
        "featured": True
    }
    create_prod_resp = client.post("/api/admin/products", json=prod_payload, headers=owner_headers)
    assert create_prod_resp.status_code == 201
    prod = create_prod_resp.json()
    prod_id = prod["id"]
    assert prod["price"] == 1200.0
    assert prod["stock"] == 20

    # Edit product price: 1200 -> 1350
    update_resp = client.put(f"/api/admin/products/{prod_id}", json={
        "price": 1350.0,
        "cost_price": 950.0
    }, headers=owner_headers)
    assert update_resp.status_code == 200
    updated_prod = update_resp.json()
    assert updated_prod["price"] == 1350.0

    # Verify public catalog reflects updated price, but never exposes cost_price
    public_prods = client.get("/api/public/products?search=Organic Honey").json()
    assert len(public_prods) >= 1
    found_pub = [p for p in public_prods if p["id"] == prod_id][0]
    assert found_pub["price"] == 1350.0
    assert "cost_price" not in found_pub

    # -------------------------------------------------------------
    # 3. RECEIVE STOCK (RESTOCK) AND VERIFY QUANTITY & AUDIT
    # -------------------------------------------------------------
    adjust_resp = client.post(f"/api/admin/products/{prod_id}/adjust-stock", json={
        "quantity_change": 10,
        "reason": "Shipment from Swat Valley Apiary",
        "type": "restock"
    }, headers=owner_headers)
    assert adjust_resp.status_code == 200
    assert adjust_resp.json()["stock"] == 30  # 20 + 10 = 30

    # Verify Stock Movement audit log
    movements = client.get(f"/api/admin/products/stock-movements?product_id={prod_id}", headers=owner_headers).json()
    assert len(movements) >= 1
    latest_mv = movements[0]
    assert latest_mv["quantity_delta"] == 10
    assert latest_mv["previous_stock"] == 20
    assert latest_mv["new_stock"] == 30

    # -------------------------------------------------------------
    # 4. COMPLETE A POS SALE AND VERIFY STOCK DEDUCTION & COGS
    # -------------------------------------------------------------
    sale_payload = {
        "customer_name": "Tariq Mehmood",
        "items": [
            {"product_id": prod_id, "quantity": 4, "unit_price": 1350.0}
        ],
        "discount": 100.0,
        "tax": 0.0,
        "payment_method": "Cash"
    }
    tx_resp = client.post("/api/admin/transactions", json=sale_payload, headers=cashier_headers)
    assert tx_resp.status_code == 201
    tx = tx_resp.json()
    assert tx["subtotal"] == 5400.0
    assert tx["discount"] == 100.0
    assert tx["total"] == 5300.0
    assert tx["items"][0]["cost_price"] == 950.0  # Preserved historical COGS

    # Verify stock deducted from 30 to 26
    prod_after_sale = client.get(f"/api/admin/products/{prod_id}", headers=owner_headers).json()
    assert prod_after_sale["stock"] == 26

    # -------------------------------------------------------------
    # 5. CREATE CUSTOMER CREDIT SALE (UDHAAR) & PARTIAL REPAYMENT
    # -------------------------------------------------------------
    cust_resp = client.post("/api/admin/customers", json={
        "name": "Dr. Kamran Malik",
        "phone": "0321 8877665",
        "address": "Street 12, F-11/2, Islamabad",
        "balance": 0.0
    }, headers=owner_headers)
    assert cust_resp.status_code == 201
    cust = cust_resp.json()
    cust_id = cust["id"]

    # Execute credit sale of 2 jars (2 * 1350 = 2,700 PKR)
    credit_sale_payload = {
        "customer_id": cust_id,
        "customer_name": cust["name"],
        "customer_phone": cust["phone"],
        "items": [{"product_id": prod_id, "quantity": 2, "unit_price": 1350.0}],
        "payment_method": "Store Credit (Udhaar)"
    }
    cs_resp = client.post("/api/admin/transactions", json=credit_sale_payload, headers=cashier_headers)
    assert cs_resp.status_code == 201

    # Verify customer balance is now 2,700 PKR
    cust_check1 = client.get(f"/api/admin/customers/{cust_id}", headers=owner_headers).json()
    assert cust_check1["balance"] == 2700.0

    # Stock deducted from 26 to 24
    prod_after_credit = client.get(f"/api/admin/products/{prod_id}", headers=owner_headers).json()
    assert prod_after_credit["stock"] == 24

    # Record partial repayment of 1,500 PKR
    repay_resp = client.post(f"/api/admin/customers/{cust_id}/repay", json={
        "amount": 1500.0,
        "payment_method": "EasyPaisa",
        "note": "Partial mobile transfer"
    }, headers=owner_headers)
    assert repay_resp.status_code == 200

    # Customer balance must now be 1,200 PKR
    cust_check2 = client.get(f"/api/admin/customers/{cust_id}", headers=owner_headers).json()
    assert cust_check2["balance"] == 1200.0

    # -------------------------------------------------------------
    # 6. ADD OPERATIONAL EXPENSE & VERIFY FINANCIAL CALCULATIONS
    # -------------------------------------------------------------
    exp_resp = client.post("/api/admin/expenses", json={
        "date": "2026-10-24",
        "category": "Utilities",
        "description": "Store Backup Generator Diesel Fuel",
        "amount": 2500.0,
        "payment_method": "Cash"
    }, headers=owner_headers)
    assert exp_resp.status_code == 201

    # Verify accounting formula:
    # Gross Profit = Sales - COGS
    # Net Profit = Gross Profit - Expenses
    report = client.get("/api/admin/reports/summary", headers=owner_headers).json()
    assert report["gross_profit"] == report["total_sales"] - report["total_cogs"]
    assert report["net_profit"] == report["gross_profit"] - report["total_expenses"]

    # Repayment does NOT count towards sales!
    # Cash sales + Credit sales == Total sales
    assert abs(report["cash_sales_collected"] + report["credit_sales_issued"] - report["total_sales"]) < 0.01

    # -------------------------------------------------------------
    # 7. PUBLIC WEBSITE ORDER, IDEMPOTENCY & STATUS AUDIT TRAIL
    # -------------------------------------------------------------
    web_order_payload = {
        "customer_name": "Ayesha Khan",
        "customer_phone": "0301 2233445",
        "delivery_address": "Apartment 4B, Silver Oaks, F-10, Islamabad",
        "order_notes": "Ring doorbell twice please",
        "subtotal": 1350.0,
        "delivery_charges": 150.0,
        "total": 1500.0,
        "payment_method": "Cash on Delivery",
        "channel": "Web Cart",
        "idempotency_key": "cart_session_e2e_uniq_9988",
        "items": [
            {
                "product_id": prod_id,
                "name": "Organic Honey 500g",
                "quantity": 1,
                "unit_price": 1350.0,
                "total": 1350.0,
                "unit": "jar"
            }
        ]
    }
    # Place order
    order_res1 = client.post("/api/public/orders", json=web_order_payload)
    assert order_res1.status_code == 200
    order = order_res1.json()
    order_id = order["id"]
    order_num = order["order_number"]
    assert order["status"] == "New"

    # Idempotent re-submission (simulating double click or network retry)
    order_res2 = client.post("/api/public/orders", json=web_order_payload)
    assert order_res2.status_code == 200
    assert order_res2.json()["id"] == order_id  # Same order returned!

    # Verify WhatsApp message URL formatting
    store_profile = client.get("/api/public/store-profile").json()
    raw_phone = store_profile["whatsapp_number"]
    normalized_phone = "".join(c for c in raw_phone if c.isdigit())
    if normalized_phone.startswith("03"):
        normalized_phone = "92" + normalized_phone[1:]
    encoded_text = urllib.parse.quote(f"Assalam-o-Alaikum! Inquiring about Order #{order_num}")
    wa_url = f"https://wa.me/{normalized_phone}?text={encoded_text}"
    assert "https://wa.me/92" in wa_url
    assert f"Order%20%23{order_num}" in wa_url

    # Status Workflow: New -> Confirmed -> Out for Delivery -> Completed
    st1 = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Confirmed", "note": "Stock reserved"}, headers=cashier_headers)
    assert st1.status_code == 200
    assert st1.json()["status"] == "Confirmed"

    st2 = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Out for Delivery", "note": "Handed to rider"}, headers=cashier_headers)
    assert st2.status_code == 200

    st3 = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Completed", "note": "Delivered and paid"}, headers=cashier_headers)
    assert st3.status_code == 200

    # Verify full status history trail
    final_order = client.get(f"/api/admin/orders/{order_id}", headers=owner_headers).json()
    history = final_order["status_history"]
    assert len(history) == 4  # New, Confirmed, Out for Delivery, Completed
    statuses = [h["status"] for h in history]
    assert statuses == ["New", "Confirmed", "Out for Delivery", "Completed"]

    # -------------------------------------------------------------
    # 8. EXPORT BACKUP AND RESTORE VERIFICATION
    # -------------------------------------------------------------
    backup_resp = client.get("/api/admin/backup/export/json", headers=owner_headers)
    assert backup_resp.status_code == 200
    backup_data = backup_resp.json()
    assert backup_data["version"] == "3.0"
    assert len(backup_data["products"]) >= 1
    assert len(backup_data["customers"]) >= 1

    # Restore backup payload and verify duplicate detection
    restore_resp = client.post("/api/admin/backup/restore", json=backup_data, headers=owner_headers)
    assert restore_resp.status_code == 200
    res_summary = restore_resp.json()
    assert res_summary["success"] is True
    # Existing products and customers skipped duplicate creation
    assert res_summary["skipped_duplicates"] >= 1
