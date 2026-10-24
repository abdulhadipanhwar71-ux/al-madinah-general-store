import React from 'react';
import { X, Printer, CheckCircle, Share2, Receipt } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentBadge } from '../common/Badge';

export const InvoiceModal: React.FC = () => {
  const { activeInvoice, setActiveInvoice, storeProfile } = useStore();

  if (!activeInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveInvoice(null)} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Bar with actions */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 print:hidden">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-bold">Transaction Recorded</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Receipt</span>
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Container */}
          <div className="mt-4 p-5 sm:p-6 bg-stone-50 dark:bg-slate-950/70 border border-stone-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-stone-800 dark:text-slate-200 print:border-none print:p-0">
            {/* Store Header */}
            <div className="text-center pb-4 border-b border-dashed border-stone-300 dark:border-slate-700">
              <h4 className="text-base font-extrabold tracking-tight uppercase font-sans text-stone-900 dark:text-white">
                {storeProfile.name}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 font-sans mt-0.5">
                {storeProfile.address}, {storeProfile.city}
              </p>
              <p className="text-[10px] text-stone-500 dark:text-slate-400 mt-0.5">
                NTN: {storeProfile.ntnNumber} | Tel: {storeProfile.phone}
              </p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-stone-200 dark:bg-slate-800 rounded text-[10px] font-bold">
                CASH RETAIL INVOICE
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-3 border-b border-dashed border-stone-300 dark:border-slate-700 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Invoice: <strong>{activeInvoice.invoiceNumber}</strong></span>
                <span>Date: {activeInvoice.date} {activeInvoice.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer: <strong>{activeInvoice.customerName}</strong></span>
                <span>Cashier: {activeInvoice.cashier.split(' ')[0]}</span>
              </div>
              {activeInvoice.customerPhone && (
                <div className="flex justify-between text-stone-500">
                  <span>Phone: {activeInvoice.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-dashed border-stone-300 dark:border-slate-700">
              <div className="flex justify-between font-bold pb-1 text-[11px] uppercase border-b border-stone-200 dark:border-slate-800">
                <span className="flex-1">Item</span>
                <span className="w-12 text-center">Qty</span>
                <span className="w-16 text-right">Price</span>
                <span className="w-16 text-right">Total</span>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-slate-800/60 py-1">
                {activeInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 text-[11px]">
                    <span className="flex-1 truncate pr-2">{it.name}</span>
                    <span className="w-12 text-center">{it.quantity}</span>
                    <span className="w-16 text-right">{it.unitPrice}</span>
                    <span className="w-16 text-right font-semibold">{it.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-stone-300 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-slate-400">
                <span>Subtotal ({activeInvoice.items.length} items):</span>
                <span>Rs. {activeInvoice.subtotal.toLocaleString()}</span>
              </div>
              {activeInvoice.discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Discount:</span>
                  <span>- Rs. {activeInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 dark:text-slate-400">
                <span>GST / Retail Tax:</span>
                <span>Rs. 0 (Inclusive)</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-white pt-1 border-t border-stone-200 dark:border-slate-800">
                <span>NET TOTAL PAYABLE:</span>
                <span>Rs. {activeInvoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span>Payment Mode:</span>
                <PaymentBadge method={activeInvoice.paymentMethod} />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center space-y-1.5 text-[11px] font-sans">
              <p className="font-semibold text-stone-700 dark:text-slate-300">
                {storeProfile.receiptFooter}
              </p>
              <p className="text-[10px] text-stone-400">
                Powered by DukaanOS Retail Platform
              </p>
              <div className="pt-2 flex justify-center">
                <div className="tracking-[0.25em] font-mono text-[9px] text-stone-400 border border-stone-300 dark:border-slate-700 px-3 py-1 rounded">
                  * {activeInvoice.invoiceNumber} *
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="mt-5 flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={() => setActiveInvoice(null)}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800"
            >
              Done / Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
