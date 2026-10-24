import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Transaction, 
  Customer, 
  StoreProfile, 
  NotificationItem,
  Expense,
  CustomerRepayment,
  StockMovement,
  PublicCartItem,
  StoreOrder,
  OrderStatus
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CUSTOMERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_STORE_PROFILE,
  INITIAL_EXPENSES,
  INITIAL_REPAYMENTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_ORDERS
} from '../data/mockData';
import { WhatsAppMessageModal } from '../components/modals/WhatsAppMessageModal';
import { Language, TranslationKey, getTranslation } from '../utils/translations';

interface StoreContextType {
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  expenses: Expense[];
  repayments: CustomerRepayment[];
  stockMovements: StockMovement[];
  notifications: NotificationItem[];
  storeProfile: StoreProfile;
  orders: StoreOrder[];
  theme: 'light' | 'dark';
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  toggleTheme: () => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'status'>) => { success: boolean; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  toggleProductPublic: (id: string) => void;

  // Inventory actions
  updateStock: (productId: string, quantityChange: number, reason?: string, type?: 'restock' | 'sale' | 'adjustment' | 'damage') => void;

  // Sales & POS
  addTransaction: (newTx: Omit<Transaction, 'id' | 'invoiceNumber'>) => Transaction;
  
  // Customer & Udhaar
  addCustomer: (cust: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'lastPurchaseDate'>) => void;
  recordRepayment: (
    customerId: string, 
    amount: number, 
    paymentMethod: any, 
    note?: string, 
    type?: 'payment' | 'audit_adjustment'
  ) => void;
  updateCustomerReminder: (customerId: string) => void;

  // Orders Management
  createOrder: (orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'statusHistory' | 'createdAt'>) => StoreOrder;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string, updatedBy?: string) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: 'Pending' | 'Paid') => void;
  deleteOrder: (orderId: string) => void;

  // WhatsApp Global Messenger Modal
  whatsAppModal: { isOpen: boolean; phone: string; name?: string; message: string; title?: string };
  openWhatsAppModal: (phone: string, message: string, name?: string, title?: string) => void;
  closeWhatsAppModal: () => void;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Store Profile & Settings
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;

  // Modals & UI States
  activeInvoice: Transaction | null;
  setActiveInvoice: (tx: Transaction | null) => void;
  activeQuickModal: 'newSale' | 'addStock' | 'addProduct' | 'addCustomer' | 'addExpense' | null;
  setActiveQuickModal: (modal: 'newSale' | 'addStock' | 'addProduct' | 'addCustomer' | 'addExpense' | null) => void;

  // Public Storefront Cart
  publicCart: PublicCartItem[];
  addToPublicCart: (product: Product, quantity?: number) => void;
  updatePublicCartQty: (productId: string, quantity: number) => void;
  removeFromPublicCart: (productId: string) => void;
  clearPublicCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dukaanos_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dukaanos_txs_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dukaanos_customers_v2');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('dukaanos_expenses_v2');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [repayments, setRepayments] = useState<CustomerRepayment[]>(() => {
    const saved = localStorage.getItem('dukaanos_repayments_v2');
    return saved ? JSON.parse(saved) : INITIAL_REPAYMENTS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('dukaanos_stock_mv_v2');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('dukaanos_notifications_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    const saved = localStorage.getItem('dukaanos_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem('dukaanos_profile_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber === '0300 5544332' || parsed.name?.includes('Gernal') || parsed.name === 'Al-Madina Super Store') {
          return {
            ...parsed,
            name: 'Al-Madinah General Store',
            ownerName: 'AbdulHadi',
            whatsappNumber: '03282885660',
            phone: '03282885660',
            address: 'Ripri, Khairpur Mirs, Sindh, Pakistan',
            city: 'Khairpur Mirs, Sindh',
            email: 'abdulhadipanhwar71@gmail.com'
          };
        }
        return parsed;
      } catch (e) {
        return INITIAL_STORE_PROFILE;
      }
    }
    return INITIAL_STORE_PROFILE;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dukaanos_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dukaanos_language');
    return saved === 'ur' ? 'ur' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(key, language);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('dukaanos_language', language);
  }, [language]);

  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [activeInvoice, setActiveInvoice] = useState<Transaction | null>(null);
  const [activeQuickModal, setActiveQuickModal] = useState<'newSale' | 'addStock' | 'addProduct' | 'addCustomer' | 'addExpense' | null>(null);

  // WhatsApp Global Messenger modal
  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    phone: string;
    name?: string;
    message: string;
    title?: string;
  }>({
    isOpen: false,
    phone: '',
    name: '',
    message: '',
    title: ''
  });

  const openWhatsAppModal = (phone: string, message: string, name?: string, title?: string) => {
    setWhatsAppModal({
      isOpen: true,
      phone,
      message,
      name,
      title: title || 'Send WhatsApp Message'
    });
  };

  const closeWhatsAppModal = () => {
    setWhatsAppModal(prev => ({ ...prev, isOpen: false }));
  };

  // Public Cart state
  const [publicCart, setPublicCart] = useState<PublicCartItem[]>(() => {
    const saved = localStorage.getItem('dukaanos_pub_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dukaanos_theme', theme);
  }, [theme]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('dukaanos_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dukaanos_txs_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dukaanos_customers_v2', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dukaanos_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('dukaanos_repayments_v2', JSON.stringify(repayments));
  }, [repayments]);

  useEffect(() => {
    localStorage.setItem('dukaanos_stock_mv_v2', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('dukaanos_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dukaanos_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dukaanos_profile_v2', JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem('dukaanos_pub_cart', JSON.stringify(publicCart));
  }, [publicCart]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addProduct = (newProdData: Omit<Product, 'id' | 'status'>) => {
    if (!newProdData.name.trim()) return { success: false, error: 'Product name is required.' };
    if (!newProdData.sku.trim()) return { success: false, error: 'SKU is required.' };
    if (newProdData.price <= 0) return { success: false, error: 'Price must be greater than 0.' };
    if (newProdData.stock < 0) return { success: false, error: 'Stock cannot be negative.' };

    const minLevel = newProdData.minStockLevel || storeProfile.defaultLowStockThreshold || 10;
    const status: Product['status'] = 
      newProdData.stock === 0 ? 'out_of_stock' : 
      newProdData.stock <= minLevel ? 'low_stock' : 'in_stock';

    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      minStockLevel: minLevel,
      status,
      isPublic: newProdData.isPublic !== undefined ? newProdData.isPublic : true,
      image: newProdData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    };

    setProducts(prev => [newProduct, ...prev]);

    // Initial stock movement
    if (newProduct.stock > 0) {
      const movement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        date: new Date().toLocaleString(),
        type: 'restock',
        quantityDelta: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Initial catalog creation stock count'
      };
      setStockMovements(prev => [movement, ...prev]);
    }

    return { success: true };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const existing = products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Product not found.' };

    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const merged = { ...p, ...updates };
      const minLevel = merged.minStockLevel || storeProfile.defaultLowStockThreshold || 10;
      const status: Product['status'] = 
        merged.stock === 0 ? 'out_of_stock' : 
        merged.stock <= minLevel ? 'low_stock' : 'in_stock';
      return { ...merged, status };
    }));

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductPublic = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p));
  };

  const updateStock = (
    productId: string, 
    quantityChange: number, 
    reason?: string,
    type: 'restock' | 'sale' | 'adjustment' | 'damage' = 'restock'
  ) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const previousStock = p.stock;
      const newStock = Math.max(0, p.stock + quantityChange);
      const minLevel = p.minStockLevel || storeProfile.defaultLowStockThreshold || 10;
      const status: Product['status'] = 
        newStock === 0 ? 'out_of_stock' : 
        newStock <= minLevel ? 'low_stock' : 'in_stock';

      // Record stock movement audit
      const movement: StockMovement = {
        id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        date: new Date().toLocaleString(),
        type,
        quantityDelta: quantityChange,
        previousStock,
        newStock,
        reason: reason || (quantityChange > 0 ? 'Stock delivery restocked' : 'Stock level adjusted')
      };
      setStockMovements(mvPrev => [movement, ...mvPrev]);

      return {
        ...p,
        stock: newStock,
        status,
      };
    }));
  };

  const addTransaction = (newTxData: Omit<Transaction, 'id' | 'invoiceNumber'>): Transaction => {
    const nextInvNumber = `INV-2026-${1050 + transactions.length}`;
    const newTx: Transaction = {
      ...newTxData,
      id: `txn-${Date.now()}`,
      invoiceNumber: nextInvNumber,
    };

    // Update product stock counts and create movement log
    newTx.items.forEach(item => {
      updateStock(item.productId, -item.quantity, `Invoice ${nextInvNumber}`, 'sale');
    });

    // Update customer stats
    if (newTx.customerId && newTx.customerId !== 'walk-in') {
      setCustomers(prev => prev.map(c => {
        if (c.id !== newTx.customerId) return c;
        const newTotalSpent = c.totalSpent + newTx.total;
        const newOrders = c.totalOrders + 1;
        const addedBalance = newTx.paymentMethod === 'Store Credit (Udhaar)' ? newTx.total : 0;
        return {
          ...c,
          totalSpent: newTotalSpent,
          totalOrders: newOrders,
          balance: c.balance + addedBalance,
          lastPurchaseDate: newTx.date,
        };
      }));
    }

    setTransactions(prev => [newTx, ...prev]);

    return newTx;
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'lastPurchaseDate'>) => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      totalOrders: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      membershipTier: custData.balance > 5000 ? 'Regular' : 'Silver',
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  // Record Repayment or Auditable Adjustment (Does NOT create sales revenue!)
  const recordRepayment = (
    customerId: string, 
    amount: number, 
    paymentMethod: any, 
    note?: string, 
    type: 'payment' | 'audit_adjustment' = 'payment'
  ) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const repayment: CustomerRepayment = {
      id: `rep-${Date.now()}`,
      customerId,
      customerName: customer.name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount,
      paymentMethod,
      note,
      type,
      recordedBy: 'Admin / Cashier'
    };

    setRepayments(prev => [repayment, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const newBal = Math.max(0, c.balance - amount);
      return {
        ...c,
        balance: newBal,
      };
    }));
  };

  const updateCustomerReminder = (customerId: string) => {
    const nowStr = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, lastReminderSent: nowStr } : c));
  };

  // Orders Management
  const createOrder = (orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'statusHistory' | 'createdAt'>): StoreOrder => {
    const orderNum = `ORD-${9020 + orders.length + 1}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const initialHistory = [
      {
        id: `sh-${Date.now()}`,
        status: orderData.status || 'New',
        timestamp: formattedDate,
        updatedBy: orderData.channel === 'Web Cart' ? 'Customer (Web)' : 'Staff / Counter',
        note: orderData.channel === 'Web Cart' ? 'Customer placed order via website' : `Manual entry via ${orderData.channel}`
      }
    ];

    const newOrder: StoreOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      statusHistory: initialHistory,
      createdAt: formattedDate,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Push notification to store admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Order Received (${orderNum})`,
      message: `${orderData.customerName} placed order (${orderData.items.length} items, Rs. ${orderData.total.toLocaleString()}) via ${orderData.channel}`,
      type: 'info',
      timestamp: 'Just now',
      read: false,
      actionUrl: '/admin/orders',
      requiresAction: true,
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string, updatedBy: string = 'Staff / Store Admin') => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const historyItem = {
        id: `sh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: newStatus,
        timestamp: formattedDate,
        updatedBy,
        note: note || `Status updated to ${newStatus}`
      };
      return {
        ...o,
        status: newStatus,
        statusHistory: [historyItem, ...o.statusHistory]
      };
    }));
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: 'Pending' | 'Paid') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateStoreProfile = (profileUpdate: Partial<StoreProfile>) => {
    setStoreProfile(prev => ({ ...prev, ...profileUpdate }));
  };

  // Public Cart actions
  const addToPublicCart = (product: Product, quantity = 1) => {
    setPublicCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });
    setIsCartDrawerOpen(true);
  };

  const updatePublicCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPublicCart(productId);
      return;
    }
    setPublicCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const removeFromPublicCart = (productId: string) => {
    setPublicCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearPublicCart = () => {
    setPublicCart([]);
  };

  const resetToDemoData = () => {
    localStorage.removeItem('dukaanos_products_v2');
    localStorage.removeItem('dukaanos_txs_v2');
    localStorage.removeItem('dukaanos_customers_v2');
    localStorage.removeItem('dukaanos_expenses_v2');
    localStorage.removeItem('dukaanos_repayments_v2');
    localStorage.removeItem('dukaanos_stock_mv_v2');
    localStorage.removeItem('dukaanos_notifications_v2');
    localStorage.removeItem('dukaanos_orders_v2');
    localStorage.removeItem('dukaanos_profile_v2');
    localStorage.removeItem('dukaanos_pub_cart');

    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setExpenses(INITIAL_EXPENSES);
    setRepayments(INITIAL_REPAYMENTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setOrders(INITIAL_ORDERS);
    setStoreProfile(INITIAL_STORE_PROFILE);
    setPublicCart([]);
  };

  return (
    <StoreContext.Provider value={{
      products,
      transactions,
      customers,
      expenses,
      repayments,
      stockMovements,
      notifications,
      storeProfile,
      orders,
      theme,
      language,
      setLanguage,
      t,
      globalSearch,
      setGlobalSearch,
      toggleTheme,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductPublic,
      updateStock,
      addTransaction,
      addCustomer,
      recordRepayment,
      updateCustomerReminder,
      createOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      deleteOrder,
      whatsAppModal,
      openWhatsAppModal,
      closeWhatsAppModal,
      addExpense,
      deleteExpense,
      updateStoreProfile,
      markNotificationRead,
      markAllNotificationsRead,
      resetToDemoData,
      activeInvoice,
      setActiveInvoice,
      activeQuickModal,
      setActiveQuickModal,
      publicCart,
      addToPublicCart,
      updatePublicCartQty,
      removeFromPublicCart,
      clearPublicCart,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
    }}>
      {children}
      <WhatsAppMessageModal
        isOpen={whatsAppModal.isOpen}
        onClose={closeWhatsAppModal}
        recipientPhone={whatsAppModal.phone}
        recipientName={whatsAppModal.name}
        initialMessage={whatsAppModal.message}
        title={whatsAppModal.title}
      />
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
