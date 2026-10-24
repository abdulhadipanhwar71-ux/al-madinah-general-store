import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageCircle, AlertCircle, Info } from 'lucide-react';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '../../utils/whatsapp';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientPhone: string;
  recipientName?: string;
  initialMessage: string;
  title?: string;
  onSent?: () => void;
}

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({
  isOpen,
  onClose,
  recipientPhone,
  recipientName,
  initialMessage,
  title = 'WhatsApp Customer Message',
  onSent
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage, isOpen]);

  if (!isOpen) return null;

  const normalizedPhone = normalizeWhatsAppNumber(recipientPhone);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = buildWhatsAppUrl(recipientPhone, message);
    window.open(url, '_blank');
    if (onSent) onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">{title}</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  To: <strong>{recipientName || 'Customer'}</strong> ({recipientPhone || 'No number specified'})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!normalizedPhone && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Warning: No valid phone number provided. You can still copy the message.</span>
            </div>
          )}

          {/* Message Textarea */}
          <div className="mt-4 space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
              Message Content (Editable before sending)
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 dark:text-slate-100 font-sans"
            />
          </div>

          {/* Disclosure */}
          <div className="mt-3 p-3 bg-stone-50 dark:bg-slate-800/50 rounded-xl text-[11px] text-stone-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Opens official WhatsApp Web / Mobile app with this pre-filled message. Message delivery is completed via WhatsApp.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="mt-5 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!normalizedPhone}
                onClick={handleOpenWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
