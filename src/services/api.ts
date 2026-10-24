/**
 * DukaanOS Centralized API Service
 * Connects frontend React components to FastAPI backend with JWT Bearer authentication,
 * error handling, and robust network management.
 */

export const API_BASE_URL: string = 
  (import.meta.env.VITE_API_URL as string) || 
  (import.meta.env.VITE_API_BASE_URL as string) || 
  '';


export interface ApiError {
  status: number;
  message: string;
  detail?: any;
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('dukaanos_admin_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('dukaanos_admin_token', token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('dukaanos_admin_token');
  localStorage.removeItem('dukaanos_admin_user');
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    const error: ApiError = {
      status: 0,
      message: 'Cannot reach DukaanOS backend server. Please verify the service is running at http://localhost:8000.',
      detail: networkError?.message || 'Network request failed',
    };
    throw error;
  }

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }

    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      removeStoredToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dukaanos:session-expired', { detail: errorDetail }));
      }
    }

    const error: ApiError = {
      status: response.status,
      message: errorDetail,
      detail: errorDetail,
    };
    throw error;
  }

  // Handle empty or blob responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return {} as T;
}

// ==========================================
// 1. PUBLIC API (Storefront & Catalog)
// ==========================================

export const apiPublic = {
  getStoreProfile: async () => {
    return apiRequest<any>('/api/public/store-profile');
  },

  getProducts: async (params?: { category?: string; search?: string; in_stock_only?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.in_stock_only) query.append('in_stock_only', 'true');
    const qs = query.toString();
    return apiRequest<any[]>(`/api/public/products${qs ? `?${qs}` : ''}`);
  },

  placeOrder: async (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    order_notes?: string;
    items: Array<{
      product_id?: string;
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
      unit?: string;
    }>;
    subtotal: number;
    delivery_charges: number;
    total: number;
    payment_method: string;
    channel?: string;
    idempotency_key?: string;
  }) => {
    return apiRequest<any>('/api/public/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};

// ==========================================
// 2. AUTHENTICATION API
// ==========================================

export const apiAuth = {
  login: async (email: string, pass: string) => {
    const data = await apiRequest<{
      access_token: string;
      token_type: string;
      user_id: string;
      name: string;
      email: string;
      role: 'owner' | 'cashier' | 'manager';
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  },

  getCurrentUser: async () => {
    return apiRequest<any>('/api/auth/me');
  },
};

// ==========================================
// 3. ADMIN OPERATIONS API
// ==========================================

export const apiAdmin = {
  // Store Profile
  getStoreProfile: async () => {
    return apiRequest<any>('/api/admin/store-profile');
  },
  updateStoreProfile: async (payload: any) => {
    return apiRequest<any>('/api/admin/store-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Products & Inventory
  getProducts: async (params?: { category?: string; search?: string; low_stock_only?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.low_stock_only) query.append('low_stock_only', 'true');
    const qs = query.toString();
    return apiRequest<any[]>(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: async (id: string) => {
    return apiRequest<any>(`/api/admin/products/${id}`);
  },
  createProduct: async (productData: any) => {
    return apiRequest<any>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  updateProduct: async (id: string, productData: any) => {
    return apiRequest<any>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },
  deleteProduct: async (id: string) => {
    return apiRequest<any>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
  adjustStock: async (productId: string, quantityChange: number, reason: string, type: string = 'adjustment') => {
    return apiRequest<any>(`/api/admin/products/${productId}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity_change: quantityChange, reason, type }),
    });
  },
  getStockMovements: async (productId?: string) => {
    const qs = productId ? `?product_id=${productId}` : '';
    return apiRequest<any[]>(`/api/admin/products/stock-movements${qs}`);
  },

  // Customers & Udhaar
  getCustomers: async (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<any[]>(`/api/admin/customers${qs}`);
  },
  createCustomer: async (customerData: any) => {
    return apiRequest<any>('/api/admin/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },
  recordRepayment: async (customerId: string, amount: number, paymentMethod: string, note?: string) => {
    return apiRequest<any>(`/api/admin/customers/${customerId}/repay`, {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method: paymentMethod, note }),
    });
  },
  getRepayments: async (customerId?: string) => {
    const qs = customerId ? `?customer_id=${customerId}` : '';
    return apiRequest<any[]>(`/api/admin/customers/repayments${qs}`);
  },

  // POS Sales & Transactions
  createTransaction: async (saleData: any) => {
    return apiRequest<any>('/api/admin/transactions', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },
  getTransactions: async (params?: { start_date?: string; end_date?: string; customer_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.customer_id) query.append('customer_id', params.customer_id);
    const qs = query.toString();
    return apiRequest<any[]>(`/api/admin/transactions${qs ? `?${qs}` : ''}`);
  },

  // Store Orders
  getOrders: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest<any[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
  },
  updateOrderStatus: async (orderId: string, status: string, note?: string) => {
    return apiRequest<any>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  // Expenses
  getExpenses: async () => {
    return apiRequest<any[]>('/api/admin/expenses');
  },
  createExpense: async (expenseData: any) => {
    return apiRequest<any>('/api/admin/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Financial Reports
  getFinancialSummary: async () => {
    return apiRequest<{
      total_sales: number;
      total_cogs: number;
      gross_profit: number;
      total_expenses: number;
      net_profit: number;
      total_orders: number;
      total_receivable_udhaar: number;
      total_repayments_collected: number;
      cash_sales_collected: number;
      credit_sales_issued: number;
    }>('/api/admin/reports/summary');
  },

  // Backup & Restore
  exportBackupJsonUrl: () => `${API_BASE_URL}/api/admin/backup/export/json`,
  exportBackupCsvUrl: () => `${API_BASE_URL}/api/admin/backup/export/csv`,

  downloadBackupJson: async () => {
    const token = getStoredToken();
    const resp = await fetch(`${API_BASE_URL}/api/admin/backup/export/json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error('Backup download failed');
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dukaanos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadBackupCsv: async () => {
    const token = getStoredToken();
    const resp = await fetch(`${API_BASE_URL}/api/admin/backup/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error('Backup CSV download failed');
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dukaanos_csv_backup_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  restoreBackup: async (payload: any) => {
    return apiRequest<any>('/api/admin/backup/restore', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Healthcheck
export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
};
