from typing import List, Optional, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str = Field(..., description="Email or username", min_length=1)
    password: str = Field(min_length=4)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    username: Optional[str] = None
    role: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    username: Optional[str] = None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, description="Minimum 8 characters")

# --- Store Profile Schemas ---
class StoreProfileBase(BaseModel):
    name: str
    tagline: Optional[str] = None
    owner_name: str
    country_code: str = "+92"
    phone: Optional[str] = None
    whatsapp_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    store_hours: Optional[str] = None
    ntn_number: Optional[str] = None
    currency: str = "PKR"
    default_low_stock_threshold: int = 10
    delivery_available: bool = True
    delivery_charges: float = 150.0
    free_delivery_threshold: float = 2500.0
    delivery_areas: Optional[str] = None
    return_policy: Optional[str] = None
    tax_rate: float = 0.0
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None

class StoreProfilePublicResponse(BaseModel):
    name: str
    tagline: Optional[str] = None
    owner_name: str
    country_code: str
    phone: Optional[str] = None
    whatsapp_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    store_hours: Optional[str] = None
    currency: str
    delivery_available: bool
    delivery_charges: float
    free_delivery_threshold: float
    delivery_areas: Optional[str] = None
    return_policy: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StoreProfileResponse(StoreProfileBase):
    id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StoreProfileUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    owner_name: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    store_hours: Optional[str] = None
    ntn_number: Optional[str] = None
    default_low_stock_threshold: Optional[int] = None
    delivery_available: Optional[bool] = None
    delivery_charges: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    delivery_areas: Optional[str] = None
    return_policy: Optional[str] = None
    tax_rate: Optional[float] = None
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None

# --- Product Schemas ---
class ProductPublicResponse(BaseModel):
    """PUBLIC Product View — NEVER exposes cost_price or margins!"""
    id: str
    name: str
    urdu_name: Optional[str] = None
    category: str
    sku: str
    price: float
    stock: int
    unit: str
    image: Optional[str] = None
    status: str
    is_public: bool
    featured: bool
    allow_backorder: bool
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProductAdminResponse(BaseModel):
    """ADMIN Product View — includes cost_price, barcode, expiry, min stock"""
    id: str
    name: str
    urdu_name: Optional[str] = None
    category: str
    sku: str
    price: float
    cost_price: float
    stock: int
    min_stock_level: int
    unit: str
    image: Optional[str] = None
    barcode: Optional[str] = None
    status: str
    is_public: bool
    featured: bool
    allow_backorder: bool
    description: Optional[str] = None
    expiry_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    name: str = Field(min_length=2)
    urdu_name: Optional[str] = None
    category: str
    sku: str = Field(min_length=2)
    price: float = Field(gt=0)
    cost_price: float = Field(ge=0)
    stock: int = Field(ge=0, default=0)
    min_stock_level: int = Field(ge=1, default=10)
    unit: str = "piece"
    image: Optional[str] = None
    barcode: Optional[str] = None
    is_public: bool = True
    featured: bool = False
    allow_backorder: bool = False
    description: Optional[str] = None
    expiry_date: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    urdu_name: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    cost_price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    min_stock_level: Optional[int] = Field(default=None, ge=1)
    unit: Optional[str] = None
    image: Optional[str] = None
    barcode: Optional[str] = None
    is_public: Optional[bool] = None
    featured: Optional[bool] = None
    allow_backorder: Optional[bool] = None
    description: Optional[str] = None
    expiry_date: Optional[str] = None

# --- Stock Adjust Schemas ---
class StockMovementResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    sku: str
    date: str
    type: str
    quantity_delta: int
    previous_stock: int
    new_stock: int
    reason: Optional[str] = None
    recorded_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StockAdjustRequest(BaseModel):
    quantity_change: int
    reason: Optional[str] = None
    type: str = "adjustment"  # 'restock', 'sale', 'adjustment', 'damage'

# --- Customer & Udhaar Schemas ---
class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    membership_tier: str = "Regular"

class CustomerCreate(CustomerBase):
    balance: float = 0.0

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    membership_tier: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: str
    total_spent: float
    total_orders: int
    balance: float
    last_purchase_date: Optional[str] = None
    last_reminder_sent: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerRepaymentCreate(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = "Cash"
    note: Optional[str] = None
    type: str = "payment"  # 'payment' or 'audit_adjustment'

class CustomerRepaymentResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    date: str
    time: str
    amount: float
    payment_method: str
    note: Optional[str] = None
    type: str
    recorded_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Transaction (Sale) Schemas ---
class TransactionItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)

class TransactionItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    name: str
    sku: str
    quantity: int
    unit_price: float
    cost_price: float
    total: float
    unit: str

    model_config = ConfigDict(from_attributes=True)

class TransactionCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str = "Walk-in Customer"
    customer_phone: Optional[str] = None
    items: List[TransactionItemCreate]
    discount: float = 0.0
    tax: float = 0.0
    payment_method: str = "Cash"

class TransactionResponse(BaseModel):
    id: str
    invoice_number: str
    date: str
    time: str
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: Optional[str] = None
    subtotal: float
    discount: float
    tax: float
    total: float
    payment_method: str
    status: str
    cashier: str
    created_at: datetime
    items: List[TransactionItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- Expense Schemas ---
class ExpenseCreate(BaseModel):
    date: str
    category: str
    description: str
    amount: float = Field(gt=0)
    payment_method: str = "Cash"

class ExpenseResponse(BaseModel):
    id: str
    date: str
    category: str
    description: str
    amount: float
    payment_method: str
    recorded_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: Optional[str] = None
    name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    total: float = Field(ge=0)
    unit: str = "piece"

class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    name: str
    quantity: int
    unit_price: float
    total: float
    unit: str

    model_config = ConfigDict(from_attributes=True)

class OrderStatusHistoryResponse(BaseModel):
    id: str
    status: str
    timestamp: str
    updated_by: str
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StoreOrderCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    customer_phone: str = Field(min_length=7)
    delivery_address: str
    order_notes: Optional[str] = None
    items: List[OrderItemCreate]
    subtotal: float = Field(ge=0)
    delivery_charges: float = Field(ge=0, default=0.0)
    total: float = Field(gt=0)
    payment_method: str = "Cash"
    channel: str = "Web Cart"
    idempotency_key: Optional[str] = None  # Key to prevent duplicate submissions

class StoreOrderUpdateStatus(BaseModel):
    status: str
    note: Optional[str] = None

class StoreOrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    customer_phone: str
    delivery_address: str
    order_notes: Optional[str] = None
    subtotal: float
    delivery_charges: float
    total: float
    payment_method: str
    payment_status: str
    status: str
    channel: str
    idempotency_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    status_history: List[OrderStatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- Accounting & Reports ---
class FinancialSummaryResponse(BaseModel):
    total_sales: float
    total_cogs: float
    gross_profit: float
    total_expenses: float
    net_profit: float
    total_orders: int
    total_receivable_udhaar: float
    total_repayments_collected: float
    cash_sales_collected: float
    credit_sales_issued: float

# --- Backup & Restore ---
class BackupDataPayload(BaseModel):
    version: str = "3.0"
    exported_at: str
    store_profile: Optional[dict] = None
    products: List[dict] = []
    customers: List[dict] = []
    transactions: List[dict] = []
    expenses: List[dict] = []
    repayments: List[dict] = []
    orders: List[dict] = []
    stock_movements: List[dict] = []

class BackupRestoreResult(BaseModel):
    success: bool
    message: str
    imported_products: int
    imported_customers: int
    imported_transactions: int
    imported_expenses: int
    imported_repayments: int
    imported_orders: int
    skipped_duplicates: int
