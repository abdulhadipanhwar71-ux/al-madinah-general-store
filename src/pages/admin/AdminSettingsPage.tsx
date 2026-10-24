import React, { useState } from 'react';
import { 
  Building, 
  Printer, 
  Save, 
  RotateCcw, 
  Check, 
  Sliders, 
  MessageCircle,
  Truck,
  ShieldCheck,
  Info,
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { normalizeWhatsAppNumber, buildWhatsAppUrl } from '../../utils/whatsapp';

export const AdminSettingsPage: React.FC = () => {
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
  const [countryCode, setCountryCode] = useState(storeProfile.countryCode || '+92');
  const [phone, setPhone] = useState(storeProfile.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(storeProfile.whatsappNumber);
  const [email, setEmail] = useState(storeProfile.email);
  const [address, setAddress] = useState(storeProfile.address);
  const [city, setCity] = useState(storeProfile.city);
  const [storeHours, setStoreHours] = useState(storeProfile.storeHours);
  const [ntnNumber, setNtnNumber] = useState(storeProfile.ntnNumber);
  const [defaultThreshold, setDefaultThreshold] = useState(storeProfile.defaultLowStockThreshold.toString());
  
  // Delivery settings
  const [deliveryAvailable, setDeliveryAvailable] = useState(storeProfile.deliveryAvailable);
  const [deliveryCharges, setDeliveryCharges] = useState(storeProfile.deliveryCharges.toString());
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(storeProfile.freeDeliveryThreshold.toString());
  const [deliveryAreas, setDeliveryAreas] = useState(storeProfile.deliveryAreas);
  const [returnPolicy, setReturnPolicy] = useState(storeProfile.returnPolicy);

  // Receipt
  const [receiptFooter, setReceiptFooter] = useState(storeProfile.receiptFooter);
  
  const [saved, setSaved] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  // Normalized live preview
  const normalizedWa = normalizeWhatsAppNumber(whatsappNumber, countryCode.replace('+', ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdNum = parseInt(defaultThreshold, 10) || 10;
    const deliveryNum = parseFloat(deliveryCharges) || 0;
    const freeThresholdNum = parseFloat(freeDeliveryThreshold) || 0;

    updateStoreProfile({
      name,
      tagline,
      ownerName,
      countryCode,
      phone,
      whatsappNumber,
      email,
      address,
      city,
      storeHours,
      ntnNumber,
      defaultLowStockThreshold: thresholdNum,
      deliveryAvailable,
      deliveryCharges: deliveryNum,
      freeDeliveryThreshold: freeThresholdNum,
      deliveryAreas,
      returnPolicy,
      receiptFooter,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all store data to default demo state? All orders, custom products, and transactions will be reset.')) {
      resetToDemoData();
      setResetConfirmed(true);
      setTimeout(() => setResetConfirmed(false), 3000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150 max-w-4xl pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
          Store Configuration & Business Settings
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
          Control public store identity, official WhatsApp contact number, delivery fees, customer policies, and inventory thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Store settings successfully updated. Changes are immediately live across the storefront and admin panel.</span>
        </div>
      )}

      {resetConfirmed && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-600" />
          <span>Demonstration catalog, orders, sales, customers, and expenses reset to defaults.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WhatsApp Communication Settings */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Store WhatsApp Configuration</h3>
              <p className="text-xs text-stone-500">Unified WhatsApp contact number used across catalog, basket, contact page, and order links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Country Dial Code
              </label>
              <input
                type="text"
                required
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+92"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-mono text-stone-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Store WhatsApp Number *
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-[#25D366] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-mono font-bold"
                  placeholder="0328 2885660"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp URL normalization verification card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700 dark:text-slate-300">Live Normalized Link Preview:</span>
              <a
                href={`https://wa.me/${normalizedWa}?text=${encodeURIComponent('Test message from DukaanOS Store Settings')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#128C7E] dark:text-[#25D366] hover:underline flex items-center gap-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] text-stone-800 dark:text-slate-200 break-all select-all border border-stone-100 dark:border-slate-800">
              https://wa.me/{normalizedWa || 'invalid-number'}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400">
              ✓ Numbers like <code>03282885660</code> are automatically converted to international standard <code>923282885660</code> without broken characters.
            </p>
          </div>
        </div>

        {/* Business Identity */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <Building className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Storefront Identity & Contact</h3>
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
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-bold"
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Public Tagline / Slogan
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
                Store Landline (PTCL / Counter)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Store Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Physical Shop Address
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
                City & Sector
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
                Public Store Operating Hours
              </label>
              <input
                type="text"
                value={storeHours}
                onChange={(e) => setStoreHours(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Logistics Settings */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <Truck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Home Delivery & Logistics</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60">
              <div>
                <span className="font-bold text-xs text-stone-900 dark:text-slate-100 block">Offer Home Delivery</span>
                <span className="text-[11px] text-stone-500">Allow customers to request home delivery on website and cart.</span>
              </div>
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-700 focus:ring-emerald-600/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Standard Delivery Fee (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharges}
                  onChange={(e) => setDeliveryCharges(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Free Delivery Threshold (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
                />
                <p className="text-[11px] text-stone-400 mt-1">Orders above this subtotal get free delivery.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Covered Delivery Areas & Sectors
                </label>
                <input
                  type="text"
                  value={deliveryAreas}
                  onChange={(e) => setDeliveryAreas(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  placeholder="e.g. F-10, F-11, E-11, G-10, G-11 (Islamabad)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Customer Return Policy */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Return & Exchange Policy</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
              Public Customer Policy Statement
            </label>
            <textarea
              rows={3}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
            />
          </div>
        </div>

        {/* Inventory Rules & Thermal Receipt */}
        <div className="bg-white dark:bg-[#131D2E] p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Inventory Threshold Rule & Receipt</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Default Low-Stock Alert Threshold *
              </label>
              <input
                type="number"
                min="1"
                required
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Default Currency
              </label>
              <div className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 font-bold text-sm">
                PKR (Pakistani Rupee — Rs.)
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Receipt Footer / JazakAllah Khair Note
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Architecture & Limitations Section */}
        <div className="bg-emerald-950/20 dark:bg-emerald-950/40 p-6 rounded-3xl border border-emerald-900/40 text-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>Architecture Note: WhatsApp Click-to-Chat vs Meta Cloud API</span>
          </div>
          <p className="text-stone-600 dark:text-slate-300 leading-relaxed">
            DukaanOS Phase 1 uses <strong>Official WhatsApp Click-to-Chat (wa.me)</strong> with URL-encoded templates and pre-filled order payloads. This guarantees:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600 dark:text-slate-400">
            <li><strong>Zero Meta API setup fees</strong> and no monthly per-conversation charges.</li>
            <li><strong>Immediate functionality</strong> on all mobile devices and WhatsApp Web without business verification delays.</li>
            <li><strong>Full customer transparency</strong>: Orders and reminders are delivered directly into the real WhatsApp chat between customer and store owner.</li>
          </ul>
          <p className="text-stone-500 text-[11px]">
            * Phase 2 integration option: For automated background SMS/WhatsApp broadcasts and webhooks, Meta WhatsApp Business Cloud API with webhook verification can be configured via backend microservices.
          </p>
        </div>

        {/* Save Bar */}
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
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
