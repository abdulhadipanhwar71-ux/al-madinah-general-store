import io
import zipfile

def test_backup_json_export(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    resp = client.get("/api/admin/backup/export/json", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "version" in data
    assert "products" in data
    assert "customers" in data
    assert "transactions" in data
    assert "expenses" in data
    assert "orders" in data

def test_backup_csv_zip_export(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    resp = client.get("/api/admin/backup/export/csv", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"

    # Verify zip content contains all business tables
    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf, "r") as zf:
        file_list = zf.namelist()
        assert "products.csv" in file_list
        assert "customers.csv" in file_list
        assert "sales_transactions.csv" in file_list
        assert "expenses.csv" in file_list
        assert "orders.csv" in file_list
        assert "repayments.csv" in file_list

def test_backup_restore_and_duplicate_handling(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    payload = {
        "version": "3.0",
        "exported_at": "2026-10-24T12:00:00Z",
        "products": [
            {
                "id": "restore-prod-101",
                "name": "Restored Spice Pack",
                "category": "Spices & Condiments",
                "sku": "RESTORE-SPICE-01",
                "price": 250.0,
                "cost_price": 180.0,
                "stock": 40,
                "min_stock_level": 10,
                "unit": "pack",
                "is_public": True
            }
        ],
        "customers": [
            {
                "id": "restore-cust-101",
                "name": "Restored Customer",
                "phone": "0311 9988112",
                "address": "F-11, Islamabad",
                "total_spent": 5000.0,
                "total_orders": 2,
                "balance": 1500.0,
                "membership_tier": "Silver"
            }
        ]
    }

    # First restore
    resp1 = client.post("/api/admin/backup/restore", json=payload, headers=headers)
    assert resp1.status_code == 200
    res1 = resp1.json()
    assert res1["success"] is True
    assert res1["imported_products"] == 1
    assert res1["imported_customers"] == 1

    # Second restore with same payload -> DUPLICATE DETECTION CHECK
    resp2 = client.post("/api/admin/backup/restore", json=payload, headers=headers)
    assert resp2.status_code == 200
    res2 = resp2.json()
    assert res2["skipped_duplicates"] >= 2  # Product & customer detected as duplicate!
