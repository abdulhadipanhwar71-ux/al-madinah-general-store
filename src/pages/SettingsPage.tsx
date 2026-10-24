import React, { useState } from 'react';
import { 
  Store, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Printer, 
  Save, 
  RotateCcw, 
  Check, 
  ShieldCheck,
  Building,
  CreditCard
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SettingsPage: React.FC = () => {
  const { 
    storeProfile, 
    updateStoreProfile, 
    theme, 
    toggleTheme, 
    resetToDemoData 
  } = useStore();

  const [name, setName] = useState(storeProfile.name);
  const [tagline, setTagline] = useState(storeProfile.tagline);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [address, setAddress] = useState(storeProfile.address);
  const [city, setCity] = useState(storeProfile.city);
  const [ntnNumber, setNtnNumber] = useState(storeProfile.ntnNumber);
  const [receiptFooter, setReceiptFooter] = useState(storeProfile.receiptFooter);
  const [saved, setSaved] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile({
      name,
      tagline,
      ownerName,
      phone,
      address,
      city,
      ntnNumber,
      receiptFooter,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetToDemoData();
    setName('Al-Madinah General Store');
    setTagline('Quality Grocery & Household Essentials at Wholesome Prices');
    setOwnerName('AbdulHadi');
    setPhone('+92 328 2885660');
    setAddress('Ripri, Khairpur Mirs, Sindh, Pakistan');
    setCity('Khairpur Mirs, Sindh');
    setNtnNumber('7492810-4');
    setReceiptFooter('JazakAllah Khair for shopping with us! Please check items before leaving.');
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
          Store Settings & POS Configuration
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
          Manage general store business identity, thermal receipt headers, and terminal preferences
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Store settings successfully updated in local session.</span>
        </div>
      )}

      {resetConfirmed && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-600" />
          <span>Demonstration catalog, transactions, and customers reset to defaults.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <Building className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Dukaan Identity & Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Store Trade Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Store Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Owner / Proprietor Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Phone Number / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Shop Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                NTN / FBR Registration #
              </label>
              <input
                type="text"
                value={ntnNumber}
                onChange={(e) => setNtnNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Thermal Receipt Settings */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <Printer className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Thermal Receipt Customization</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
              Receipt Footer Note / JazakAllah Message
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-850 border border-stone-200/80 dark:border-slate-800">
              <span className="font-semibold text-stone-700 dark:text-slate-300 block mb-0.5">Operating Currency</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">PKR (Pakistani Rupee - Rs.)</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-850 border border-stone-200/80 dark:border-slate-800">
              <span className="font-semibold text-stone-700 dark:text-slate-300 block mb-0.5">Retail Tax (Sales Tax)</span>
              <span className="font-bold text-stone-800 dark:text-slate-200 text-sm">0% (Standard Retail Included)</span>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-slate-100 pb-3 border-b border-stone-100 dark:border-slate-800">
            Interface Theme & Appearance
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-slate-100">Color Palette Theme</p>
              <p className="text-xs text-stone-500 dark:text-slate-400">Toggle between warm light SaaS and night terminal mode</p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-semibold flex items-center gap-2 text-stone-700 dark:text-slate-200 hover:bg-stone-100 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Switch to Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save and Reset Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Store Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
