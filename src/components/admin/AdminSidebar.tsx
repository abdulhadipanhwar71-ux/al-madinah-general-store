import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag,
  Package, 
  Boxes, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  Store, 
  X,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  LogOut,
  Wallet,
  ShieldAlert,
  Database,
  Globe
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { products, orders, storeProfile, setActiveQuickModal, language, setLanguage, t } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const lowStockCount = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'New' || o.status === 'Awaiting Confirmation').length;

  const navLinks = [
    { to: '/admin', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/admin/orders', label: t('orders'), icon: ShoppingBag, badgeAlert: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badge: orders.length },
    { to: '/admin/products', label: t('products'), icon: Package, badge: products.length },
    { to: '/admin/inventory', label: t('inventory'), icon: Boxes, badgeAlert: lowStockCount > 0 ? lowStockCount : undefined },
    { to: '/admin/sales', label: t('salesPOS'), icon: Receipt },
    { to: '/admin/customers', label: t('customersUdhaar'), icon: Users },
    { to: '/admin/expenses', label: t('expenses'), icon: Wallet },
    { to: '/admin/reports', label: t('reports'), icon: BarChart3 },
    { to: '/admin/backup', label: t('backup'), icon: Database },
    { to: '/admin/settings', label: t('settings'), icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#071E15] text-slate-100 select-none border-r border-emerald-950/40">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-emerald-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#0B2A1E] rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">Dukaan<span className="text-emerald-400">OS</span></h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 truncate max-w-[140px]">{storeProfile.name}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => {
            setActiveQuickModal('newSale');
            setMobileOpen(false);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New POS Checkout</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50">
          Management Console
        </div>

        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-800/90 text-white shadow-sm border border-emerald-700/60 font-semibold'
                  : 'text-emerald-100/75 hover:bg-emerald-900/40 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <link.icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-300' : 'text-emerald-400/80 group-hover:text-emerald-200'
                  }`} />
                  <span>{link.label}</span>
                </div>

                {link.badge !== undefined && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    {link.badge}
                  </span>
                )}

                {link.badgeAlert !== undefined && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    {link.badgeAlert}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50">
          Preferences & Website
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white transition-colors border border-emerald-900/40 mb-1"
          title={language === 'en' ? 'اردو زبان منتخب کریں' : 'Switch to English'}
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'اردو زبان' : 'English Language'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            {language === 'en' ? 'اردو' : 'EN'}
          </span>
        </button>

        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Public Store</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Link>
      </nav>

      {/* Current User & Log out */}
      <div className="p-4 border-t border-emerald-900/60 bg-[#051710]">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-emerald-400 capitalize">
              Role: {user?.role || 'owner'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Log out from Admin Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
