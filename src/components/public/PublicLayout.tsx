import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { CartDrawer } from './CartDrawer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B1320] text-[#1C2520] dark:text-[#E2E8F0] flex flex-col font-sans">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <PublicFooter />
    </div>
  );
};
