import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Coins, 
  History, 
  ShieldCheck,
  RotateCcw,
  Plus,
  MessageCircle,
  BellRing,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Customer, CustomerRepayment } from '../../types';
import { createUdhaarReminderMessage } from '../../utils/whatsapp';

export const AdminCustomersPage: React.FC = () => {
  const { 
    customers, 
    repayments, 
    recordRepayment, 
    setActiveQuickModal, 
    storeProfile, 
    openWhatsAppModal, 
    updateCustomerReminder 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'directory' | 'repayments'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'udhaar' | 'cleared'>('all');
  
  // Settle modal state
  const [settleModalCust, setSettleModalCust] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer'>('Cash');
  const [settleNote, setSettleNote] = useState('');
  const [isAdjustment, setIsAdjustment] = useState(false);

  const totalReceivable = customers.reduce((acc, c) => acc + c.balance, 0);
  const customersWithUdhaar = customers.filter(c => c.balance > 0);

  const filtered = customers.filter(c => {
    if (filterTab === 'udhaar' && c.balance <= 0) return false;
    if (filterTab === 'cleared' && c.balance > 0) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalCust) return;
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;

    recordRepayment(
      settleModalCust.id,
      amt,
      settleMethod,
      settleNote || (isAdjustment ? 'Audited balance adjustment' : 'Customer counter repayment'),
      isAdjustment ? 'audit_adjustment' : 'payment'
    );

    setSettleModalCust(null);
    setSettleAmount('');
    setSettleNote('');
    setIsAdjustment(false);
  };

  const handleSendUdhaarReminder = (c: Customer) => {
    const msg = createUdhaarReminderMessage(storeProfile.name, c, storeProfile.phone || storeProfile.whatsappNumber);
    openWhatsAppModal(
      c.phone,
      msg,
      c.name,
      `WhatsApp Udhaar Reminder for ${c.name}`
    );
    updateCustomerReminder(c.id);
  };

  const handleWhatsAppCustomer = (c: Customer) => {
    const msg = `*Assalam-o-Alaikum ${c.name} Sahab,*\nThis is regarding your account at *${storeProfile.name}*. Please let us know if you need grocery items dispatched or have any questions.`;
    openWhatsAppModal(
      c.phone,
      msg,
      c.name,
      `WhatsApp Chat with ${c.name}`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Customer Credit & Udhaar Ledger
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Private neighborhood credit accounts, payment reconciliation, and auditable balance adjustments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Selector */}
          <div className="flex items-center bg-stone-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'directory'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Customer Directory ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('repayments')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'repayments'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Repayments Ledger ({repayments.length})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveQuickModal('addCustomer')}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Customer</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 text-white p-5 sm:p-6 rounded-3xl border border-amber-800 shadow-elevated">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Total Udhaar Outstanding</p>
            <div className="p-2.5 rounded-xl bg-amber-800/60 text-amber-300">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-white">
            Rs. {totalReceivable.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-amber-200/80">
            Across {customersWithUdhaar.length} active credit accounts (Private Ledger)
          </p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Registered Patrons</p>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-slate-100">
            {customers.length}
          </h3>
          <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
            Verified local neighborhood contact records
          </p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Repayments Recorded</p>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-slate-100">
            {repayments.length} Installments
          </h3>
          <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
            Reconciled to customer accounts, not counted as new sales
          </p>
        </div>
      </div>

      {activeTab === 'directory' ? (
        /* Customer Directory View - Clean Cards with Initials, NO Portraits */
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-slate-400'
                }`}
              >
                All Patrons ({customers.length})
              </button>
              <button
                onClick={() => setFilterTab('udhaar')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'udhaar'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-slate-400'
                }`}
              >
                Has Udhaar ({customersWithUdhaar.length})
              </button>
              <button
                onClick={() => setFilterTab('cleared')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'cleared'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-slate-400'
                }`}
              >
                Zero Balance
              </button>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => {
              // Extract initials
              const initials = c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 p-5 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{c.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {c.membershipTier} Account
                          </span>
                        </div>
                      </div>

                      {c.balance > 0 ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-extrabold text-right">
                          Due: Rs. {c.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Clear
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-stone-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.phone}</span>
                        </div>
                        <button
                          onClick={() => handleWhatsAppCustomer(c)}
                          className="text-[11px] font-bold text-[#128C7E] dark:text-[#25D366] hover:underline flex items-center gap-1"
                          title="Open WhatsApp chat with customer"
                        >
                          <MessageCircle className="w-3 h-3 text-[#25D366]" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                      {c.balance > 0 && c.lastReminderSent && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 pt-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>Last reminder: {c.lastReminderSent}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-stone-400 block text-[10px] uppercase">Lifetime Total</span>
                        <span className="font-extrabold text-stone-900 dark:text-slate-100">
                          Rs. {c.totalSpent.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSettleModalCust(c);
                            setSettleAmount(c.balance > 0 ? c.balance.toString() : '500');
                            setIsAdjustment(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
                        >
                          Repay Udhaar
                        </button>

                        <button
                          onClick={() => {
                            setSettleModalCust(c);
                            setSettleAmount('0');
                            setIsAdjustment(true);
                          }}
                          className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-medium"
                          title="Audited record correction / manual adjustment"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>

                    {c.balance > 0 && (
                      <button
                        onClick={() => handleSendUdhaarReminder(c)}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Send Polite Udhaar Reminder</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Repayments History View */
        <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card p-5 overflow-hidden">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3">Customer Credit Repayment History (Audit Trail)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Audit Note</th>
                  <th className="p-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
                {repayments.map(r => (
                  <tr key={r.id} className="hover:bg-stone-50/60">
                    <td className="p-3 font-mono text-[11px] text-stone-500">{r.date} {r.time}</td>
                    <td className="p-3 font-bold">{r.customerName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      Rs. {r.amount.toLocaleString()}
                    </td>
                    <td className="p-3">{r.paymentMethod}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.type === 'payment' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.type === 'payment' ? 'Repayment' : 'Correction'}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-slate-300">{r.note || '-'}</td>
                    <td className="p-3 text-stone-500">{r.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Balance Dialog */}
      {settleModalCust && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSettleModalCust(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">
                {isAdjustment ? 'Audited Balance Correction' : 'Record Udhaar Repayment'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Account: <strong>{settleModalCust.name}</strong>
              </p>

              <div className="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex justify-between">
                <span>Current Outstanding:</span>
                <span className="font-bold">Rs. {settleModalCust.balance.toLocaleString()}</span>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Repayment Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  >
                    <option value="Cash">Cash at Counter</option>
                    <option value="JazzCash">JazzCash Transfer</option>
                    <option value="EasyPaisa">EasyPaisa Transfer</option>
                    <option value="Bank Transfer">Bank Raast / Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Audit Note / Receipt # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received partial cash against monthly grocery list"
                    value={settleNote}
                    onChange={(e) => setSettleNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSettleModalCust(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 text-white font-bold"
                  >
                    Confirm & Reconcile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
