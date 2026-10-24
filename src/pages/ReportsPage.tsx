import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  Layers,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MetricCard } from '../components/common/MetricCard';
import { DAILY_SALES_HISTORY, CATEGORY_DISTRIBUTION } from '../data/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { transactions, products } = useStore();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'ytd'>('7d');
  const [exported, setExported] = useState(false);

  // Financial calculations
  const totalRevenue = 444100; // 7-day cumulative
  const totalCost = 345000;
  const netProfit = totalRevenue - totalCost;
  const marginPercentage = Math.round((netProfit / totalRevenue) * 100);
  const avgOrderValue = Math.round(totalRevenue / 391);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Financial & Sales Reports
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Audit analytics, margin analysis, and sales velocity metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'today' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '7d' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '30d' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('ytd')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'ytd' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Year-to-Date
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Exported</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Gross Store Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          change="+16.4%"
          isPositive={true}
          subtitle="selected period"
          icon={DollarSign}
          highlight={true}
        />
        <MetricCard
          title="Net Retail Profit"
          value={`Rs. ${netProfit.toLocaleString()}`}
          change="+19.2%"
          isPositive={true}
          subtitle="after wholesale inventory cost"
          icon={TrendingUp}
        />
        <MetricCard
          title="Average Order Value (AOV)"
          value={`Rs. ${avgOrderValue.toLocaleString()}`}
          change="+5.1%"
          isPositive={true}
          subtitle="per customer bill"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Blended Margin"
          value={`${marginPercentage}%`}
          change="Optimal"
          isPositive={true}
          subtitle="grocery retail standard"
          icon={Percent}
          badge="Healthy"
          badgeColor="emerald"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue vs Profit Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Revenue & Profit Breakdown</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Daily gross turnover versus retained gross profit</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_SALES_HISTORY} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Total Sales (PKR)" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit (PKR)" fill="#C59A45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Categories Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131D2E] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">Top Categories by Sales</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Revenue split across grocery departments</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {CATEGORY_DISTRIBUTION.map((cat) => {
              const maxVal = 100000;
              const pct = Math.round((cat.value / maxVal) * 100);

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-slate-200">{cat.name}</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">
                      Rs. {cat.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
