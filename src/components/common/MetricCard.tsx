import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue';
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  badge,
  badgeColor = 'emerald',
  highlight = false,
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-200 border ${
      highlight 
        ? 'bg-gradient-to-br from-emerald-900 to-forest-950 text-white border-emerald-800 shadow-elevated' 
        : 'bg-white dark:bg-[#131D2E] border-stone-200/80 dark:border-slate-800 shadow-card hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/60'
    }`}>
      {/* Background decoration for highlighted card */}
      {highlight && (
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 pointer-events-none blur-xl"></div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold tracking-wider uppercase ${
            highlight ? 'text-emerald-200/90' : 'text-stone-500 dark:text-slate-400'
          }`}>
            {title}
          </p>
          <h3 className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight ${
            highlight ? 'text-white' : 'text-stone-900 dark:text-slate-100'
          }`}>
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl flex-shrink-0 ${
          highlight 
            ? 'bg-emerald-800/80 text-emerald-200' 
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-slate-800/80 text-xs">
        {change && (
          <span className={`inline-flex items-center gap-1 font-semibold ${
            highlight
              ? (isPositive ? 'text-emerald-300' : 'text-rose-300')
              : (isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </span>
        )}

        {subtitle && (
          <span className={`${
            highlight ? 'text-emerald-100/70' : 'text-stone-500 dark:text-slate-400'
          }`}>
            {subtitle}
          </span>
        )}

        {badge && (
          <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            badgeColor === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
            badgeColor === 'rose' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
            badgeColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
