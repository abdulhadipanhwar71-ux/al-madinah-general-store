import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Tag, 
  AlertCircle, 
  Check, 
  X,
  PieChart as PieIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Expense, ExpenseCategory } from '../../types';
import { MetricCard } from '../../components/common/MetricCard';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Shop Rent',
  'Electricity & Generator',
  'Staff Wages',
  'Packaging & Bags',
  'Carriage & Freight',
  'Store Maintenance',
  'Municipal & Taxes',
  'Miscellaneous',
];

export const AdminExpensesPage: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New expense form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity & Generator');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash'>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Major categories calculation
  const electricityTotal = expenses.filter(e => e.category === 'Electricity & Generator').reduce((s, e) => s + e.amount, 0);
  const rentTotal = expenses.filter(e => e.category === 'Shop Rent').reduce((s, e) => s + e.amount, 0);
  const packagingTotal = expenses.filter(e => e.category === 'Packaging & Bags' || e.category === 'Carriage & Freight').reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(e => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please provide a valid expense amount.');
      return;
    }
    if (!description.trim()) {
      setError('Description / payee note is required.');
      return;
    }

    addExpense({
      date,
      category,
      description: description.trim(),
      amount: amt,
      paymentMethod,
      recordedBy: 'Admin (Cashier)'
    });

    setIsAddModalOpen(false);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Store Operating Expenses
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Track utility bills, shop rent, logistics freight, and packaging without double counting
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recorded Expenses"
          value={`Rs. ${totalExpenseAmount.toLocaleString()}`}
          subtitle={`${expenses.length} operating vouchers`}
          icon={Wallet}
          highlight={true}
        />
        <MetricCard
          title="Commercial Shop Rent"
          value={`Rs. ${rentTotal.toLocaleString()}`}
          subtitle="Premises lease liability"
          icon={DollarSign}
        />
        <MetricCard
          title="Power & Generator Fuel"
          value={`Rs. ${electricityTotal.toLocaleString()}`}
          subtitle="Load-shedding backup diesel"
          icon={PieIcon}
        />
        <MetricCard
          title="Packaging & Freight"
          value={`Rs. ${packagingTotal.toLocaleString()}`}
          subtitle="Shopping bags & mandi carriage"
          icon={Tag}
        />
      </div>

      {/* Controls & Search */}
      <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense description, payee, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-medium text-stone-700 dark:text-slate-300"
          >
            <option value="All">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description & Payee</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5">Amount (PKR)</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
              {filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-stone-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-[11px] text-stone-500">{exp.date}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium">{exp.description}</td>
                  <td className="p-3.5">{exp.paymentMethod}</td>
                  <td className="p-3.5 font-bold font-mono text-rose-700 dark:text-rose-400">
                    Rs. {exp.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-stone-500">{exp.recordedBy}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this expense voucher?')) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">Record Business Expense</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Expense Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 5800"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Description & Payee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Generator diesel 20 Litres from Shell pump"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    >
                      <option value="Cash">Cash at Counter</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="JazzCash">JazzCash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-stone-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 text-white font-bold"
                  >
                    Save Expense
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
