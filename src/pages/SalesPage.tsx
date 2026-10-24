import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Eye, 
  Download, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calendar,
  CheckCircle,
  Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentBadge, StatusBadge } from '../components/common/Badge';
import { PaymentMethod, Transaction } from '../types';

export const SalesPage: React.FC = () => {
  const { transactions, setActiveInvoice, setActiveQuickModal } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');

  // KPI calculations
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const cashSales = transactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, tx) => sum + tx.total, 0);
  const digitalSales = transactions.filter(t => t.paymentMethod === 'JazzCash' || t.paymentMethod === 'EasyPaisa' || t.paymentMethod === 'Bank Transfer').reduce((sum, tx) => sum + tx.total, 0);
  const creditSales = transactions.filter(t => t.paymentMethod === 'Store Credit (Udhaar)').reduce((sum, tx) => sum + tx.total, 0);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedMethod !== 'All' && tx.paymentMethod !== selectedMethod) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchInv = tx.invoiceNumber.toLowerCase().includes(q);
      const matchCust = tx.customerName.toLowerCase().includes(q);
      const matchItems = tx.items.some(i => i.name.toLowerCase().includes(q));
      if (!matchInv && !matchCust && !matchItems) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Sales & POS Terminal Invoices
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Real-time counter transactions, digital payment reconciliation, and audit trail
          </p>
        </div>

        <button
          onClick={() => setActiveQuickModal('newSale')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New POS Checkout</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Volume</p>
          <h3 className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-slate-100">Rs. {totalVolume.toLocaleString()}</h3>
          <p className="mt-1 text-[11px] text-stone-400">{transactions.length} total sales processed</p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Cash Drawer</p>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">Rs. {cashSales.toLocaleString()}</h3>
          <p className="mt-1 text-[11px] text-stone-400">Physical currency at terminal</p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Digital / Wallets</p>
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="mt-2 text-2xl font-extrabold text-blue-700 dark:text-blue-400">Rs. {digitalSales.toLocaleString()}</h3>
          <p className="mt-1 text-[11px] text-stone-400">JazzCash, EasyPaisa & Raast</p>
        </div>

        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Store Credit (Udhaar)</p>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-400">Rs. {creditSales.toLocaleString()}</h3>
          <p className="mt-1 text-[11px] text-stone-400">Recorded in customer ledger</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-medium text-stone-700 dark:text-slate-300"
          >
            <option value="All">All Payment Types</option>
            <option value="Cash">Cash</option>
            <option value="JazzCash">JazzCash</option>
            <option value="EasyPaisa">EasyPaisa</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Store Credit (Udhaar)">Udhaar (Credit)</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200/80 dark:border-slate-800 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items Count</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Amount (PKR)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setActiveInvoice(tx)}
                  className="hover:bg-stone-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {tx.invoiceNumber}
                  </td>
                  <td className="p-3.5 text-stone-500 dark:text-slate-400">
                    <div>{tx.date}</div>
                    <div className="text-[10px]">{tx.time}</div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-stone-900 dark:text-slate-100">{tx.customerName}</p>
                    {tx.customerPhone && (
                      <p className="text-[10px] text-stone-400">{tx.customerPhone}</p>
                    )}
                  </td>
                  <td className="p-3.5 text-stone-600 dark:text-slate-300">
                    {tx.items.length} {tx.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="p-3.5">
                    <PaymentBadge method={tx.paymentMethod} />
                  </td>
                  <td className="p-3.5 font-extrabold text-stone-900 dark:text-slate-100">
                    Rs. {tx.total.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInvoice(tx);
                      }}
                      className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-1 font-semibold"
                      title="View & Print Invoice Slip"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
