import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  ArrowRight,
  Plus, 
  Clock, 
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Store
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MetricCard } from '../components/common/MetricCard';
import { StockBadge, PaymentBadge } from '../components/common/Badge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { DAILY_SALES_HISTORY, CATEGORY_DISTRIBUTION } from '../data/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const { 
    products, 
    transactions, 
    setActiveInvoice, 
    setActiveQuickModal, 
    storeProfile 
  } = useStore();

  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');

  // Calculate live KPI metrics
  const todaySales = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalOrders = transactions.length;
  // Estimated gross profit (~22% retail margin on grocery)
  const estimatedProfit = Math.round(todaySales * 0.22);
  const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');

  // Top selling products by stock velocity
  const topProducts = [...products]
    .sort((a, b) => (b.price * (100 - b.stock)) - (a.price * (100 - a.stock)))
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Retail Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2A1E] via-[#0E3E2C] to-[#12583F] text-white shadow-elevated border border-emerald-900/60 p-6 sm:p-8 lg:p-10">
        {/* Background Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
            alt="Retail Store Backdrop"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Store Operations Hub • Shift 1 Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {storeProfile.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
            {storeProfile.tagline}. All terminal sales, real-time inventory counts, and customer credit ledger in one unified dashboard.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveQuickModal('newSale')}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>New POS Checkout</span>
            </button>

            <button
              onClick={() => setActiveQuickModal('addProduct')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add Stock / Product</span>
            </button>

            <Link
              to="/customers"
              className="px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Udhaar Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Today's Sales"
          value={`Rs. ${todaySales.toLocaleString()}`}
          change="+14.2%"
          isPositive={true}
          subtitle="vs yesterday"
          icon={TrendingUp}
          highlight={true}
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders.toString()}
          change="+8.5%"
          isPositive={true}
          subtitle="completed bills"
          icon={ShoppingCart}
          badge="Shift 1"
          badgeColor="emerald"
        />
        <MetricCard
          title="Estimated Gross Profit"
          value={`Rs. ${estimatedProfit.toLocaleString()}`}
          change="+18.1%"
          isPositive={true}
          subtitle="avg 22% retail margin"
          icon={DollarSign}
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems.length.toString()}
          change={`${lowStockItems.filter(p => p.status === 'out_of_stock').length} Out of Stock`}
          isPositive={false}
          subtitle="attention required"
          icon={AlertTriangle}
          badge={lowStockItems.length > 0 ? "Reorder" : "Healthy"}
          badgeColor={lowStockItems.length > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Revenue Performance</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">Daily store revenue and gross profit margins (PKR)</p>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartPeriod('7d')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartPeriod === '7d' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs' 
                    : 'text-stone-600 dark:text-slate-400'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setChartPeriod('30d')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartPeriod === '30d' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs' 
                    : 'text-stone-600 dark:text-slate-400'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_SALES_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C59A45" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C59A45" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `Rs. ${Number(value).toLocaleString()}`, 
                    name === 'sales' ? 'Revenue' : 'Gross Margin'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="sales"
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#salesGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="profit"
                  stroke="#C59A45" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#profitGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Revenue (Sales)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Estimated Profit Margin</span>
              </span>
            </div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Peak: Jummah & Saturday</span>
          </div>
        </div>

        {/* Category Share Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Category Share</h3>
              <span className="text-xs text-stone-400">This Week</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Top grossing product lines</p>

            <div className="h-48 my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Sales']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-slate-800 text-xs">
            {CATEGORY_DISTRIBUTION.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-stone-700 dark:text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-semibold text-stone-900 dark:text-slate-200">
                  Rs. {cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Recent Transactions</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">Live counter bills and counter invoices</p>
            </div>
            <Link
              to="/sales"
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Sales</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setActiveInvoice(tx)}
                className="py-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-slate-800/40 p-2 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate">
                      {tx.customerName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{tx.invoiceNumber}</span>
                      <span>•</span>
                      <span>{tx.time}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-extrabold text-stone-900 dark:text-slate-100">
                    Rs. {tx.total.toLocaleString()}
                  </p>
                  <div className="mt-0.5">
                    <PaymentBadge method={tx.paymentMethod} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts & Top Products (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Urgent Attention Stock Warning */}
          <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Stock Reorder Alerts</h3>
              </div>
              <Link
                to="/inventory"
                className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
              >
                Restock
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {lowStockItems.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl border border-stone-100 dark:border-slate-800/80 bg-stone-50/50 dark:bg-slate-850/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={p.image} alt={p.name} fallbackText={p.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-stone-400">Min: {p.minStockLevel} {p.unit}</p>
                    </div>
                  </div>

                  <StockBadge status={p.status} count={p.stock} unit={p.unit} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Moving Products */}
          <div className="bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100 mb-3">Top Selling Items</h3>
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-bold text-stone-400 w-4">{idx + 1}.</span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={p.image} alt={p.name} fallbackText={p.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400">{p.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">
                    Rs. {p.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
