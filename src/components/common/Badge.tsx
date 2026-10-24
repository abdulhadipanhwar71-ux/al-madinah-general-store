import React from 'react';
import { StockStatus, PaymentMethod, TransactionStatus } from '../../types';

export const StockBadge: React.FC<{ status: StockStatus; count?: number; unit?: string }> = ({ 
  status, 
  count, 
  unit 
}) => {
  if (status === 'out_of_stock') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        Out of Stock
      </span>
    );
  }

  if (status === 'low_stock') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Low: {count !== undefined ? `${count} ${unit || ''}` : 'Stock Alert'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      {count !== undefined ? `${count} ${unit || ''}` : 'In Stock'}
    </span>
  );
};

export const PaymentBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const getStyle = () => {
    switch (method) {
      case 'Cash':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
      case 'EasyPaisa':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900';
      case 'JazzCash':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900';
      case 'Bank Transfer':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
      case 'Store Credit (Udhaar)':
        return 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-semibold';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()}`}>
      {method}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
        Paid
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
      Refunded
    </span>
  );
};
