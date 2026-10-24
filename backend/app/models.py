import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="cashier")  # 'owner' or 'cashier'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class StoreProfile(Base):
    __tablename__ = "store_profile"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False, default="Al-Madinah General Store")
    tagline = Column(String(255), nullable=True, default="Quality Groceries & Daily Essentials in Ripri")
    owner_name = Column(String(100), nullable=False, default="AbdulHadi")
    country_code = Column(String(10), default="+92", nullable=False)
    phone = Column(String(50), nullable=True, default="03282885660")
    whatsapp_number = Column(String(50), nullable=False, default="03282885660")
    email = Column(String(150), nullable=True, default="abdulhadipanhwar71@gmail.com")
    address = Column(Text, nullable=True, default="Ripri, Khairpur Mirs, Sindh, Pakistan")
    city = Column(String(100), nullable=True, default="Khairpur Mirs, Sindh")
    store_hours = Column(String(100), nullable=True, default="8:00 AM - 11:00 PM (Daily)")
    ntn_number = Column(String(50), nullable=True)
    currency = Column(String(10), default="PKR", nullable=False)
    default_low_stock_threshold = Column(Integer, default=10, nullable=False)
    delivery_available = Column(Boolean, default=True, nullable=False)
    delivery_charges = Column(Float, default=100.0, nullable=False)
    free_delivery_threshold = Column(Float, default=2000.0, nullable=False)
    delivery_areas = Column(Text, nullable=True, default="Ripri, Khairpur Mirs and surrounding localities")
    return_policy = Column(Text, nullable=True, default="Defective or damaged packaged products can be exchanged within 24 hours with original receipt. Fresh items must be verified upon delivery.")
    tax_rate = Column(Float, default=0.0, nullable=False)
    receipt_header = Column(Text, nullable=True, default="Bismillah-ir-Rahman-ir-Rahim\nAl-Madinah General Store - Ripri, Khairpur Mirs")
    receipt_footer = Column(Text, nullable=True, default="JazakAllah Khair for shopping at Al-Madinah General Store!")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False, index=True)
    urdu_name = Column(String(200), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)  # Private, never exposed in public API
    stock = Column(Integer, default=0, nullable=False, index=True)
    min_stock_level = Column(Integer, default=10, nullable=False)
    unit = Column(String(50), default="piece", nullable=False)
    image = Column(Text, nullable=True)
    barcode = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="in_stock", nullable=False, index=True)  # 'in_stock', 'low_stock', 'out_of_stock'
    is_public = Column(Boolean, default=True, nullable=False, index=True)
    featured = Column(Boolean, default=False, nullable=False)
    allow_backorder = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)
    expiry_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)  # 'restock', 'sale', 'adjustment', 'damage'
    quantity_delta = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    recorded_by = Column(String(100), default="System", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="stock_movements")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    email = Column(String(150), nullable=True)
    address = Column(Text, nullable=False)
    total_spent = Column(Float, default=0.0, nullable=False)
    total_orders = Column(Integer, default=0, nullable=False)
    balance = Column(Float, default=0.0, nullable=False, index=True)  # Outstanding Udhaar
    membership_tier = Column(String(50), default="Regular", nullable=False)
    last_purchase_date = Column(String(50), nullable=True)
    last_reminder_sent = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    repayments = relationship("CustomerRepayment", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer")

class CustomerRepayment(Base):
    __tablename__ = "customer_repayments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(150), nullable=False)
    date = Column(String(50), nullable=False, index=True)
    time = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    type = Column(String(50), default="payment", nullable=False)  # 'payment' or 'audit_adjustment'
    recorded_by = Column(String(100), default="Staff", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="repayments")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    date = Column(String(50), nullable=False, index=True)
    time = Column(String(50), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    tax = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(50), default="Completed", nullable=False)
    cashier = Column(String(100), default="Cashier", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="transactions")
    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)  # Historical COGS preserved at moment of sale
    total = Column(Float, nullable=False)
    unit = Column(String(50), default="piece", nullable=False)

    transaction = relationship("Transaction", back_populates="items")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(String(50), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    recorded_by = Column(String(100), default="Owner", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class StoreOrder(Base):
    __tablename__ = "store_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), nullable=False, index=True)
    customer_phone = Column(String(50), nullable=False, index=True)
    delivery_address = Column(Text, nullable=False)
    order_notes = Column(Text, nullable=True)
    subtotal = Column(Float, nullable=False)
    delivery_charges = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Cash", nullable=False)
    payment_status = Column(String(50), default="Pending", nullable=False)
    status = Column(String(50), default="New", nullable=False, index=True)
    channel = Column(String(50), default="Web Cart", nullable=False)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    unit = Column(String(50), default="piece", nullable=False)

    order = relationship("StoreOrder", back_populates="items")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    timestamp = Column(String(100), nullable=False)
    updated_by = Column(String(100), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("StoreOrder", back_populates="status_history")
