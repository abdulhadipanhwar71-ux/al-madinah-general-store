import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Use test SQLite database
os.environ["DATABASE_URL"] = "sqlite:///./test_dukaanos.db"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_1234567890_test_secret_key_1234567890"

from backend.app.database import Base, get_db
from backend.app import models, auth
from backend.app.main import app

# Create SQLite engine for tests
TEST_DB_URL = "sqlite:///./test_dukaanos.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Pre-seed persistent test users for the test session
    session = TestingSessionLocal()
    owner = models.User(
        name="AbdulHadi (Test Owner)",
        email="test_owner@dukaanos.pk",
        username="127294",
        hashed_password=auth.get_password_hash("password123"),
        role="owner",
        is_active=True
    )
    cashier = models.User(
        name="Test Cashier",
        email="test_cashier@dukaanos.pk",
        hashed_password=auth.get_password_hash("password123"),
        role="cashier",
        is_active=True
    )
    session.add_all([owner, cashier])
    session.commit()
    session.close()

    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_dukaanos.db"):
        try:
            os.remove("./test_dukaanos.db")
        except Exception:
            pass

@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def owner_token(db):
    owner = db.query(models.User).filter(models.User.email == "test_owner@dukaanos.pk").first()
    return auth.create_access_token(data={"sub": owner.id, "role": owner.role, "email": owner.email})

@pytest.fixture
def cashier_token(db):
    cashier = db.query(models.User).filter(models.User.email == "test_cashier@dukaanos.pk").first()
    return auth.create_access_token(data={"sub": cashier.id, "role": cashier.role, "email": cashier.email})
