import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PackagePlus, 
  Search, 
  ArrowUpDown,
  TrendingUp,
  Warehouse,
  Coins
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MetricCard } from '../components/common/MetricCard';
import { StockBadge } from '../components/common/Badge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { StockAdjustModal } from '../components/modals/StockAdjustModal';
import { Product } from '../types';

export const InventoryPage: React.FC = () => {
  const { products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'reorder' | 'healthy' | 'out'>('all');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  // Financial and stock summary
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalRetailPotential = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const healthyCount = products.filter(p => p.status === 'in_stock').length;

  const filtered = products.filter(p => {
    if (filterTab === 'reorder' && p.status !== 'low_stock') return false;
    if (filterTab === 'out' && p.status !== 'out_of_stock') return false;
    if (filterTab === 'healthy' && p.status !== 'in_stock') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
          Stock Control & Inventory Health
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
          Warehouse tracking, automatic reorder warnings, and inventory asset valuation
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Stock Asset Value"
          value={`Rs. ${totalStockValue.toLocaleString()}`}
          subtitle={`Retail Potential: Rs. ${totalRetailPotential.toLocaleString()}`}
          icon={Coins}
          highlight={true}
        />
        <MetricCard
          title="Active SKUs Stocked"
          value={products.length.toString()}
          subtitle={`${healthyCount} well-stocked items`}
          icon={Warehouse}
        />
        <MetricCard
          title="Reorder Threshold Alert"
          value={lowStockCount.toString()}
          subtitle="urgent supplier restock"
          isPositive={false}
          icon={AlertTriangle}
          badge={lowStockCount > 0 ? "Needs PO" : "Optimal"}
          badgeColor="amber"
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          subtitle="zero inventory on shelf"
          isPositive={false}
          icon={XCircle}
          badge={outOfStockCount > 0 ? "Depleted" : "Zero"}
          badgeColor="rose"
        />
      </div>

      {/* Inventory Controls & Table */}
      <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilterTab('reorder')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterTab === 'reorder'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Needs Reorder ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterTab('healthy')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterTab === 'healthy'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Well Stocked ({healthyCount})
            </button>
            <button
              onClick={() => setFilterTab('out')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterTab === 'out'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200/80 dark:border-slate-800 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">SKU & Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock Ratio & Level</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Asset Value</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
              {filtered.map(p => {
                const stockRatio = Math.min(100, Math.round((p.stock / (p.minStockLevel * 2.5)) * 100));
                const itemAsset = p.costPrice * p.stock;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                          <ImageWithFallback src={p.image} alt={p.name} fallbackText={p.name} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-slate-100">{p.name}</p>
                          <span className="font-mono text-[10px] text-stone-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-slate-800 font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="w-36">
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span>{p.stock} {p.unit}</span>
                          <span className="text-stone-400">{stockRatio}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.status === 'out_of_stock' ? 'w-0' :
                              p.status === 'low_stock' ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${p.status === 'out_of_stock' ? 0 : Math.max(8, stockRatio)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-stone-500 font-medium">
                      {p.minStockLevel} {p.unit}
                    </td>
                    <td className="p-3 font-semibold text-stone-900 dark:text-slate-100">
                      Rs. {itemAsset.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <StockBadge status={p.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setAdjustProduct(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustModal
        product={adjustProduct}
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
      />
    </div>
  );
};
