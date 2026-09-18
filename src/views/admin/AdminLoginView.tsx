import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { useToast } from '../../components/ui/Toast.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertOctagon,
  Sparkles,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { navigate } = useRouter();
  const { loginAdmin, needsInitialSetup } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both administrative email and password.');
      return;
    }

    setLoading(true);
    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      addToast({
        title: 'Access Granted',
        description: 'Authorized administrative session established.',
        type: 'success',
      });
      navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Authentication denied. Please verify your administrative credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090c] text-[#f3f4f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <BrandLogo size="md" className="justify-center mb-4" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700/80 text-amber-400 text-xs font-mono font-bold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>RAYVEN ENTERPRISE ERP GATEWAY</span>
        </div>

        <h1 className="text-2xl font-bold font-heading text-white tracking-wide">
          Admin & Staff Portal
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          Restricted access. This console is reserved strictly for authorized store operators,
          inventory managers, and system administrators.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* If no admin exists, show prompt for initial setup */}
        {needsInitialSetup && (
          <div className="mb-4 p-4 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs space-y-2 text-left">
            <p className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Initial Setup Required</span>
            </p>
            <p className="text-neutral-300 text-[11px]">
              No administrative personnel account exists in the database. Please initialize the
              system by provisioning the first root Super Administrator.
            </p>
            <button
              onClick={() => navigate('/admin/setup')}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors"
            >
              <span>Initialize First Admin Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="bg-[#0f1218] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle amber indicator line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 text-left">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Staff / Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rayven.store"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Administrative Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="md"
              className="w-full justify-center mt-2 font-bold"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate to Admin ERP
            </Button>
          </form>

          {/* Links back to Storefront & Customer Portal */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80 flex flex-col gap-2 text-center text-xs text-neutral-400">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-amber-400 transition-colors"
            >
              Are you a customer? Go to Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-1 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
