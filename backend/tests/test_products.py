def test_public_products_never_expose_cost_price(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    
    # 1. Create a product as admin
    prod_data = {
        "name": "Secret Profit Biscuits",
        "category": "Snacks & Bakery",
        "sku": "DK-SNK-999",
        "price": 100.0,
        "cost_price": 40.0,  # 60% margin - MUST NOT LEAK TO PUBLIC
        "stock": 50,
        "min_stock_level": 10,
        "unit": "pack",
        "is_public": True
    }
    create_resp = client.post("/api/admin/products", json=prod_data, headers=headers)
    assert create_resp.status_code == 201

    # 2. Query public storefront catalog
    public_resp = client.get("/api/public/products")
    assert public_resp.status_code == 200
    public_items = public_resp.json()
    
    found = [p for p in public_items if p["sku"] == "DK-SNK-999"]
    assert len(found) == 1
    # STRICT SECURITY CHECK: cost_price must NOT be in public payload!
    assert "cost_price" not in found[0]
    assert found[0]["price"] == 100.0

def test_duplicate_sku_rejection(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    prod = {
        "name": "Duplicate SKU Item A",
        "category": "Grains & Pulses",
        "sku": "UNIQUE-SKU-100",
        "price": 500.0,
        "cost_price": 400.0,
        "stock": 10,
        "min_stock_level": 5
    }
    resp1 = client.post("/api/admin/products", json=prod, headers=headers)
    assert resp1.status_code == 201

    # Attempt to create another product with same SKU
    prod["name"] = "Duplicate SKU Item B"
    resp2 = client.post("/api/admin/products", json=prod, headers=headers)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"]

def test_stock_adjustment_and_movement_audit(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    prod = {
        "name": "Audit Test Rice",
        "category": "Grains & Pulses",
        "sku": "DK-AUDIT-001",
        "price": 2000.0,
        "cost_price": 1600.0,
        "stock": 20,
        "min_stock_level": 10
    }
    create_resp = client.post("/api/admin/products", json=prod, headers=headers)
    assert create_resp.status_code == 201
    prod_id = create_resp.json()["id"]

    # Adjust stock: Restock +15 bags
    adjust_resp = client.post(
        f"/api/admin/products/{prod_id}/adjust-stock",
        json={"quantity_change": 15, "reason": "Supplier shipment received", "type": "restock"},
        headers=headers
    )
    assert adjust_resp.status_code == 200
    assert adjust_resp.json()["stock"] == 35

    # Check stock movements
    mv_resp = client.get("/api/admin/stock-movements", headers=headers)
    assert mv_resp.status_code == 200
    movements = mv_resp.json()
    assert any(m["product_id"] == prod_id and m["quantity_delta"] == 15 for m in movements)
