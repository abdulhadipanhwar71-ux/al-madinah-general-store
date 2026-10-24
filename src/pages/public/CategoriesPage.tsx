import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Apple, 
  Wheat, 
  Flame, 
  Coffee, 
  Sparkle, 
  Cookie, 
  Home as HomeIcon,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoriesPage: React.FC = () => {
  const { products, storeProfile } = useStore();

  const categories = [
    { 
      name: 'Fresh Produce', 
      urdu: 'تازہ پھل اور سبزیاں',
      icon: Apple, 
      desc: 'Farm fresh seasonal Swat apples, desi red onions, golden potatoes, and roma tomatoes delivered daily.',
      count: products.filter(p => p.category === 'Fresh Produce').length 
    },
    { 
      name: 'Grains & Pulses', 
      urdu: 'چاول، آٹا اور دالیں',
      icon: Wheat, 
      desc: 'Super Kernel Basmati rice 5kg bags, whole wheat chakki atta 10kg, daal chana, and washed daal moong.',
      count: products.filter(p => p.category === 'Grains & Pulses').length 
    },
    { 
      name: 'Oils & Ghee', 
      urdu: 'کوکنگ آئل اور بناسپتی گھی',
      icon: Flame, 
      desc: 'Dalda Cooking Oil 5L canisters, Mezan banaspati pouches, and cholesterol-free Habib canola oil.',
      count: products.filter(p => p.category === 'Oils & Ghee').length 
    },
    { 
      name: 'Dairy & Beverages', 
      urdu: 'دودھ، چائے اور مشروبات',
      icon: Coffee, 
      desc: "Olper's pure milk 1L cartons, Tapal Danedar family pack tea 900g, Rooh Afza syrup, and mineral water.",
      count: products.filter(p => p.category === 'Dairy & Beverages').length 
    },
    { 
      name: 'Spices & Condiments', 
      urdu: 'مصالحہ جات اور نمک',
      icon: Sparkle, 
      desc: 'Shan Bombay Biryani mixes, National iodized salt, turmeric powder, and traditional whole spices.',
      count: products.filter(p => p.category === 'Spices & Condiments').length 
    },
    { 
      name: 'Snacks & Bakery', 
      urdu: 'بسکٹ، ڈبل روٹی اور نمکو',
      icon: Cookie, 
      desc: 'Dawn sandwich bread, Peek Freans Sooper family packs, Lays french cheese crisps, and morning tea treats.',
      count: products.filter(p => p.category === 'Snacks & Bakery').length 
    },
    { 
      name: 'Household & Cleaning', 
      urdu: 'گھریلو اشیاء اور صابن',
      icon: HomeIcon, 
      desc: 'Surf Excel quick wash detergent powder 1kg, Dettol antibacterial soap bundles, and dishwashing liquids.',
      count: products.filter(p => p.category === 'Household & Cleaning').length 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Browse by Department
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Explore all grocery aisles stocked at {storeProfile.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/catalog?cat=${encodeURIComponent(cat.name)}`}
            className="p-6 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
                  {cat.count} items
                </span>
              </div>

              <h2 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">{cat.urdu}</p>
              <p className="text-xs text-stone-600 dark:text-slate-300 mt-3 leading-relaxed">
                {cat.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-400 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>View In-Stock Items</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
