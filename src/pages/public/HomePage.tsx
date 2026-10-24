import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Apple, 
  Wheat, 
  Flame, 
  Coffee, 
  Sparkle, 
  Cookie, 
  Home as HomeIcon,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { ProductCategory } from '../../types';
import { buildWhatsAppUrl, createProductInquiryMessage } from '../../utils/whatsapp';

export const HomePage: React.FC = () => {
  const { products, addToPublicCart, storeProfile } = useStore();

  // Public products only
  const publicProducts = products.filter(p => p.isPublic);
  const featuredProducts = publicProducts.filter(p => p.featured || p.status === 'in_stock').slice(0, 8);

  const categories = [
    { name: 'Fresh Produce', icon: Apple, desc: 'Farm fruits & daily sabzi', count: products.filter(p => p.category === 'Fresh Produce').length },
    { name: 'Grains & Pulses', icon: Wheat, desc: 'Basmati rice, atta & daal', count: products.filter(p => p.category === 'Grains & Pulses').length },
    { name: 'Oils & Ghee', icon: Flame, desc: 'Dalda, Habib & Banaspati', count: products.filter(p => p.category === 'Oils & Ghee').length },
    { name: 'Dairy & Beverages', icon: Coffee, desc: "Olper's milk, Tapal & juices", count: products.filter(p => p.category === 'Dairy & Beverages').length },
    { name: 'Spices & Condiments', icon: Sparkle, desc: 'Shan masalas, salt & herbs', count: products.filter(p => p.category === 'Spices & Condiments').length },
    { name: 'Snacks & Bakery', icon: Cookie, desc: 'Fresh bread, biscuits & crisps', count: products.filter(p => p.category === 'Snacks & Bakery').length },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/90 via-stone-50 to-[#FBFBFA] dark:from-slate-900 dark:via-slate-900/60 dark:to-[#0B1320] border-b border-stone-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{storeProfile.city ? `${storeProfile.city}'s` : "Khairpur Mirs'"} Trusted Neighborhood Grocery</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]">
              Pure Quality Groceries, <br className="hidden sm:block" />
              <span className="text-emerald-800 dark:text-emerald-400">Delivered Fresh Daily.</span>
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Direct from fresh farm arrivals and certified brand suppliers. Order premium Basmati rice, farm vegetables, pure cooking oils, and daily pantry staples right to your doorstep.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/catalog"
                className="px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Store Catalog</span>
              </Link>

              <a
                href={buildWhatsAppUrl(storeProfile.whatsappNumber, `Assalam-o-Alaikum ${storeProfile.name}, I would like to order groceries.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-100 font-bold text-sm border border-stone-200 dark:border-slate-700 shadow-xs flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Order List</span>
              </a>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-stone-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No artificial ripening
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Accurate digital weights
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Fair Mandi pricing
              </span>
            </div>
          </div>

          {/* Right Hero Image Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[4/3] sm:aspect-[5/4]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt={`${storeProfile.name} Display`}
                className="w-full h-full object-cover"
                fallbackText={storeProfile.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs uppercase font-bold tracking-wider text-emerald-300">Daily Fresh Batch</p>
                  <p className="text-sm sm:text-base font-extrabold mt-0.5">{storeProfile.address ? `${storeProfile.address} Open Today` : 'Ripri, Khairpur Mirs Open Today'}</p>
                  <p className="text-xs text-stone-300">Timings: {storeProfile.storeHours || '8:00 AM – 11:00 PM'}</p>
                </div>
              </div>
            </div>

            {/* Small Floating Badge */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-elevated border border-stone-200/80 dark:border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                100%
              </div>
              <div className="text-left text-xs">
                <p className="font-extrabold text-stone-900 dark:text-slate-100">Genuine Brands</p>
                <p className="text-stone-400">Direct distributor supply</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Explore Grocery Departments
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
              Select an aisle to view available items and current market rates
            </p>
          </div>

          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>All 7 Departments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?cat=${encodeURIComponent(cat.name)}`}
              className="p-4 rounded-2xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-slate-100 leading-tight">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-400 mt-1">{cat.count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products / Weekly Specials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Specials & Staples</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Featured In-Store Items
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
              Current daily prices and real-time inventory availability
            </p>
          </div>

          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Price List</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#131D2E] rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Photo */}
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
                      Sold Out
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

              {/* Product Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {p.category}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-stone-900 dark:text-slate-100 line-clamp-1">
                    {p.name}
                  </h4>
                  {p.urduName && (
                    <p className="text-xs text-stone-400 mt-0.5">{p.urduName}</p>
                  )}
                  {p.description && (
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-1.5 line-clamp-2">
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
                      <span>{p.stock === 0 && !p.allowBackorder ? 'Unavailable' : 'Add'}</span>
                    </button>
                  </div>

                  <a
                    href={buildWhatsAppUrl(storeProfile.whatsappNumber, createProductInquiryMessage(storeProfile.name, p))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 dark:bg-slate-800 text-stone-600 hover:text-[#128C7E] dark:text-slate-300 dark:hover:text-[#25D366] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Quick Order How-it-Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0B2A1E] text-white p-8 sm:p-12 lg:p-16 border border-emerald-900/60 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700/60">
              Convenient Ordering
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Order via WhatsApp in 3 Easy Steps
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              No complicated account creation needed. Build your list here or directly message us your requirements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50">
                <span className="text-emerald-400 font-extrabold text-lg">01</span>
                <h5 className="font-bold text-white mt-1">Select Items</h5>
                <p className="text-emerald-200/70 mt-1">Browse prices and add to your website basket.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50">
                <span className="text-emerald-400 font-extrabold text-lg">02</span>
                <h5 className="font-bold text-white mt-1">Send WhatsApp</h5>
                <p className="text-emerald-200/70 mt-1">Click send to dispatch your grocery bill to our counter.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50">
                <span className="text-emerald-400 font-extrabold text-lg">03</span>
                <h5 className="font-bold text-white mt-1">Doorstep Delivery</h5>
                <p className="text-emerald-200/70 mt-1">Packed carefully and delivered to your home.</p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={buildWhatsAppUrl(storeProfile.whatsappNumber, 'Assalam-o-Alaikum, I would like to order grocery.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm shadow-lg transition-transform active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat with Store Now ({storeProfile.whatsappNumber})</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
