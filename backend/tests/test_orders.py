def test_order_creation_and_idempotency(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. Order payload with unique idempotency key
    order_payload = {
        "customer_name": "Idempotent Buyer",
        "customer_phone": "0300 9988776",
        "delivery_address": "House 10, Street 5, F-10/2, Islamabad",
        "order_notes": "Handle with care",
        "subtotal": 2000.0,
        "delivery_charges": 150.0,
        "total": 2150.0,
        "payment_method": "Cash",
        "channel": "Web Cart",
        "idempotency_key": "cart_session_token_abc123",
        "items": [
            {
                "product_id": "test-prod-1",
                "name": "Super Basmati Rice",
                "quantity": 1,
                "unit_price": 2000.0,
                "total": 2000.0,
                "unit": "bag"
            }
        ]
    }

    # First submission
    resp1 = client.post("/api/public/orders", json=order_payload)
    assert resp1.status_code == 200
    order1 = resp1.json()
    assert order1["status"] == "New"
    order_id = order1["id"]
    order_num = order1["order_number"]

    # Second submission (simulating network retry or double click)
    resp2 = client.post("/api/public/orders", json=order_payload)
    assert resp2.status_code == 200
    order2 = resp2.json()

    # IDEMPOTENCY CHECK: Identical order ID and number returned, no duplicate created!
    assert order2["id"] == order_id
    assert order2["order_number"] == order_num

    # Verify orders count in admin panel: only 1 order exists for this customer
    all_orders = client.get("/api/admin/orders?search=0300 9988776", headers=headers).json()
    assert len(all_orders) == 1

def test_order_status_history_audit(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. Place order
    order = client.post("/api/public/orders", json={
        "customer_name": "Audit Customer",
        "customer_phone": "0333 4445556",
        "delivery_address": "G-10, Islamabad",
        "subtotal": 1000.0,
        "total": 1000.0,
        "items": [{"product_id": "p1", "name": "Milk", "quantity": 2, "unit_price": 500.0, "total": 1000.0}]
    }).json()

    order_id = order["id"]

    # 2. Update status: New -> Confirmed
    up1 = client.patch(f"/api/admin/orders/{order_id}/status", json={
        "status": "Confirmed",
        "note": "Payment verified via EasyPaisa"
    }, headers=headers)
    assert up1.status_code == 200
    assert up1.json()["status"] == "Confirmed"

    # 3. Update status: Confirmed -> Out for Delivery
    up2 = client.patch(f"/api/admin/orders/{order_id}/status", json={
        "status": "Out for Delivery",
        "note": "Dispatched with rider Kashif on Honda CD70"
    }, headers=headers)
    assert up2.status_code == 200

    # 4. Fetch order and verify audit history trail
    final_order = client.get(f"/api/admin/orders/{order_id}", headers=headers).json()
    history = final_order["status_history"]
    assert len(history) == 3  # New, Confirmed, Out for Delivery
    statuses = [h["status"] for h in history]
    assert "New" in statuses
    assert "Confirmed" in statuses
    assert "Out for Delivery" in statuses
