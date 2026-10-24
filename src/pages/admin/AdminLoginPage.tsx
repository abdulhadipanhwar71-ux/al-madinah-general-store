import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { storeProfile } = useStore();
  const navigate = useNavigate();

  const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false';

  const [email, setEmail] = useState(isDemoMode ? 'admin@dukaanos.pk' : '');
  const [password, setPassword] = useState(isDemoMode ? 'admin123' : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#070E18] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Return to Public Website */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
          <span className="text-[11px] font-semibold text-stone-400">Terminal Security</span>
        </div>

        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0B2A1E] text-emerald-300 p-0.5 mx-auto flex items-center justify-center shadow-lg border border-emerald-800/60">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Dukaan<span className="text-emerald-700 dark:text-emerald-400">OS</span> Admin Portal
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
            Private management console for {storeProfile.name}
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-white dark:bg-[#131D2E] py-8 px-6 sm:px-10 shadow-elevated rounded-3xl border border-stone-200/80 dark:border-slate-800 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 focus:ring-2 focus:ring-emerald-600/30"
                  placeholder="admin@dukaanos.pk"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Terminal Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl dark:text-slate-100 focus:ring-2 focus:ring-emerald-600/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selector (Development Mode Only) */}
          {isDemoMode && (
            <div className="pt-4 border-t border-stone-100 dark:border-slate-800 text-xs">
              <p className="font-bold text-stone-700 dark:text-slate-300 mb-2">
                Select Demo Staff Role (Dev Mode):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemo('admin@dukaanos.pk', 'admin123')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    email === 'admin@dukaanos.pk'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">Store Owner</p>
                  <p className="text-[10px] text-stone-400">admin@dukaanos.pk</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('cashier@dukaanos.pk', 'cashier123')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    email === 'cashier@dukaanos.pk'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">Cashier</p>
                  <p className="text-[10px] text-stone-400">cashier@dukaanos.pk</p>
                </button>
              </div>
            </div>
          )}

          {/* Security architecture notice */}
          <div className="pt-2 text-[11px] text-stone-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Production architecture ready: Private business records are isolated from the public storefront and ready for FastAPI server-side JWT verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
