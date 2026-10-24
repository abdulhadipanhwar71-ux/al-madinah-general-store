import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoNoticeBanner } from '../common/DemoNoticeBanner';
import { AddProductModal } from '../modals/AddProductModal';
import { QuickSaleModal } from '../modals/QuickSaleModal';
import { AddCustomerModal } from '../modals/AddCustomerModal';
import { InvoiceModal } from '../modals/InvoiceModal';
import { useStore } from '../../context/StoreContext';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { activeQuickModal, setActiveQuickModal } = useStore();

  const getPageTitle = (pathname: string) => {
    if (pathname === '/' || pathname === '/overview') return 'Overview Dashboard';
    if (pathname.startsWith('/products')) return 'Product Inventory & Catalog';
    if (pathname.startsWith('/inventory')) return 'Stock Control & Reordering';
    if (pathname.startsWith('/sales')) return 'Sales Register & Transaction History';
    if (pathname.startsWith('/customers')) return 'Customers & Udhaar Ledger';
    if (pathname.startsWith('/reports')) return 'Financial Reports & Analytics';
    if (pathname.startsWith('/settings')) return 'Store Settings & Preferences';
    return 'DukaanOS Platform';
  };

  return (
    <div className="min-h-screen bg-[#F8F9F6] dark:bg-[#0B1320] text-[#1C2520] dark:text-[#E2E8F0] flex">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

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

      {/* Global Modals Controlled via State */}
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
