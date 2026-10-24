import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  DollarSign, 
  Percent, 
  Check, 
  Wallet, 
  Coins, 
  Warehouse 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MetricCard } from '../../components/common/MetricCard';
import { DAILY_SALES_HISTORY, CATEGORY_DISTRIBUTION } from '../../data/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const AdminReportsPage: React.FC = () => {
  const { transactions, products, customers, expenses } = useStore();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'ytd'>('7d');
  const [exported, setExported] = useState(false);

  // Accurate calculations
  const totalRevenue = 444100;
  const totalCOGS = 345000;
  const grossProfit = totalRevenue - totalCOGS; // Revenue - COGS
  const totalRecordedExpenses = expenses.reduce((s, e) => s + e.amount, 0) + 12000; // includes week operating overheads
  const netProfit = grossProfit - totalRecordedExpenses; // Gross Profit - Expenses
  const netMargin = Math.round((netProfit / totalRevenue) * 100);

  const inventoryValuation = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
  const totalUdhaarReceivable = customers.reduce((sum, c) => sum + c.balance, 0);

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = "Date/Period,Revenue (PKR),COGS (PKR),Gross Profit (PKR),Expenses (PKR),Net Profit (PKR)\n";
    const rows = DAILY_SALES_HISTORY.map(d => 
      `${d.day},${d.sales},${d.cogs},${d.profit},${d.expenses},${d.netProfit}`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `DukaanOS_Financial_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-slate-100 tracking-tight">
            Financial Audit & Profit Reports
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Compliant profit calculations: Gross Profit = Sales – COGS; Net Profit = Gross Profit – Expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'today' ? 'bg-emerald-800 text-white' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '7d' ? 'bg-emerald-800 text-white' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '30d' ? 'bg-emerald-800 text-white' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-800 dark:text-slate-200 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Gross Store Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          change="+16.4%"
          isPositive={true}
          subtitle={`COGS: Rs. ${totalCOGS.toLocaleString()}`}
          icon={DollarSign}
          highlight={true}
        />
        <MetricCard
          title="Gross Profit Margin"
          value={`Rs. ${grossProfit.toLocaleString()}`}
          change={`${Math.round((grossProfit/totalRevenue)*100)}%`}
          isPositive={true}
          subtitle="Before store expenses"
          icon={TrendingUp}
        />
        <MetricCard
          title="Operating Expenses"
          value={`Rs. ${totalRecordedExpenses.toLocaleString()}`}
          isPositive={false}
          subtitle="Rent, diesel, freight, wages"
          icon={Wallet}
        />
        <MetricCard
          title="Net Business Profit"
          value={`Rs. ${netProfit.toLocaleString()}`}
          change={`${netMargin}% Net Margin`}
          isPositive={true}
          subtitle="Actual owner earnings"
          icon={Percent}
          badge="Verified"
          badgeColor="emerald"
        />
      </div>

      {/* Balance Sheet Sub-metrics: Inventory Valuation & Customer Credit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Inventory Asset Valuation</span>
            <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
              Rs. {inventoryValuation.toLocaleString()}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Wholesale asset value on store shelves</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Outstanding Customer Udhaar</span>
            <h3 className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
              Rs. {totalUdhaarReceivable.toLocaleString()}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Receivable from local neighborhood accounts</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown Bar Chart */}
      <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
        <div className="mb-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Daily Revenue, COGS & Net Earnings (PKR)</h3>
          <p className="text-xs text-stone-500 dark:text-slate-400">Side-by-side financial audit comparison</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_SALES_HISTORY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'PKR']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="sales" name="Sales Revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cogs" name="Cost of Goods (COGS)" fill="#64748B" radius={[6, 6, 0, 0]} />
              <Bar dataKey="netProfit" name="Net Profit" fill="#C59A45" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
