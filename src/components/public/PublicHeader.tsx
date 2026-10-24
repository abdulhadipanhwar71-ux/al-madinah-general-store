import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Store, 
  ShoppingBag, 
  Phone, 
  Menu, 
  X, 
  Lock, 
  MessageCircle,
  Globe
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export const PublicHeader: React.FC = () => {
  const { storeProfile, publicCart, setIsCartDrawerOpen, language, setLanguage, t } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = publicCart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { to: '/', label: t('home'), exact: true },
    { to: '/catalog', label: t('catalog'), exact: false },
    { to: '/categories', label: t('categories'), exact: false },
    { to: '/about', label: t('about'), exact: false },
    { to: '/contact', label: t('contact'), exact: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 transition-colors">
      {/* Top Notification Strip */}
      <div className="bg-[#0B2A1E] text-emerald-100 text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{storeProfile.storeHours || '8:00 AM - 11:00 PM'} • {language === 'ur' ? 'روزانہ تازہ سبزیاں و گھریلو گروسری ڈیلیوری' : 'Daily Fresh Vegetables & Grocery Deliveries'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-emerald-200/80">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{storeProfile.phone}</span>
            </span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 hover:text-white transition-colors border-l border-emerald-800/80 pl-3 font-semibold text-emerald-300"
              title="Store Owner & Staff Login"
            >
              <Lock className="w-3 h-3" />
              <span>{t('staffLogin')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0D4730] rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-300" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white tracking-tight leading-none">
              {language === 'ur' ? 'المدینہ' : 'Al-Madinah'} <span className="text-emerald-700 dark:text-emerald-400">{language === 'ur' ? 'جنرل اسٹور' : 'General Store'}</span>
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium mt-0.5">
              {language === 'ur' ? 'معیاری گروسری و گھریلو اشیاء' : (storeProfile.tagline || 'Quality Grocery & Mart')}
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-50 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 transition-all shadow-xs"
            title={language === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* WhatsApp Direct Order Button */}
          <a
            href={buildWhatsAppUrl(storeProfile.whatsappNumber, `Assalam-o-Alaikum ${storeProfile.name}, I have an inquiry regarding grocery orders.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>{t('whatsappOrder')}</span>
          </a>

          {/* Visible but Discreet Staff Login in Main Header */}
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 bg-stone-100/90 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 transition-all shadow-xs"
            title="Store Owner & Staff Login Portal"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('staffLogin')}</span>
          </Link>

          {/* Cart Basket Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition-all flex items-center gap-1.5"
            title="View Grocery Basket"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs font-bold">{t('cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-stone-900 text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'text-stone-700 dark:text-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Language Switcher in Mobile Drawer */}
          <div className="pt-2">
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'ur' : 'en');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'اردو زبان میں تبدیل کریں' : 'Switch to English Language'}</span>
            </button>
          </div>

          {/* Prominent Mobile Staff Login Button */}
          <div className="pt-1">
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-100 text-xs font-bold border border-stone-200 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t('staffLogin')}</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
            <a
              href={buildWhatsAppUrl(storeProfile.whatsappNumber, `Assalam-o-Alaikum ${storeProfile.name}, I want to place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#128C7E] flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp: {storeProfile.whatsappNumber}</span>
            </a>

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 underline underline-offset-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
