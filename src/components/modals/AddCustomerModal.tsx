import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    const bal = parseFloat(initialBalance) || 0;

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Local Customer, Nearby Sector',
      email: email.trim() || undefined,
      balance: bal,
      membershipTier: 'Regular',
    });

    onClose();
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setInitialBalance('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100">Register New Customer</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">Add to store directory & Udhaar credit ledger</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Haji Muhammad Tariq"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Home Address / Mohallah
              </label>
              <input
                type="text"
                placeholder="e.g. House 14, Street 3, Sector G-9/1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Opening Udhaar Balance (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Customer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
