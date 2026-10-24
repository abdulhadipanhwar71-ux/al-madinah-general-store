import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Check, 
  X, 
  Phone, 
  MapPin, 
  History, 
  DollarSign,
  Package,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, StoreOrder } from '../../types';
import { createOrderStatusMessage } from '../../utils/whatsapp';
import { CreateOrderModal } from '../../components/modals/CreateOrderModal';

const STATUS_CONFIG: Record<OrderStatus, { label: string; urdu: string; color: string; bg: string; border: string }> = {
  'New': { 
    label: 'New Order', 
    urdu: 'نیا آرڈر', 
    color: 'text-blue-700 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-950/40', 
    border: 'border-blue-200 dark:border-blue-900/50' 
  },
  'Awaiting Confirmation': { 
    label: 'Awaiting Confirmation', 
    urdu: 'تصدیق کا منتظر', 
    color: 'text-amber-700 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-950/40', 
    border: 'border-amber-200 dark:border-amber-900/50' 
  },
  'Confirmed': { 
    label: 'Confirmed', 
    urdu: 'تصدیق شدہ', 
    color: 'text-emerald-700 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
    border: 'border-emerald-200 dark:border-emerald-900/50' 
  },
  'Preparing': { 
    label: 'Preparing', 
    urdu: 'تیار کیا جا رہا ہے', 
    color: 'text-indigo-700 dark:text-indigo-400', 
    bg: 'bg-indigo-50 dark:bg-indigo-950/40', 
    border: 'border-indigo-200 dark:border-indigo-900/50' 
  },
  'Ready': { 
    label: 'Ready for Pickup / Delivery', 
    urdu: 'تیار', 
    color: 'text-teal-700 dark:text-teal-400', 
    bg: 'bg-teal-50 dark:bg-teal-950/40', 
    border: 'border-teal-200 dark:border-teal-900/50' 
  },
  'Out for Delivery': { 
    label: 'Out for Delivery', 
    urdu: 'روانہ کر دیا گیا', 
    color: 'text-purple-700 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-950/40', 
    border: 'border-purple-200 dark:border-purple-900/50' 
  },
  'Completed': { 
    label: 'Completed', 
    urdu: 'مکمل', 
    color: 'text-emerald-800 dark:text-emerald-300', 
    bg: 'bg-emerald-100/60 dark:bg-emerald-900/30', 
    border: 'border-emerald-300 dark:border-emerald-800' 
  },
  'Cancelled': { 
    label: 'Cancelled', 
    urdu: 'منسوخ', 
    color: 'text-rose-700 dark:text-rose-400', 
    bg: 'bg-rose-50 dark:bg-rose-950/40', 
    border: 'border-rose-200 dark:border-rose-900/50' 
  },
};

const CHANNEL_ICONS: Record<string, string> = {
  'Web Cart': '🌐',
  'WhatsApp': '💬',
  'Phone': '📞',
  'Counter': '🏪'
};

export const AdminOrdersPage: React.FC = () => {
  const { orders, storeProfile, updateOrderStatus, updateOrderPaymentStatus, deleteOrder, openWhatsAppModal } = useStore();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'All'>('All');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Status transition note modal
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Filtering
  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'All' && order.status !== selectedStatus) return false;
    if (selectedChannel !== 'All' && order.channel !== selectedChannel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchAddr = order.deliveryAddress.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchPhone && !matchAddr) return false;
    }
    return true;
  });

  // Metrics
  const pendingConfirmationCount = orders.filter(o => o.status === 'New' || o.status === 'Awaiting Confirmation').length;
  const inProgressCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Out for Delivery').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

  const handleOpenStatusModal = (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setTargetStatus(nextStatus);
    setStatusNote('');
  };

  const handleConfirmStatusChange = () => {
    if (updatingOrderId && targetStatus) {
      updateOrderStatus(updatingOrderId, targetStatus, statusNote.trim() || undefined, 'Store Staff');
      setUpdatingOrderId(null);
      setTargetStatus(null);
      setStatusNote('');
    }
  };

  const handleSendWhatsAppUpdate = (order: StoreOrder) => {
    const msg = createOrderStatusMessage(storeProfile.name, order, order.status);
    openWhatsAppModal(
      order.customerPhone,
      msg,
      order.customerName,
      `WhatsApp Update for Order ${order.orderNumber}`
    );
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 dark:text-slate-100 tracking-tight">
              Customer Orders & Deliveries
            </h1>
            <span className="text-sm font-urdu text-stone-500 dark:text-slate-400">
              (گراہک کے آرڈرز اور ہوم ڈیلیوری)
            </span>
          </div>
          <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">
            Track website orders, counter deliveries, order statuses, and communicate via WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Order (Manual / Phone)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">Awaiting Confirmation</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{pendingConfirmationCount}</p>
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1">Requires store acceptance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">In Progress & Dispatch</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1">Preparing & on route</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">Completed Orders</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1">Delivered & verified</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">Total Active Orders Value</span>
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-slate-100 mt-2">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1">{orders.length} total recorded orders</p>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-stone-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStatus === 'All'
                ? 'bg-stone-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            All Orders ({orders.length})
          </button>

          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
            const count = orders.filter(o => o.status === st).length;
            const cfg = STATUS_CONFIG[st];
            const active = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active 
                    ? `${cfg.bg} ${cfg.color} ring-2 ring-emerald-600/50 font-bold shadow-sm` 
                    : 'bg-stone-100 dark:bg-slate-800/80 text-stone-600 dark:text-slate-400 hover:bg-stone-200/70'
                }`}
              >
                <span>{cfg.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/80 dark:bg-black/40' : 'bg-stone-200 dark:bg-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Channel Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-stone-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order number (e.g. ORD-9021), customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">Channel:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 rounded-xl text-xs text-stone-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="Web Cart">🌐 Web Cart</option>
              <option value="WhatsApp">💬 WhatsApp</option>
              <option value="Phone">📞 Phone</option>
              <option value="Counter">🏪 Counter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-slate-800">
          <Package className="w-12 h-12 text-stone-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-slate-200">No orders found</h3>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedStatus !== 'All' 
              ? 'Try adjusting your search query or status filter.' 
              : 'Orders placed on the website or recorded manually will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const statusCfg = STATUS_CONFIG[order.status];

            return (
              <div 
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-emerald-600/30"
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex flex-wrap items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                      {order.orderNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-stone-900 dark:text-slate-100">
                          {order.customerName}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 font-medium flex items-center gap-1">
                          <span>{CHANNEL_ICONS[order.channel] || '📦'}</span>
                          <span>{order.channel}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{order.customerPhone}</span>
                        </span>
                        <span>•</span>
                        <span>{order.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Status & Payment Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span>{statusCfg.label}</span>
                    </div>

                    {/* Payment status toggle badge */}
                    <button
                      onClick={() => updateOrderPaymentStatus(order.id, order.paymentStatus === 'Paid' ? 'Pending' : 'Paid')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Click to toggle payment status"
                    >
                      {order.paymentStatus === 'Paid' ? '✓ Paid' : '⏳ Payment Pending'}
                    </button>

                    {/* Total Amount */}
                    <div className="text-right pl-2 sm:border-l border-stone-200 dark:border-slate-800">
                      <div className="text-xs text-stone-400">Total</div>
                      <div className="text-base font-black text-stone-900 dark:text-slate-100">
                        Rs. {order.total.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100 dark:border-slate-800">
                    {/* Status updater dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => handleOpenStatusModal(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    >
                      {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(st => (
                        <option key={st} value={st}>
                          Move to: {STATUS_CONFIG[st].label}
                        </option>
                      ))}
                    </select>

                    {/* WhatsApp notification button */}
                    <button
                      onClick={() => handleSendWhatsAppUpdate(order)}
                      title="Send WhatsApp status update to customer"
                      className="px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp Update</span>
                    </button>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details Drawer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-stone-50/70 dark:bg-slate-800/40 border-t border-stone-100 dark:border-slate-800/80 space-y-4 text-xs animate-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Delivery Address & Notes */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 space-y-2">
                        <div className="font-bold text-stone-800 dark:text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivery Address & Instructions</span>
                        </div>
                        <p className="text-stone-700 dark:text-slate-300 font-medium">
                          {order.deliveryAddress || `Counter Pickup (${storeProfile.address || 'Ripri, Khairpur Mirs'})`}
                        </p>
                        {order.orderNotes && (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px]">
                            <strong>Customer Note:</strong> {order.orderNotes}
                          </div>
                        )}
                        <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-3">
                          <span>Payment Mode: <strong>{order.paymentMethod}</strong></span>
                          <span>•</span>
                          <span>Channel: <strong>{order.channel}</strong></span>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 space-y-2">
                        <div className="font-bold text-stone-800 dark:text-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ordered Items ({order.items.length})</span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-normal">
                            Subtotal: Rs. {order.subtotal.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-100 dark:border-slate-800 last:border-0 text-[11px]">
                              <div>
                                <span className="font-medium text-stone-800 dark:text-slate-200">{item.name}</span>
                                <span className="text-stone-400 ml-1.5">× {item.quantity} {item.unit}</span>
                              </div>
                              <span className="font-semibold text-stone-700 dark:text-slate-300">
                                Rs. {item.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between font-bold text-xs text-stone-800 dark:text-slate-200">
                          <span>Delivery Charges:</span>
                          <span>{order.deliveryCharges > 0 ? `Rs. ${order.deliveryCharges}` : 'FREE'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit History Timeline */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800">
                      <div className="font-bold text-stone-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
                        <History className="w-3.5 h-3.5 text-stone-500" />
                        <span>Order Audit History (Status Timeline)</span>
                      </div>

                      <div className="space-y-2 pl-2 border-l-2 border-stone-200 dark:border-slate-800">
                        {order.statusHistory.map((hist) => (
                          <div key={hist.id} className="relative pl-3">
                            <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900" />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-stone-800 dark:text-slate-200">{hist.status}</span>
                              <span className="text-[10px] text-stone-400">• {hist.timestamp}</span>
                              <span className="text-[10px] text-stone-500 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">By {hist.updatedBy}</span>
                            </div>
                            {hist.note && (
                              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 italic">
                                "{hist.note}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete order ${order.orderNumber}? This will remove it from the system.`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Delete Order Record
                      </button>

                      <button
                        onClick={() => handleSendWhatsAppUpdate(order)}
                        className="px-3 py-1.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#20bd5a] flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Notify Customer via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Transition Audit Note Modal */}
      {updatingOrderId && targetStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setUpdatingOrderId(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">
                Update Status to: <span className="text-emerald-700">{STATUS_CONFIG[targetStatus].label}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
                Add an optional staff note for the audit history log.
              </p>

              <div className="mt-4">
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Items packed by Ahmed, rider assigned, or customer confirmed on call..."
                  className="w-full p-3 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 text-stone-900 dark:text-slate-100"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdatingOrderId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-950/20"
                >
                  Confirm Status Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
