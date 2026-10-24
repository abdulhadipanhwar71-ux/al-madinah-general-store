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
  History,
  AlertCircle,
  Coins
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const { customers, setActiveQuickModal, settleCustomerBalance } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'udhaar' | 'cleared'>('all');
  const [settleModalCust, setSettleModalCust] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');

  // Summary Metrics
  const totalReceivable = customers.reduce((acc, c) => acc + c.balance, 0);
  const totalCustomerLifetimeSales = customers.reduce((acc, c) => acc + c.totalSpent, 0);
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

    settleCustomerBalance(settleModalCust.id, amt);
    setSettleModalCust(null);
    setSettleAmount('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Customer Directory & Udhaar Ledger
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Neighborhood patron profiles, lifetime loyalty value, and credit account reconciliations
          </p>
        </div>

        <button
          onClick={() => setActiveQuickModal('addCustomer')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 text-white p-5 sm:p-6 rounded-3xl border border-amber-800 shadow-elevated">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Total Udhaar Outstanding</p>
            <div className="p-2.5 rounded-xl bg-amber-800/60 text-amber-300">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Rs. {totalReceivable.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-amber-200/80">
            Across {customersWithUdhaar.length} credit accounts in neighborhood
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
            100% verified local phone numbers
          </p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Customer Lifetime Spend</p>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-slate-100">
            Rs. {totalCustomerLifetimeSales.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
            High repeat grocery purchase rate
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            With Udhaar ({customersWithUdhaar.length})
          </button>
          <button
            onClick={() => setFilterTab('cleared')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'cleared'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            Balance Clear
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with Avatar & Tier */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{c.name}</h4>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {c.membershipTier} Member
                    </span>
                  </div>
                </div>

                {c.balance > 0 ? (
                  <span className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-extrabold text-right">
                    Udhaar: Rs. {c.balance.toLocaleString()}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Cleared
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-1.5 text-xs text-stone-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{c.address}</span>
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-stone-400 block text-[10px] uppercase">Lifetime Total</span>
                <span className="font-extrabold text-stone-900 dark:text-slate-100">
                  Rs. {c.totalSpent.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 ml-1">({c.totalOrders} bills)</span>
              </div>

              {c.balance > 0 ? (
                <button
                  onClick={() => {
                    setSettleModalCust(c);
                    setSettleAmount(c.balance.toString());
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
                >
                  Settle Udhaar
                </button>
              ) : (
                <span className="text-[11px] text-stone-400">
                  Last: {c.lastPurchaseDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Settle Balance Dialog */}
      {settleModalCust && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSettleModalCust(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Settle Customer Udhaar</h3>
              <p className="text-xs text-stone-500 mt-1">
                Account: <strong>{settleModalCust.name}</strong>
              </p>
              <div className="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex justify-between">
                <span>Total Due:</span>
                <span className="font-bold">Rs. {settleModalCust.balance.toLocaleString()}</span>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Payment Received (PKR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={settleModalCust.balance}
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl"
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
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 text-white"
                  >
                    Record Payment
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
