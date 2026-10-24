import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, Product, OrderItem, OrderStatus } from '../../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, storeProfile, createOrder } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [channel, setChannel] = useState<'Phone' | 'WhatsApp' | 'Counter'>('WhatsApp');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [initialStatus, setInitialStatus] = useState<OrderStatus>('Confirmed');
  const [deliveryCharges, setDeliveryCharges] = useState<string>(storeProfile.deliveryCharges.toString());
  
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCustomer = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
      setDeliveryAddress(cust.address);
    }
  };

  const handleAddItem = (prod: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.productId === prod.id);
      if (existing) {
        return prev.map(i => i.productId === prod.id ? { 
          ...i, 
          quantity: i.quantity + 1, 
          total: (i.quantity + 1) * i.unitPrice 
        } : i);
      }
      return [...prev, {
        productId: prod.id,
        name: prod.name,
        quantity: 1,
        unitPrice: prod.price,
        total: prod.price,
        unit: prod.unit
      }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.productId === productId) {
        const newQty = i.quantity + delta;
        if (newQty <= 0) return null;
        return { ...i, quantity: newQty, total: newQty * i.unitPrice };
      }
      return i;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = selectedItems.reduce((acc, i) => acc + i.total, 0);
  const deliveryNum = parseFloat(deliveryCharges) || 0;
  const grandTotal = subtotal + deliveryNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Please add at least one product to the order.');
      return;
    }

    createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim() || 'Store Counter Pickup',
      orderNotes: orderNotes.trim() || undefined,
      items: selectedItems,
      subtotal,
      deliveryCharges: deliveryNum,
      total: grandTotal,
      paymentMethod,
      paymentStatus,
      status: initialStatus,
      channel,
    });

    onClose();
    // Reset state
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setOrderNotes('');
    setSelectedItems([]);
  };

  const filteredProds = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100">Create Staff Order</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">Record phone, WhatsApp or in-person delivery order</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-hidden">
              {/* Left Column: Customer details & Channel (5 cols) */}
              <div className="md:col-span-5 space-y-3.5 overflow-y-auto pr-1 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Quick Select Existing Customer
                  </label>
                  <select
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">-- Choose registered patron --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sadia Farooq"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0300 1234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    placeholder="House / Flat #, Street, Sector"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Order Channel
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone Call</option>
                      <option value="Counter">Store Counter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={initialStatus}
                      onChange={(e) => setInitialStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="New">New</option>
                      <option value="Awaiting Confirmation">Awaiting Confirmation</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Cash">Cash on Delivery</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Store Credit (Udhaar)">Store Credit (Udhaar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Pending">Payment Pending</option>
                      <option value="Paid">Paid / Advance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Delivery Charges (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Call before arrival; leave with security"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Right Column: Item Selector & Cart (7 cols) */}
              <div className="md:col-span-7 flex flex-col overflow-hidden bg-stone-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-stone-200 dark:border-slate-700">
                <div className="relative mb-2.5 flex-shrink-0">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product to add..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                {/* Quick Add Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 max-h-36 overflow-y-auto flex-shrink-0">
                  {filteredProds.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItem(p)}
                      className="p-2 text-left rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:border-emerald-600 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-1">
                        <p className="font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-400">Rs. {p.price} /{p.unit}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Selected Order Items Table */}
                <div className="flex-1 overflow-y-auto divide-y divide-stone-200 dark:divide-slate-700 text-xs pr-1">
                  {selectedItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No products added yet. Click items above to add.
                    </div>
                  ) : (
                    selectedItems.map(item => (
                      <div key={item.productId} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">{item.name}</p>
                          <p className="text-[10px] text-stone-400">Rs. {item.unitPrice} × {item.quantity} = Rs. {item.total}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.productId, -1)}
                            className="w-5 h-5 rounded bg-stone-200 dark:bg-slate-700 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.productId, 1)}
                            className="w-5 h-5 rounded bg-stone-200 dark:bg-slate-700 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-stone-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal & Grand Total */}
                <div className="pt-2.5 border-t border-stone-200 dark:border-slate-700 space-y-1 text-xs flex-shrink-0">
                  <div className="flex justify-between text-stone-500">
                    <span>Items Subtotal:</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery Charges:</span>
                    <span>Rs. {deliveryNum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-white pt-1 border-t border-stone-200 dark:border-slate-700">
                    <span>Total Order Bill:</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Save & Record Order (Rs. {grandTotal.toLocaleString()})</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
