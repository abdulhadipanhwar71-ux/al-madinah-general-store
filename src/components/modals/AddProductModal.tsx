import React, { useState } from 'react';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Fresh Produce',
  'Grains & Pulses',
  'Oils & Ghee',
  'Dairy & Beverages',
  'Spices & Condiments',
  'Snacks & Bakery',
  'Household & Cleaning',
];

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useStore();

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Grains & Pulses');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [minStockLevel, setMinStockLevel] = useState<string>('10');
  const [unit, setUnit] = useState('kg');
  const [image, setImage] = useState('');
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate realistic SKU if empty
  const handleAutoSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    setSku(`DK-${prefix}-${random}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    const costNum = parseFloat(costPrice) || 0;
    const stockNum = parseInt(stock, 10);
    const minStockNum = parseInt(minStockLevel, 10) || 10;

    if (!name.trim()) {
      setError('Please provide product name.');
      return;
    }
    if (!sku.trim()) {
      setError('Please specify a SKU code (or click Auto-Gen).');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid retail price (PKR).');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter current available stock.');
      return;
    }

    const result = addProduct({
      name: name.trim(),
      urduName: urduName.trim() || undefined,
      category,
      sku: sku.trim().toUpperCase(),
      price: priceNum,
      costPrice: costNum > 0 ? costNum : Math.round(priceNum * 0.8),
      stock: stockNum,
      minStockLevel: minStockNum,
      unit,
      image: image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      barcode: barcode.trim() || `8964${Math.floor(100000 + Math.random() * 900000)}`,
    });

    if (result.success) {
      onClose();
      // Reset form
      setName('');
      setUrduName('');
      setSku('');
      setPrice('');
      setCostPrice('');
      setStock('');
      setImage('');
      setBarcode('');
    } else {
      setError(result.error || 'Failed to add product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100">Add New Product</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">Add item to general store inventory & catalog</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product English Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guard Basmati Rice 5kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Product Urdu Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Urdu / Local Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. گارڈ باسمتی چاول"
                  value={urduName}
                  onChange={(e) => setUrduName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* SKU code with Auto-gen button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-slate-300">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSku}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Gen
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. DK-RIC-402"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl uppercase focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Unit of Measure
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                >
                  <option value="kg">kg (Kilogram)</option>
                  <option value="pack">pack</option>
                  <option value="bag">bag</option>
                  <option value="can">can</option>
                  <option value="bottle">bottle</option>
                  <option value="dozen">dozen</option>
                  <option value="loaf">loaf</option>
                  <option value="bundle">bundle</option>
                  <option value="piece">piece</option>
                </select>
              </div>

              {/* Retail Selling Price PKR */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Retail Price (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 1850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Wholesale Cost Price PKR */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Cost Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 1520"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Initial Stock Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 25"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Reorder Threshold */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Low Stock Alert Level
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1">
                  Product Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
                />
                <p className="mt-1 text-[11px] text-stone-400">Leave blank to use a category placeholder image.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 text-sm font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Save Product</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
