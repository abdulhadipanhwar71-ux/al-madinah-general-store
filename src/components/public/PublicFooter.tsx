import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Lock,
  MessageCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export const PublicFooter: React.FC = () => {
  const { storeProfile } = useStore();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Trust Badges Bar */}
      <div className="border-b border-stone-800 py-8 bg-stone-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-800/60">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fresh Produce Daily</h4>
              <p className="text-xs text-stone-400 mt-0.5">Direct morning arrivals from Sabzi Mandi</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-800/60">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Brands</h4>
              <p className="text-xs text-stone-400 mt-0.5">Authentic cooking oils, tea, and packaged staples</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-800/60">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Neighborhood Delivery</h4>
              <p className="text-xs text-stone-400 mt-0.5">Quick delivery via WhatsApp in surrounding sectors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
        {/* Brand & Address (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">{storeProfile.name}</h3>
              <p className="text-stone-400 text-xs">{storeProfile.tagline}</p>
            </div>
          </div>

          <p className="text-stone-400 leading-relaxed max-w-sm">
            Serving families with uncompromised grocery hygiene, daily fair prices, and friendly customer care since 2012.
          </p>

          <div className="space-y-2 pt-2 text-stone-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{storeProfile.address}, {storeProfile.city}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{storeProfile.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{storeProfile.storeHours}</span>
            </div>
          </div>
        </div>

        {/* Quick Links (3 cols) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs">Grocery Aisles</h4>
          <ul className="space-y-2 text-stone-400">
            <li><Link to="/catalog?cat=Fresh%20Produce" className="hover:text-emerald-400 transition-colors">Fresh Fruits & Vegetables</Link></li>
            <li><Link to="/catalog?cat=Grains%20%26%20Pulses" className="hover:text-emerald-400 transition-colors">Basmati Rice, Atta & Daal</Link></li>
            <li><Link to="/catalog?cat=Oils%20%26%20Ghee" className="hover:text-emerald-400 transition-colors">Dalda Cooking Oil & Pure Ghee</Link></li>
            <li><Link to="/catalog?cat=Dairy%20%26%20Beverages" className="hover:text-emerald-400 transition-colors">Olper's Milk & Tapal Tea</Link></li>
            <li><Link to="/catalog?cat=Spices%20%26%20Condiments" className="hover:text-emerald-400 transition-colors">Shan Masalas & Iodized Salt</Link></li>
          </ul>
        </div>

        {/* Ordering & Staff Login (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs">Customer Care & Ordering</h4>
          <p className="text-stone-400 leading-relaxed">
            Send your shopping list directly over WhatsApp. We pack and notify you once ready for pickup or dispatch.
          </p>

          <a
            href={buildWhatsAppUrl(storeProfile.whatsappNumber, `Assalam-o-Alaikum ${storeProfile.name}, I want to place a grocery order.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-colors shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp ({storeProfile.whatsappNumber})</span>
          </a>

          <div className="pt-4 border-t border-stone-800">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors text-xs font-semibold border border-stone-700"
              title="Store Owner & Staff Login Portal"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Login (Staff Portal)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Bar with Admin Login backup link */}
      <div className="border-t border-stone-800/80 py-5 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 {storeProfile.name}. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="text-stone-400 hover:text-emerald-400 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Login</span>
            </Link>
            <span className="hidden sm:inline text-stone-700">•</span>
            <span className="text-[11px] text-stone-600">
              DukaanOS Retail Platform • {storeProfile.address ? `${storeProfile.address}` : 'Ripri, Khairpur Mirs'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
