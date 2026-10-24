import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export const ContactPage: React.FC = () => {
  const { storeProfile } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Contact & Store Timings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Reach our counter for grocery orders, product inquiries, or doorstep deliveries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* WhatsApp Direct Card */}
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2.5 text-[#128C7E] dark:text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Instant WhatsApp Order Desk</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
              Snap a picture of your handwritten shopping list or send a voice note directly to our counter staff.
            </p>
            <a
              href={buildWhatsAppUrl(storeProfile.whatsappNumber, `Assalam-o-Alaikum ${storeProfile.name}, I am contacting you from your store website.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message {storeProfile.whatsappNumber}</span>
            </a>
          </div>

          {/* Details Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131D2E] border border-stone-200/80 dark:border-slate-800 shadow-card space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-white">Shop Address</p>
                <p className="text-stone-500 dark:text-slate-400 mt-0.5">{storeProfile.address}, {storeProfile.city}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-white">Working Hours</p>
                <p className="text-stone-500 dark:text-slate-400 mt-0.5">{storeProfile.storeHours}</p>
                <p className="text-stone-400 text-[11px]">7 Days a Week, No break on Fridays</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-white">Landline & Mobile</p>
                <p className="text-stone-500 dark:text-slate-400 mt-0.5">{storeProfile.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-white">Email Address</p>
                <p className="text-stone-500 dark:text-slate-400 mt-0.5">{storeProfile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131D2E] p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-card">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
            Send an Online Inquiry
          </h3>
          <p className="text-xs text-stone-500 dark:text-slate-400 mb-6">
            Leave a note regarding bulk orders, marriage catering supplies, or delivery areas.
          </p>

          {submitted && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                WhatsApp / Mobile Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Inquiry / Delivery Instructions *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Type your message, questions about items, or request a call back..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
