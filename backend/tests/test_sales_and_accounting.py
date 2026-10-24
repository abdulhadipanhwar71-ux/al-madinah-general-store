def test_atomic_sale_and_stock_deduction(client, cashier_token):
    headers = {"Authorization": f"Bearer {cashier_token}"}

    # 1. Create a product with known stock and cost
    prod_data = {
        "name": "Sale Test Oil",
        "category": "Oils & Ghee",
        "sku": "SALE-OIL-01",
        "price": 1000.0,
        "cost_price": 800.0,
        "stock": 10,
        "min_stock_level": 5
    }
    prod = client.post("/api/admin/products", json=prod_data, headers=headers).json()
    prod_id = prod["id"]

    # 2. Execute POS sale of 3 units
    sale_payload = {
        "customer_name": "Walk-in Cash Customer",
        "items": [
            {"product_id": prod_id, "quantity": 3, "unit_price": 1000.0}
        ],
        "discount": 0.0,
        "tax": 0.0,
        "payment_method": "Cash"
    }
    tx_resp = client.post("/api/admin/transactions", json=sale_payload, headers=headers)
    assert tx_resp.status_code == 201
    tx_data = tx_resp.json()
    assert tx_data["total"] == 3000.0
    assert tx_data["items"][0]["cost_price"] == 800.0  # Historical COGS preserved

    # 3. Verify product stock decreased from 10 to 7
    updated_prod = client.get(f"/api/admin/products?search=SALE-OIL-01", headers=headers).json()[0]
    assert updated_prod["stock"] == 7

def test_prevent_overselling_stock(client, cashier_token):
    headers = {"Authorization": f"Bearer {cashier_token}"}

    # Create product with 5 in stock
    prod = client.post("/api/admin/products", json={
        "name": "Limited Stock Sugar",
        "category": "Pantry",
        "sku": "LIMIT-SUGAR-01",
        "price": 150.0,
        "cost_price": 120.0,
        "stock": 5,
        "min_stock_level": 2,
        "allow_backorder": False
    }, headers=headers).json()

    # Attempt to sell 6 units
    sale_payload = {
        "customer_name": "Greedy Buyer",
        "items": [{"product_id": prod["id"], "quantity": 6, "unit_price": 150.0}],
        "payment_method": "Cash"
    }
    resp = client.post("/api/admin/transactions", json=sale_payload, headers=headers)
    assert resp.status_code == 400
    assert "Insufficient inventory" in resp.json()["detail"]

    # Stock must remain intact at 5!
    check_prod = client.get(f"/api/admin/products?search=LIMIT-SUGAR-01", headers=headers).json()[0]
    assert check_prod["stock"] == 5

def test_udhaar_credit_sale_and_repayment_no_double_count(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. Create a customer with 0 balance
    cust = client.post("/api/admin/customers", json={
        "name": "Chaudhry Credit Test",
        "phone": "0300 1112233",
        "address": "F-10, Islamabad",
        "balance": 0.0
    }, headers=headers).json()
    cust_id = cust["id"]

    # 2. Create product
    prod = client.post("/api/admin/products", json={
        "name": "Tea Pack Credit",
        "category": "Beverages",
        "sku": "TEA-CREDIT-01",
        "price": 500.0,
        "cost_price": 400.0,
        "stock": 20
    }, headers=headers).json()

    # Get initial financial report
    initial_report = client.get("/api/admin/reports/summary", headers=headers).json()

    # 3. Execute credit sale of 2 packs (Total = 1,000 PKR on Udhaar)
    sale_resp = client.post("/api/admin/transactions", json={
        "customer_id": cust_id,
        "customer_name": cust["name"],
        "customer_phone": cust["phone"],
        "items": [{"product_id": prod["id"], "quantity": 2, "unit_price": 500.0}],
        "payment_method": "Store Credit (Udhaar)"
    }, headers=headers)
    assert sale_resp.status_code == 201

    # Customer balance must now be 1,000 PKR
    cust_after_sale = client.get(f"/api/admin/customers/{cust_id}", headers=headers).json()
    assert cust_after_sale["balance"] == 1000.0

    # 4. Customer pays back 600 PKR counter repayment
    repay_resp = client.post(f"/api/admin/customers/{cust_id}/repay", json={
        "amount": 600.0,
        "payment_method": "Cash",
        "note": "Partial weekly settlement"
    }, headers=headers)
    assert repay_resp.status_code == 200

    # Customer balance must now be 400 PKR
    cust_after_repay = client.get(f"/api/admin/customers/{cust_id}", headers=headers).json()
    assert cust_after_repay["balance"] == 400.0

    # 5. ACCOUNTING VALIDATION:
    # Repayment must NOT increase sales revenue!
    # Total sales should have increased only by the 1,000 PKR sale, NOT by 1,000 + 600!
    updated_report = client.get("/api/admin/reports/summary", headers=headers).json()
    sales_diff = updated_report["total_sales"] - initial_report["total_sales"]
    assert sales_diff == 1000.0  # Exactly 1,000, NOT 1,600!
    assert updated_report["credit_sales_issued"] - initial_report["credit_sales_issued"] == 1000.0
    assert updated_report["total_repayments_collected"] - initial_report["total_repayments_collected"] == 600.0
