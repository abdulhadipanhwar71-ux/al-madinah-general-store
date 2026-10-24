import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  XCircle, 
  PackagePlus, 
  Search, 
  Coins, 
  Warehouse, 
  History, 
  SlidersHorizontal,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MetricCard } from '../../components/common/MetricCard';
import { StockBadge } from '../../components/common/Badge';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { StockAdjustModal } from '../../components/modals/StockAdjustModal';
import { Product } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const { products, storeProfile, stockMovements, updateProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'reorder' | 'healthy' | 'out'>('all');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  // Quick inline threshold edit
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdVal, setThresholdVal] = useState('');

  const totalStockAsset = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
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

  const handleSaveThreshold = (productId: string) => {
    const val = parseInt(thresholdVal, 10);
    if (!isNaN(val) && val > 0) {
      updateProduct(productId, { minStockLevel: val });
    }
    setEditingThresholdId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Inventory Health & Stock Thresholds
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Default store reorder threshold: <strong>{storeProfile.defaultLowStockThreshold} units</strong> (Adjustable in Settings)
          </p>
        </div>

        {/* View Switch: Inventory vs Audit Movement Ledger */}
        <div className="flex items-center bg-stone-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
                : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            Stock Levels ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'movements'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
                : 'text-stone-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit Log ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Stock Asset Valuation"
          value={`Rs. ${totalStockAsset.toLocaleString()}`}
          subtitle={`Wholesale asset cost`}
          icon={Coins}
          highlight={true}
        />
        <MetricCard
          title="Retail Value Potential"
          value={`Rs. ${totalRetailPotential.toLocaleString()}`}
          subtitle={`${products.length} registered SKUs`}
          icon={Warehouse}
        />
        <MetricCard
          title="Reorder Threshold Alert"
          value={lowStockCount.toString()}
          subtitle="At or below custom threshold"
          isPositive={false}
          icon={AlertTriangle}
          badge={lowStockCount > 0 ? "Urgent Reorder" : "Optimal"}
          badgeColor="amber"
        />
        <MetricCard
          title="Depleted Out of Stock"
          value={outOfStockCount.toString()}
          subtitle="Zero units on shelf"
          isPositive={false}
          icon={XCircle}
          badge={outOfStockCount > 0 ? "Depleted" : "None"}
          badgeColor="rose"
        />
      </div>

      {activeTab === 'inventory' ? (
        /* Inventory Table */
        <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4">
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
                All SKUs ({products.length})
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
                Depleted ({outOfStockCount})
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200/80 dark:border-slate-800 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Item & SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Custom Reorder Threshold</th>
                  <th className="p-3">Asset Value</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Restock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
                {filtered.map(p => (
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
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">
                      <span className="font-bold text-sm text-stone-900 dark:text-white">{p.stock}</span> {p.unit}
                    </td>
                    <td className="p-3">
                      {editingThresholdId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={thresholdVal}
                            onChange={(e) => setThresholdVal(e.target.value)}
                            className="w-16 px-1.5 py-0.5 border rounded text-xs bg-white dark:bg-slate-800"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveThreshold(p.id)}
                            className="p-1 rounded bg-emerald-800 text-white text-[10px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingThresholdId(p.id);
                            setThresholdVal(p.minStockLevel.toString());
                          }}
                          className="hover:underline text-emerald-800 dark:text-emerald-400 font-semibold"
                          title="Click to edit custom threshold"
                        >
                          {p.minStockLevel} {p.unit} (Edit)
                        </button>
                      )}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      Rs. {(p.costPrice * p.stock).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <StockBadge status={p.status} count={p.stock} unit={p.unit} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setAdjustProduct(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-semibold text-xs"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Movement Audit Ledger */
        <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card p-5 overflow-hidden">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3">Stock Movement & Restocking Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity Delta</th>
                  <th className="p-3">Stock Level Change</th>
                  <th className="p-3">Audit Note / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-700 dark:text-slate-200">
                {stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-stone-50/60">
                    <td className="p-3 text-stone-500 font-mono text-[11px]">{m.date}</td>
                    <td className="p-3 font-semibold">{m.productName} ({m.sku})</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        m.type === 'restock' ? 'bg-emerald-100 text-emerald-800' :
                        m.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                    </td>
                    <td className="p-3 text-stone-500 font-mono">
                      {m.previousStock} → {m.newStock}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-slate-300">
                      {m.reason || 'Standard update'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
