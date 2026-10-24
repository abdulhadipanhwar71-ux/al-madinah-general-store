import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Plus, 
  Filter, 
  SlidersHorizontal, 
  PackagePlus, 
  Check, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory, Product, StockStatus } from '../types';
import { StockBadge } from '../components/common/Badge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { EmptyState } from '../components/common/EmptyState';
import { StockAdjustModal } from '../components/modals/StockAdjustModal';

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

export const ProductsPage: React.FC = () => {
  const { products, setActiveQuickModal, globalSearch, setGlobalSearch } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [localSearch, setLocalSearch] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  // Combine local search and global search if active
  const effectiveSearch = localSearch || globalSearch;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      // Stock status match
      if (stockFilter !== 'all' && p.status !== stockFilter) return false;
      // Search match
      if (effectiveSearch.trim()) {
        const query = effectiveSearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesUrdu = p.urduName && p.urduName.includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesBarcode = p.barcode.includes(query);
        if (!matchesName && !matchesUrdu && !matchesSku && !matchesBarcode) return false;
      }
      return true;
    });
  }, [products, selectedCategory, stockFilter, effectiveSearch]);

  const visibleProducts = filteredProducts.slice(0, pageSize);
  const hasMore = visibleProducts.length < filteredProducts.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Store Catalog & Products
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            {products.length} registered grocery items across 7 departments
          </p>
        </div>

        <button
          onClick={() => setActiveQuickModal('addProduct')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by product name, Urdu title, SKU or barcode..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Controls: Stock Filter & View Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-2.5">
            {/* Stock status filter dropdown */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-medium text-stone-700 dark:text-slate-300"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock Warnings</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Grid / Table toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-500 dark:text-slate-400'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-500 dark:text-slate-400'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-slate-800/60 text-stone-600 dark:text-slate-300 hover:bg-stone-200/80 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Content: Grid or Table */}
      {visibleProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your category filter, stock status, or search keywords."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setLocalSearch('');
            setGlobalSearch('');
            setSelectedCategory('All');
            setStockFilter('all');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Image-Based Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {visibleProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#131D2E] rounded-2xl border border-stone-200/80 dark:border-slate-800 overflow-hidden shadow-card hover:shadow-elevated hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 flex flex-col group"
            >
              {/* Product Photo Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-slate-800">
                <ImageWithFallback
                  src={p.image}
                  alt={p.name}
                  fallbackText={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <StockBadge status={p.status} count={p.stock} unit={p.unit} />
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                  {p.sku}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-stone-900 dark:text-slate-100 line-clamp-2">
                    {p.name}
                  </h4>
                  {p.urduName && (
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{p.urduName}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Retail Price</span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-slate-100">
                      Rs. {p.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-stone-400 ml-1">/{p.unit}</span>
                  </div>

                  <button
                    onClick={() => setAdjustProduct(p)}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                    title="Adjust or Restock Stock"
                  >
                    <PackagePlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Professional SaaS Table View */
        <div className="bg-white dark:bg-[#131D2E] rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-slate-800/50 border-b border-stone-200/80 dark:border-slate-800 text-stone-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU / Barcode</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
                {visibleProducts.map((p) => {
                  const marginPercent = Math.round(((p.price - p.costPrice) / p.price) * 100);
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                            <ImageWithFallback src={p.image} alt={p.name} fallbackText={p.name} />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-slate-100">{p.name}</p>
                            {p.urduName && (
                              <p className="text-[11px] text-stone-400">{p.urduName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div>{p.sku}</div>
                        <div className="text-stone-400">{p.barcode}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500">
                        Rs. {p.costPrice.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-stone-900 dark:text-slate-100">
                        Rs. {p.price.toLocaleString()}
                        <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                          (+{marginPercent}%)
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold">{p.stock}</span> {p.unit}
                      </td>
                      <td className="p-3.5">
                        <StockBadge status={p.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-slate-700 hover:border-emerald-600 text-stone-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination / Load More Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-slate-400 pt-2">
        <p>
          Showing {visibleProducts.length} of {filteredProducts.length} items
        </p>

        {hasMore && (
          <button
            onClick={() => setPageSize((prev) => prev + 12)}
            className="px-5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-800 dark:text-slate-200 font-semibold hover:bg-stone-50 shadow-xs"
          >
            Load More Products
          </button>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        product={adjustProduct}
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
      />
    </div>
  );
};
