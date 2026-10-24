import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../layout/TopBar';
import { DemoNoticeBanner } from '../common/DemoNoticeBanner';
import { AddProductModal } from '../modals/AddProductModal';
import { QuickSaleModal } from '../modals/QuickSaleModal';
import { AddCustomerModal } from '../modals/AddCustomerModal';
import { InvoiceModal } from '../modals/InvoiceModal';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { activeQuickModal, setActiveQuickModal } = useStore();

  // Route protection
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (pathname: string) => {
    if (pathname === '/admin') return 'Store Overview & Business Metrics';
    if (pathname.startsWith('/admin/products')) return 'Product Catalog & Pricing Management';
    if (pathname.startsWith('/admin/inventory')) return 'Inventory Health & Stock Thresholds';
    if (pathname.startsWith('/admin/sales')) return 'POS Counter & Sales Ledger';
    if (pathname.startsWith('/admin/customers')) return 'Customer Accounts & Udhaar Ledger';
    if (pathname.startsWith('/admin/expenses')) return 'Store Expense Tracker';
    if (pathname.startsWith('/admin/reports')) return 'Audit Reports & Financial Analytics';
    if (pathname.startsWith('/admin/settings')) return 'Store Configuration & Threshold Settings';
    return 'DukaanOS Admin';
  };

  return (
    <div className="min-h-screen bg-[#F8F9F6] dark:bg-[#0B1320] text-[#1C2520] dark:text-[#E2E8F0] flex">
      {/* Admin Dedicated Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DemoNoticeBanner />
        <TopBar
          onToggleMobileMenu={() => setMobileOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Modals */}
      <AddProductModal
        isOpen={activeQuickModal === 'addProduct'}
        onClose={() => setActiveQuickModal(null)}
      />
      <QuickSaleModal
        isOpen={activeQuickModal === 'newSale'}
        onClose={() => setActiveQuickModal(null)}
      />
      <AddCustomerModal
        isOpen={activeQuickModal === 'addCustomer'}
        onClose={() => setActiveQuickModal(null)}
      />
      <InvoiceModal />
    </div>
  );
};
