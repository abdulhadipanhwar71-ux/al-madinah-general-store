import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Plus, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  ExternalLink,
  ShoppingBag,
  UserPlus,
  Box
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu, title }) => {
  const { 
    theme, 
    toggleTheme, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    globalSearch, 
    setGlobalSearch,
    setActiveQuickModal,
    storeProfile
  } = useStore();

  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#101927]/95 backdrop-blur border-b border-stone-200/90 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger menu (mobile) & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {title && (
            <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100 hidden sm:block">
              {title}
            </h2>
          )}
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, SKU codes, customer names..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100 transition-all placeholder:text-stone-400 dark:placeholder:text-slate-500"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Popover */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Action</span>
            </button>

            {quickMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-stone-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setActiveQuickModal('newSale');
                    setQuickMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm text-stone-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Start New POS Sale</span>
                </button>
                <button
                  onClick={() => {
                    setActiveQuickModal('addProduct');
                    setQuickMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm text-stone-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <Box className="w-4 h-4 text-emerald-600" />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => {
                    setActiveQuickModal('addCustomer');
                    setQuickMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm text-stone-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Register Customer</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-stone-600 hover:text-stone-900" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300" />
            )}
          </button>

          {/* Notifications Flyout */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-stone-200 dark:border-slate-800 py-3 z-50 animate-in fade-in duration-150">
                <div className="px-4 pb-2 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-slate-100">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/80">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionUrl) {
                            navigate(n.actionUrl);
                            setNotificationsOpen(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-stone-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-3 ${
                          !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-stone-900 dark:text-slate-200">{n.title}</p>
                            <span className="text-[10px] text-stone-400 dark:text-slate-500">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                        {n.actionUrl && (
                          <ExternalLink className="w-3 h-3 text-stone-400 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile & Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-600/30">
              AR
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-stone-900 dark:text-slate-100 leading-tight">
                {storeProfile.ownerName}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-slate-400">Owner & Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
