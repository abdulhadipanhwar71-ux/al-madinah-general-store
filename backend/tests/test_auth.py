from backend.app import models, auth

def test_login_success(client, db):
    # Ensure user exists in db
    user = db.query(models.User).filter(models.User.email == "login_test@dukaanos.pk").first()
    if not user:
        user = models.User(
            name="Login Tester",
            email="login_test@dukaanos.pk",
            hashed_password=auth.get_password_hash("secret123"),
            role="owner",
            is_active=True
        )
        db.add(user)
        db.commit()

    resp = client.post("/api/auth/login", json={
        "email": "login_test@dukaanos.pk",
        "password": "secret123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "owner"
    assert data["email"] == "login_test@dukaanos.pk"

def test_login_invalid_password(client, db):
    resp = client.post("/api/auth/login", json={
        "email": "login_test@dukaanos.pk",
        "password": "wrong_password"
    })
    assert resp.status_code == 401
    assert "Invalid email" in resp.json()["detail"]

def test_login_by_username_success(client, db):
    # Verify login by preferred admin username (127294)
    user = db.query(models.User).filter(models.User.username == "127294").first()
    if not user:
        user = models.User(
            name="AbdulHadi",
            email="abdulhadipanhwar71@gmail.com",
            username="127294",
            hashed_password=auth.get_password_hash("password123"),
            role="owner",
            is_active=True
        )
        db.add(user)
        db.commit()
    else:
        user.hashed_password = auth.get_password_hash("password123")
        db.commit()

    resp = client.post("/api/auth/login", json={
        "email": "127294",
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "owner"
    assert data["username"] == "127294"

def test_unauthorized_protected_endpoint(client):
    # Attempt to access admin products without token
    resp = client.get("/api/admin/products")
    assert resp.status_code == 401

def test_role_based_permission_cashier_denied_reports(client, cashier_token):
    # Cashier should be denied access to owner-only financial reports
    headers = {"Authorization": f"Bearer {cashier_token}"}
    resp = client.get("/api/admin/reports/summary", headers=headers)
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]

def test_role_based_permission_owner_allowed_reports(client, owner_token):
    # Owner should be allowed access to financial reports
    headers = {"Authorization": f"Bearer {owner_token}"}
    resp = client.get("/api/admin/reports/summary", headers=headers)
    assert resp.status_code == 200
