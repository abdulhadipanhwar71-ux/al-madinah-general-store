export type ProductCategory = 
  | 'All'
  | 'Fresh Produce'
  | 'Grains & Pulses'
  | 'Oils & Ghee'
  | 'Dairy & Beverages'
  | 'Spices & Condiments'
  | 'Snacks & Bakery'
  | 'Household & Cleaning';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  urduName?: string;
  category: ProductCategory;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockLevel: number; // Custom threshold per product
  unit: string;
  image: string;
  barcode: string;
  status: StockStatus;
  isPublic: boolean; // Enable or disable from public website
  featured?: boolean;
  allowBackorder?: boolean; // When true, allow ordering even when stock is 0
  description?: string;
  expiryDate?: string;
}

export type PaymentMethod = 'Cash' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'Store Credit (Udhaar)';

export type TransactionStatus = 'Completed' | 'Pending' | 'Refunded';

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  cashier: string;
}

// Order Management Types
export type OrderStatus = 
  | 'New'
  | 'Awaiting Confirmation'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  channel: 'WhatsApp' | 'Phone' | 'Counter' | 'Web Cart';
  createdAt: string;
}

export interface CustomerRepayment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  type: 'payment' | 'audit_adjustment';
  recordedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalSpent: number;
  totalOrders: number;
  balance: number; // Outstanding Udhaar (Store Credit)
  lastPurchaseDate: string;
  lastReminderSent?: string;
  membershipTier: 'Regular' | 'Silver' | 'Gold' | 'VIP';
}

export type ExpenseCategory = 
  | 'Shop Rent'
  | 'Electricity & Generator'
  | 'Staff Wages'
  | 'Packaging & Bags'
  | 'Carriage & Freight'
  | 'Store Maintenance'
  | 'Municipal & Taxes'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash';
  recordedBy: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  date: string;
  type: 'restock' | 'sale' | 'adjustment' | 'damage';
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason?: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  ownerName: string;
  countryCode: string; // e.g. +92
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  storeHours: string;
  ntnNumber: string;
  currency: string;
  defaultLowStockThreshold: number; // Configurable default in settings
  deliveryAvailable: boolean;
  deliveryCharges: number;
  freeDeliveryThreshold: number;
  deliveryAreas: string;
  returnPolicy: string;
  taxRate: number;
  receiptHeader: string;
  receiptFooter: string;
  theme: 'light' | 'dark';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  requiresAction?: boolean;
}

export interface DailySalesRecord {
  day: string;
  sales: number;
  cogs: number; // Cost of Goods Sold
  profit: number; // Gross profit = sales - cogs
  expenses: number;
  netProfit: number; // Gross profit - expenses
  orders: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  token?: string;
}

export interface BackupRestoreResult {
  success: boolean;
  message: string;
  imported_products: number;
  imported_customers: number;
  imported_transactions: number;
  imported_expenses: number;
  imported_repayments: number;
  imported_orders: number;
  skipped_duplicates: number;
}

export interface PublicCartItem {
  product: Product;
  quantity: number;
}

