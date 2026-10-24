import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  PackagePlus, 
  Check, 
  AlertCircle,
  X,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory, Product, StockStatus } from '../../types';
import { StockBadge } from '../../components/common/Badge';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { EmptyState } from '../../components/common/EmptyState';
import { StockAdjustModal } from '../../components/modals/StockAdjustModal';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Fresh Produce',
  'Grains & Pulses',
  'Oils & Ghee',
  'Dairy & Beverages',
  'Spices & Condiments',
  'Snacks & Bakery',
  'Household & Cleaning',
];

export const AdminProductsPage: React.FC = () => {
  const { 
    products, 
    updateProduct, 
    deleteProduct, 
    toggleProductPublic, 
    setActiveQuickModal 
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editUrdu, setEditUrdu] = useState('');
  const [editCategory, setEditCategory] = useState<ProductCategory>('Fresh Produce');
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editCost, setEditCost] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [editThreshold, setEditThreshold] = useState<string>('');
  const [editUnit, setEditUnit] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesUrdu = p.urduName && p.urduName.includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = p.barcode.includes(q);
        if (!matchesName && !matchesUrdu && !matchesSku && !matchesBarcode) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditUrdu(p.urduName || '');
    setEditCategory(p.category);
    setEditSku(p.sku);
    setEditPrice(p.price.toString());
    setEditCost(p.costPrice.toString());
    setEditStock(p.stock.toString());
    setEditThreshold(p.minStockLevel.toString());
    setEditUnit(p.unit);
    setEditImage(p.image);
    setEditBarcode(p.barcode);
    setEditIsPublic(p.isPublic);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editPrice);
    const costNum = parseFloat(editCost);
    const stockNum = parseInt(editStock, 10);
    const minLevel = parseInt(editThreshold, 10) || 10;

    if (!editName.trim()) {
      setFeedback({ message: 'Product name is required.', type: 'error' });
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedback({ message: 'Please provide a valid retail price.', type: 'error' });
      return;
    }

    const res = updateProduct(editingProduct.id, {
      name: editName.trim(),
      urduName: editUrdu.trim() || undefined,
      category: editCategory,
      sku: editSku.trim().toUpperCase(),
      price: priceNum,
      costPrice: costNum >= 0 ? costNum : Math.round(priceNum * 0.8),
      stock: stockNum >= 0 ? stockNum : 0,
      minStockLevel: minLevel,
      unit: editUnit,
      image: editImage,
      barcode: editBarcode,
      isPublic: editIsPublic,
    });

    if (res.success) {
      setFeedback({ message: `"${editName}" updated successfully. Live on storefront.`, type: 'success' });
      setEditingProduct(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ message: res.error || 'Failed to update product.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Product Catalog & Pricing Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Control selling prices, cost margins, public storefront visibility, and barcodes
          </p>
        </div>

        <button
          onClick={() => setActiveQuickModal('addProduct')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, Urdu, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
            />
          </div>

          <div className="text-xs text-stone-500 dark:text-slate-400 font-semibold">
            {filteredProducts.length} of {products.length} Products Shown
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-slate-800/60 text-stone-600 dark:text-slate-300 hover:bg-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Admin Products Table */}
      <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200/80 dark:border-slate-800 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Retail Price (PKR)</th>
                <th className="p-3.5">Stock & Threshold</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Public Store</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
              {filteredProducts.map((p) => {
                const margin = Math.round(((p.price - p.costPrice) / p.price) * 100);
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-800">
                          <ImageWithFallback src={p.image} alt={p.name} fallbackText={p.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 dark:text-slate-100 truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                            <span className="font-mono">{p.sku}</span>
                            <span>•</span>
                            <span>{p.barcode}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium">{p.category}</td>
                    <td className="p-3.5 text-stone-500 font-mono">
                      Rs. {p.costPrice.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-stone-900 dark:text-white font-mono">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        ({margin}%)
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold">{p.stock}</span> {p.unit}
                      <span className="block text-[10px] text-stone-400">Min: {p.minStockLevel}</span>
                    </td>
                    <td className="p-3.5">
                      <StockBadge status={p.status} />
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleProductPublic(p.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          p.isPublic
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-500 border border-stone-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title="Click to toggle public storefront display"
                      >
                        {p.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.isPublic ? 'Public' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="p-1.5 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Restock / Adjust Stock"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${p.name} from catalog?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Edit Product Details</h3>
                <button onClick={() => setEditingProduct(null)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Urdu Name</label>
                    <input
                      type="text"
                      value={editUrdu}
                      onChange={(e) => setEditUrdu(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Retail Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Cost Price (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Stock Count</label>
                    <input
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Low Stock Alert Level</label>
                    <input
                      type="number"
                      min="1"
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">SKU</label>
                    <input
                      type="text"
                      value={editSku}
                      onChange={(e) => setEditSku(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">Unit</label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800"
                  />
                  <label htmlFor="editIsPublic" className="font-semibold text-stone-700 dark:text-slate-300">
                    Display product on public general store website
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-stone-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <StockAdjustModal
        product={adjustProduct}
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
      />
    </div>
  );
};
