import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  Plus, 
  Wallet,
  Receipt,
  Boxes,
  Users,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MetricCard } from '../../components/common/MetricCard';
import { StockBadge, PaymentBadge } from '../../components/common/Badge';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { DAILY_SALES_HISTORY, CATEGORY_DISTRIBUTION } from '../../data/mockData';
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

export const AdminDashboardPage: React.FC = () => {
  const { 
    products, 
    transactions, 
    expenses,
    orders,
    setActiveInvoice, 
    setActiveQuickModal, 
    storeProfile 
  } = useStore();

  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');

  // Actual Business Metric Calculations
  const todaySales = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalOrders = transactions.length;

  // Calculate actual COGS for today's transactions
  const todayCogs = transactions.reduce((sum, tx) => {
    return sum + tx.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const unitCost = prod ? prod.costPrice : (item.unitPrice * 0.8);
      return iSum + (unitCost * item.quantity);
    }, 0);
  }, 0);

  // Gross profit = Sales - COGS
  const grossProfit = Math.max(0, todaySales - todayCogs);

  // Total expenses recorded
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Today's expenses
  const todayExpenses = expenses.filter(e => e.date === '2026-10-24').reduce((sum, e) => sum + e.amount, 0);

  // Net Profit = Gross Profit - Recorded Expenses
  const netProfit = grossProfit - todayExpenses;

  const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
  const recentTransactions = transactions.slice(0, 5);
  const pendingOrdersCount = orders.filter(o => o.status === 'New' || o.status === 'Awaiting Confirmation').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Pending Web Orders Action Banner */}
      {pendingOrdersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-stone-900 font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 dark:text-slate-100 text-sm sm:text-base">
                {pendingOrdersCount} New Customer {pendingOrdersCount === 1 ? 'Order' : 'Orders'} Awaiting Confirmation
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                Website shoppers have submitted grocery orders requiring inventory verification and WhatsApp delivery scheduling.
              </p>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto whitespace-nowrap"
          >
            <span>Review Orders ({pendingOrdersCount})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Admin Terminal Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Terminal 01 • Shift Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
            {storeProfile.name} Operations Console
          </h2>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            Real-time business audit, POS reconciliation, and financial ledger
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveQuickModal('newSale')}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New POS Bill</span>
          </button>

          <Link
            to="/admin/expenses"
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4 text-stone-500" />
            <span>Record Expense</span>
          </Link>

          <Link
            to="/admin/products"
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-stone-500" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row (Includes Gross Profit, Net Profit & Expenses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Today's Gross Sales"
          value={`Rs. ${todaySales.toLocaleString()}`}
          subtitle={`${totalOrders} counter bills`}
          change="+14.2%"
          isPositive={true}
          icon={TrendingUp}
          highlight={true}
        />

        <MetricCard
          title="Gross Profit"
          value={`Rs. ${grossProfit.toLocaleString()}`}
          subtitle="Sales minus COGS"
          change="+16.8%"
          isPositive={true}
          icon={DollarSign}
        />

        <MetricCard
          title="Today's Expenses"
          value={`Rs. ${todayExpenses.toLocaleString()}`}
          subtitle={`${totalExpenses.toLocaleString()} PKR this month`}
          isPositive={false}
          icon={Wallet}
          badge="Audit"
          badgeColor="amber"
        />

        <MetricCard
          title="Net Retail Profit"
          value={`Rs. ${netProfit.toLocaleString()}`}
          subtitle="Gross profit minus expenses"
          isPositive={netProfit > 0}
          icon={DollarSign}
          badge="Verified"
          badgeColor="emerald"
        />

        <MetricCard
          title="Low Stock Items"
          value={lowStockItems.length.toString()}
          subtitle="Urgent supplier reorder"
          isPositive={false}
          icon={AlertTriangle}
          badge={lowStockItems.length > 0 ? "Reorder" : "Good"}
          badgeColor={lowStockItems.length > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Profit Trends (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Revenue & Profit Performance</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">Actual sales volume and gross profit trends in PKR</p>
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
                  <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="adminProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C59A45" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C59A45" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `Rs. ${Number(value).toLocaleString()}`, 
                    name === 'sales' ? 'Gross Revenue' : 'Gross Profit'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sales" name="sales" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#adminSalesGrad)" />
                <Area type="monotone" dataKey="profit" name="profit" stroke="#C59A45" strokeWidth={2} fillOpacity={1} fill="url(#adminProfitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Department Share</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Revenue split across inventory lines</p>

            <div className="h-44 my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
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

      {/* Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions (7 cols) - Pure text, NO customer portraits */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Recent Counter Transactions</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">Live invoices & payment modes</p>
            </div>
            <Link
              to="/admin/sales"
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Sales Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setActiveInvoice(tx)}
                className="py-3 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-slate-800/40 p-2 rounded-xl cursor-pointer transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">{tx.invoiceNumber}</span>
                    <span className="text-[11px] text-stone-400">• {tx.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-900 dark:text-slate-100 truncate mt-0.5">
                    {tx.customerName}
                  </p>
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

        {/* Low Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Stock Reorder Alerts</h3>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
            >
              Reorder
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {lowStockItems.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl border border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-850/50 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-stone-900 dark:text-slate-200 truncate">{p.name}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{p.sku} • Min: {p.minStockLevel} {p.unit}</p>
                </div>

                <StockBadge status={p.status} count={p.stock} unit={p.unit} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
