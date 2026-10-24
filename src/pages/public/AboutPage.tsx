import React from 'react';
import { 
  Store, 
  ShieldCheck, 
  HeartHandshake, 
  Award, 
  MapPin, 
  Clock, 
  Phone,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { storeProfile } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-in fade-in duration-150">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs font-bold tracking-wide">
          Serving {storeProfile.city || 'Khairpur Mirs'} Families
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Your Trusted Neighborhood Grocery Store
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed">
          At {storeProfile.name}, we believe everyday groceries should be impeccably fresh, genuinely branded, and priced fairly for every household.
        </p>
      </div>

      {/* Story & Standards Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Daily Mandi Procurement</h3>
          <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
            Every morning early, our procurement team inspects fresh arrivals at local farm markets to bring only Grade-A farm produce to our shelves.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Guaranteed Brand Authenticity</h3>
          <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
            We purchase cooking oils, teas, and dairy directly from certified company distributors. No counterfeit or sub-standard packaging is ever accepted.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Community Care & Respect</h3>
          <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
            Over a decade of honest scales, prompt door deliveries, and respectful relationships with thousands of neighborhood residents.
          </p>
        </div>
      </div>

      {/* Store Location & Proprietor */}
      <div className="p-8 sm:p-10 rounded-3xl bg-stone-100 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">
            Visit Our Store in {storeProfile.city || 'Khairpur Mirs'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-slate-400">
            {storeProfile.address}, {storeProfile.city}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {storeProfile.storeHours}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {storeProfile.phone}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 block">Managed By</span>
          <span className="text-sm font-bold text-stone-900 dark:text-white">{storeProfile.ownerName}</span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 block">Proprietor</span>
        </div>
      </div>
    </div>
  );
};
