import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Send, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Truck,
  Store,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { buildWhatsAppUrl, createCartOrderMessage } from '../../utils/whatsapp';
import { PaymentMethod } from '../../types';

export const CartDrawer: React.FC = () => {
  const { 
    publicCart, 
    updatePublicCartQty, 
    removeFromPublicCart, 
    clearPublicCart, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen,
    storeProfile,
    createOrder
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartDrawerOpen) return null;

  const subtotal = publicCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Delivery charge calculation based on store settings
  const isFreeDelivery = subtotal >= (storeProfile.freeDeliveryThreshold || 2500);
  const deliveryCharge = (deliveryType === 'delivery' && storeProfile.deliveryAvailable)
    ? (isFreeDelivery ? 0 : (storeProfile.deliveryCharges || 150))
    : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleProceedToCheckout = () => {
    if (publicCart.length === 0) return;
    setStep('checkout');
    setError(null);
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!customerPhone.trim()) {
      setError('Please provide your WhatsApp / mobile phone number.');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please provide your complete delivery address or street.');
      return;
    }

    setIsSubmitting(true);

    // 1. Create order in DukaanOS system
    const orderItems = publicCart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      total: item.product.price * item.quantity,
      unit: item.product.unit,
    }));

    const finalAddress = deliveryType === 'delivery' 
      ? deliveryAddress.trim() 
      : `Store Counter Pickup (${storeProfile.address})`;

    const newOrder = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: finalAddress,
      orderNotes: orderNotes.trim() || undefined,
      items: orderItems,
      subtotal,
      deliveryCharges: deliveryCharge,
      total: grandTotal,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'New',
      channel: 'Web Cart',
    });

    setSubmittedOrderNumber(newOrder.orderNumber);

    // 2. Generate WhatsApp formatted order message
    const formattedItems = publicCart.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      unit: item.product.unit,
      price: item.product.price,
    }));

    const whatsappText = createCartOrderMessage(
      storeProfile.name,
      formattedItems,
      {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: finalAddress,
        notes: orderNotes.trim() || undefined,
      },
      deliveryCharge,
      subtotal,
      grandTotal,
      newOrder.orderNumber
    );

    // 3. Open official WhatsApp
    const waUrl = buildWhatsAppUrl(storeProfile.whatsappNumber, whatsappText);
    window.open(waUrl, '_blank');

    // 4. Clear cart & advance to success confirmation
    clearPublicCart();
    setStep('success');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    // Reset view if success
    if (step === 'success') {
      setStep('cart');
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setOrderNotes('');
      setSubmittedOrderNumber(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step === 'checkout' && (
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-slate-800 mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-slate-100 text-base">
                  {step === 'cart' && 'Your Grocery Basket'}
                  {step === 'checkout' && 'Checkout & WhatsApp Order'}
                  {step === 'success' && 'Order Dispatched!'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  {step === 'cart' && `${publicCart.length} item types selected`}
                  {step === 'checkout' && 'Provide delivery details'}
                  {step === 'success' && 'Awaiting store confirmation'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: CART ITEMS */}
          {step === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {publicCart.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="w-8 h-8 opacity-60" />
                    </div>
                    <h4 className="font-bold text-stone-900 dark:text-slate-100 text-sm">Your basket is empty</h4>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Explore fresh vegetables, dairy, grains, and pantry supplies to fill your basket.
                    </p>
                  </div>
                ) : (
                  publicCart.map(item => (
                    <div 
                      key={item.product.id} 
                      className="flex items-center gap-3 p-3 rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-850/50"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-800">
                        <ImageWithFallback 
                          src={item.product.image} 
                          alt={item.product.name} 
                          fallbackText={item.product.name}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-stone-900 dark:text-slate-100 truncate">
                          {item.product.name}
                        </h5>
                        <p className="text-[11px] text-stone-500">
                          Rs. {item.product.price} /{item.product.unit}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg p-0.5">
                            <button
                              onClick={() => updatePublicCartQty(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updatePublicCartQty(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400">
                              Rs. {(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeFromPublicCart(item.product.id)}
                              className="text-stone-400 hover:text-rose-500 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {publicCart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-900 space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {isFreeDelivery ? 'FREE (Orders over Rs. ' + (storeProfile.freeDeliveryThreshold || 2500) + ')' : `Rs. ${storeProfile.deliveryCharges || 150}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-slate-800">
                      <span>Estimated Total:</span>
                      <span className="text-lg font-black text-emerald-800 dark:text-emerald-400">
                        Rs. {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Order Details</span>
                  </button>

                  <button
                    onClick={clearPublicCart}
                    className="w-full text-center text-xs text-stone-400 hover:text-stone-600 dark:hover:text-slate-300 py-1"
                  >
                    Clear basket
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 'checkout' && (
            <form onSubmit={handleSendOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {error && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Delivery Option Toggle */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1.5">
                    Fulfillment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                        deliveryType === 'delivery'
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs">Home Delivery</div>
                        <div className="text-[10px] opacity-75">
                          {isFreeDelivery ? 'Free Delivery' : `Rs. ${storeProfile.deliveryCharges || 150}`}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                        deliveryType === 'pickup'
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400'
                      }`}
                    >
                      <Store className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs">Store Pickup</div>
                        <div className="text-[10px] opacity-75">{storeProfile.address ? storeProfile.address.split(',')[0] : 'Ripri'} (Free)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. AbdulHadi / Haji Tariq"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    WhatsApp / Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="0328 2885660"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                      Delivery Address / House / Mohallah <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <textarea
                        rows={2}
                        required
                        placeholder="House #, Street / Mohallah (e.g. Near Main Bazar, Ripri, Khairpur Mirs)"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                      />
                    </div>
                  </div>
                )}

                {/* Order Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell twice, deliver between 4-6 PM"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-xs text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                {/* Preferred Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['Cash', 'EasyPaisa', 'JazzCash'] as PaymentMethod[]).map(pm => (
                      <button
                        type="button"
                        key={pm}
                        onClick={() => setPaymentMethod(pm)}
                        className={`py-2 px-1 text-center rounded-xl border font-medium transition-all ${
                          paymentMethod === pm
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400'
                        }`}
                      >
                        {pm === 'Cash' ? 'Cash on Delivery' : pm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Honest Disclosure Notice */}
                <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-2xl border border-stone-200/80 dark:border-slate-800 text-[11px] text-stone-600 dark:text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Your order will open in WhatsApp to <strong>{storeProfile.name}</strong> ({storeProfile.whatsappNumber}). The order is not final until confirmed by store staff.
                  </span>
                </div>
              </div>

              {/* Checkout Submit Bar */}
              <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-900 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Total Payable upon delivery:</span>
                  <span className="text-base font-black text-stone-900 dark:text-white">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Order via WhatsApp</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  Reference #{submittedOrderNumber}
                </span>
                <h3 className="text-lg font-black text-stone-900 dark:text-slate-100 mt-2">
                  Order Dispatched to WhatsApp!
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-xs">
                  Your order list has been submitted and registered in our store management ledger.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-800 text-left text-xs space-y-2 w-full">
                <div className="font-bold text-stone-800 dark:text-slate-200">What happens next?</div>
                <div className="text-stone-600 dark:text-slate-400 space-y-1 text-[11px]">
                  <p>1. Ensure your message sent in the opened WhatsApp window.</p>
                  <p>2. Our store cashier will check stock and reply with delivery time.</p>
                  <p>3. Pay Rs. {grandTotal.toLocaleString()} on delivery via {paymentMethod}.</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
              >
                Back to Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
