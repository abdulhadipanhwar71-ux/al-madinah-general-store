import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { products, storeProfile, setActiveQuickModal } = useStore();

  const lowStockCount = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;

  const navLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/products', label: 'Products', icon: Package, badge: products.length },
    { to: '/inventory', label: 'Inventory', icon: Boxes, badgeAlert: lowStockCount > 0 ? lowStockCount : undefined },
    { to: '/sales', label: 'Sales & POS', icon: Receipt },
    { to: '/customers', label: 'Customers & Udhaar', icon: Users },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Store Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B2A1E] text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-emerald-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#0D4730] rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-white">Dukaan<span className="text-emerald-400">OS</span></h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 truncate max-w-[140px]">{storeProfile.name}</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick POS Action CTA */}
      <div className="px-4 pt-4">
        <button
          onClick={() => {
            setActiveQuickModal('newSale');
            setMobileOpen(false);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quick Sale</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/60">
          Management
        </div>

        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-800/80 text-white shadow-sm border border-emerald-700/60 font-semibold'
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
      </nav>

      {/* Store Terminal Status Widget */}
      <div className="p-4 border-t border-emerald-900/60 bg-[#072016]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-200">Terminal 01</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Live Sync
          </span>
        </div>
        <p className="mt-1 text-[11px] text-emerald-400/60 truncate">
          Cashier: Ahmed Ali (Morning Shift)
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 shadow-xl border-r border-emerald-950/20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
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
