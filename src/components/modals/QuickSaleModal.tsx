import React, { useState } from 'react';
import { X, Search, Plus, Minus, Trash2, Check, CreditCard, Banknote, Smartphone, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, Product } from '../../types';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, addTransaction, setActiveInvoice } = useStore();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discount, setDiscount] = useState<number>(0);

  if (!isOpen) return null;

  // Filter products for POS picker
  const filteredProducts = products.filter(p => 
    p.stock > 0 && (
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.urduName && p.urduName.includes(productSearch))
    )
  ).slice(0, 12);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : 'Walk-in Counter Customer';

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const tx = addTransaction({
      date: dateStr,
      time: timeStr,
      customerId: selectedCustomerId || 'walk-in',
      customerName,
      customerPhone: customer?.phone,
      items: cart.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.price,
        total: i.product.price * i.quantity,
      })),
      subtotal,
      discount,
      tax: 0,
      total: finalTotal,
      paymentMethod,
      status: 'Completed',
      cashier: 'Ahmed Ali (Shift 1)'
    });

    // Reset and show invoice
    setCart([]);
    setDiscount(0);
    onClose();
    setActiveInvoice(tx);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100">Quick POS Register</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">Barcode scanner & quick item selector</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: 2 columns on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 flex-1 overflow-hidden">
            {/* Left: Product Selector (7 cols) */}
            <div className="md:col-span-7 flex flex-col overflow-hidden">
              <div className="relative mb-3 flex-shrink-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan barcode or type item name / SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Product Grid / List */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px]">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className="p-2.5 text-left rounded-xl border border-stone-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-850 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-slate-200 line-clamp-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                        {p.name}
                      </p>
                      {p.urduName && (
                        <p className="text-[10px] text-stone-400 line-clamp-1">{p.urduName}</p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400">
                        {p.stock} {p.unit}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Cart & Checkout (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between bg-stone-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 overflow-hidden">
              {/* Customer Selector */}
              <div className="mb-3 flex-shrink-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  <User className="w-3.5 h-3.5" />
                  Select Customer (Optional)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-stone-800 dark:text-slate-200"
                >
                  <option value="">Walk-in Counter Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.balance > 0 ? `(Udhaar: Rs. ${c.balance.toLocaleString()})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto max-h-[160px] divide-y divide-stone-200 dark:divide-slate-700/60 pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    No items in current bill. Click items on the left to add.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 dark:text-slate-200 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-stone-500">Rs. {item.product.price} × {item.quantity}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-stone-200 dark:bg-slate-700 flex items-center justify-center hover:bg-stone-300 text-stone-700 dark:text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-stone-200 dark:bg-slate-700 flex items-center justify-center hover:bg-stone-300 text-stone-700 dark:text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-slate-700/80">
                <label className="text-xs font-semibold text-stone-700 dark:text-slate-300 block mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { id: 'Cash', label: 'Cash', icon: Banknote },
                    { id: 'JazzCash', label: 'JazzCash', icon: Smartphone },
                    { id: 'EasyPaisa', label: 'EasyPaisa', icon: Smartphone },
                    { id: 'Bank Transfer', label: 'Bank', icon: CreditCard },
                    { id: 'Store Credit (Udhaar)', label: 'Udhaar', icon: CreditCard },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`p-1.5 rounded-lg border text-center font-medium flex items-center justify-center gap-1 transition-all ${
                        paymentMethod === method.id
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                      }`}
                    >
                      <method.icon className="w-3 h-3" />
                      <span className="truncate">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="mt-3 pt-2 border-t border-stone-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-stone-500 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500 dark:text-slate-400 items-center">
                  <span>Discount (PKR):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 text-right border border-stone-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-slate-100 pt-1 border-t border-stone-200 dark:border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-emerald-800 dark:text-emerald-300">Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Sale Button */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
                className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  cart.length === 0
                    ? 'bg-stone-200 text-stone-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-950/20 active:scale-[0.98]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Complete Sale (Rs. {finalTotal.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
