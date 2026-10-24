import os
import tempfile
import pytest
from sqlalchemy import create_engine, inspect
from alembic.config import Config
from alembic import command

def test_alembic_migrations_from_clean_database():
    """
    Verifies that Alembic migrations run cleanly on a completely empty database,
    creating all expected relational tables, columns, and foreign keys.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        tmp_db_path = tmp_file.name

    try:
        clean_db_url = f"sqlite:///{tmp_db_path}"
        
        # Configure Alembic to point to the clean test database
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
        
        alembic_cfg = Config(alembic_ini_path)
        alembic_cfg.set_main_option("sqlalchemy.url", clean_db_url)
        alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

        # Execute migration upgrade to head
        command.upgrade(alembic_cfg, "head")

        # Inspect generated database tables
        engine = create_engine(clean_db_url)
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())

        expected_tables = {
            "users",
            "store_profile",
            "products",
            "stock_movements",
            "customers",
            "customer_repayments",
            "transactions",
            "transaction_items",
            "expenses",
            "store_orders",
            "order_items",
            "order_status_history",
            "alembic_version"
        }

        missing_tables = expected_tables - tables
        assert not missing_tables, f"Clean migration missed tables: {missing_tables}"

        # Verify key columns exist on products
        product_cols = {col["name"] for col in inspector.get_columns("products")}
        assert "id" in product_cols
        assert "sku" in product_cols
        assert "price" in product_cols
        assert "cost_price" in product_cols
        assert "stock" in product_cols

        # Verify foreign keys on transaction_items
        fks = inspector.get_foreign_keys("transaction_items")
        fk_tables = {fk["referred_table"] for fk in fks}
        assert "transactions" in fk_tables

        engine.dispose()
    finally:
        if os.path.exists(tmp_db_path):
            try:
                os.remove(tmp_db_path)
            except Exception:
                pass
