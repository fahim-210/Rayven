import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { useToast } from '../../components/ui/Toast.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';

export const FirstAdminSetupView: React.FC = () => {
  const { navigate } = useRouter();
  const { firstAdminSetup, needsInitialSetup, adminCount } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Executive Operations');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Full name, email, and password are required.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Super Administrator password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await firstAdminSetup({
      fullName,
      email,
      department,
      phone,
      password,
    });
    setLoading(false);

    if (res.success) {
      addToast({
        title: 'Initial Super Admin Provisioned',
        description: 'System successfully initialized with primary administrative account.',
        type: 'success',
      });
      navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Failed to complete initial administrator setup.');
    }
  };

  // If initial setup has already been completed, do not allow public registration
  if (!needsInitialSetup && adminCount > 0) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12151c] border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white font-heading">
              Initial Setup Already Completed
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The primary Super Administrator account for RAYVEN has already been established.
              Public administrative registration is permanently locked per enterprise security policy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 text-left space-y-1.5">
            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Administrative Zone</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              Only authorized personnel can access the ERP system. Additional administrators may
              only be provisioned by an existing Super Admin from within the Governance dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="gold"
              size="md"
              className="w-full justify-center"
              onClick={() => navigate('/admin/login')}
            >
              Go to Admin Login
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-neutral-400 hover:text-white"
              onClick={() => navigate('/')}
            >
              Return to Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <BrandLogo size="md" className="justify-center mb-4" />
        
        {/* Initialization Status Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold mb-3">
          <ShieldAlert className="w-4 h-4" />
          <span>FIRST TIME SYSTEM INITIALIZATION</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
          Provision Root Administrator
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg mx-auto leading-relaxed">
          No administrative account currently exists in the database. Complete this one-time initial
          setup to establish the primary <strong className="text-white font-mono">SUPER_ADMIN</strong>.
          Once completed, public registration will be locked permanently.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-[#12151c] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

          {/* Database architectural notice */}
          <div className="mb-6 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3 text-left">
            <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-white">PostgreSQL Architecture Ready</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                This account will be assigned root role <code className="text-amber-400 font-mono">SUPER_ADMIN</code>,
                granting executive authority over products, size inventory, bKash/Nagad approvals, and financial ledgers.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Super Admin Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Fahim S."
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@rayven.store"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Executive Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Executive Operations"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Emergency Phone Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 901-2831"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Master Password (Min 8 Chars) *
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

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full justify-center font-bold tracking-wide"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Initialize RAYVEN & Activate Super Admin
              </Button>
            </div>
          </form>

          {/* Security policy footnote */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Bcrypt Salted • 256-bit Session Security</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-neutral-300 underline"
            >
              Cancel and Return to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
