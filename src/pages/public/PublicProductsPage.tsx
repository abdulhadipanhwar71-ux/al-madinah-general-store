import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, ShoppingBag, Check, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory, Product } from '../../types';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { EmptyState } from '../../components/common/EmptyState';
import { buildWhatsAppUrl, createProductInquiryMessage } from '../../utils/whatsapp';

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

export const PublicProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = (searchParams.get('cat') as ProductCategory) || 'All';

  const { products, storeProfile, addToPublicCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock'>('all');

  // Filter public products only
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isPublic) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (availabilityFilter === 'in_stock' && p.stock <= 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchUrdu = p.urduName && p.urduName.includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        if (!matchName && !matchUrdu && !matchCategory) return false;
      }
      return true;
    });
  }, [products, selectedCategory, availabilityFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Store Grocery Catalog & Rates
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Browse retail prices for fresh produce, grain bags, cooking oils, and daily necessities
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131D2E] p-4 sm:p-5 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product in English or Urdu (e.g. Rice, Dalda, آلو)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-3.5 py-2 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-semibold text-stone-700 dark:text-slate-300"
            >
              <option value="all">All Items</option>
              <option value="in_stock">Available In Stock Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchParams(cat !== 'All' ? { cat } : {});
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
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

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found in this aisle"
          description="Try selecting another category or searching with a different term."
          actionLabel="Show All Catalog Items"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
            setAvailabilityFilter('all');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-slate-800">
                <ImageWithFallback
                  src={p.image}
                  alt={p.name}
                  fallbackText={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {p.stock === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                      Out of Stock
                    </span>
                  ) : p.stock <= (p.minStockLevel || 10) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                      Low Stock ({p.stock} left)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {p.category}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-stone-900 dark:text-slate-100 line-clamp-1">
                    {p.name}
                  </h3>
                  {p.urduName && (
                    <p className="text-xs text-stone-400 mt-0.5">{p.urduName}</p>
                  )}
                  {p.description && (
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-stone-900 dark:text-white">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">/{p.unit}</span>
                    </div>

                    <button
                      onClick={() => addToPublicCart(p, 1)}
                      disabled={p.stock === 0 && !p.allowBackorder}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        p.stock === 0 && !p.allowBackorder
                          ? 'bg-stone-100 dark:bg-slate-800 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs active:scale-95'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{p.stock === 0 && !p.allowBackorder ? 'Unavailable' : 'Add to Basket'}</span>
                    </button>
                  </div>

                  <a
                    href={buildWhatsAppUrl(storeProfile.whatsappNumber, createProductInquiryMessage(storeProfile.name, p))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 dark:bg-slate-800 text-stone-600 hover:text-[#128C7E] dark:text-slate-300 dark:hover:text-[#25D366] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Ask about this item on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
