import React, { useState } from 'react';
import { X, Check, PackagePlus, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface StockAdjustModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, isOpen, onClose }) => {
  const { updateStock } = useStore();
  const [quantity, setQuantity] = useState<string>('10');
  const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
  const [note, setNote] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    const delta = actionType === 'add' ? qty : -qty;
    updateStock(product.id, delta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <PackagePlus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Adjust Inventory Stock</h3>
            </div>
            <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 p-3 bg-stone-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <p className="font-bold text-stone-900 dark:text-slate-200">{product.name}</p>
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400">
              <span>SKU: {product.sku}</span>
              <span>Current Stock: <strong>{product.stock} {product.unit}</strong></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('add')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    actionType === 'add'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400'
                  }`}
                >
                  + Add Stock (Restock)
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('subtract')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    actionType === 'subtract'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400'
                  }`}
                >
                  - Deduct (Damaged/Return)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Quantity ({product.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Reason / Supplier Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Received from wholesale mandi / supplier batch #44"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Update</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
