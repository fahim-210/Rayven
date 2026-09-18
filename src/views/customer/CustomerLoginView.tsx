import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { useToast } from '../../components/ui/Toast.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const CustomerLoginView: React.FC = () => {
  const { navigate } = useRouter();
  const { loginCustomer, registerCustomer, forgotPassword, resetPassword, needsInitialSetup } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [demoTokenGenerated, setDemoTokenGenerated] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await loginCustomer(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      addToast({
        title: 'Welcome Back',
        description: 'Successfully signed in to your RAYVEN account.',
        type: 'success',
      });
      navigate('/account');
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName || !regEmail || !regPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await registerCustomer({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setLoading(false);

    if (res.success) {
      addToast({
        title: 'Account Created',
        description: 'Your RAYVEN customer account has been established.',
        type: 'success',
      });
      navigate('/account');
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(forgotEmail);
    setLoading(false);

    if (res.success) {
      if (res.demoResetToken) {
        setDemoTokenGenerated(res.demoResetToken);
        setResetToken(res.demoResetToken);
      }
      addToast({
        title: 'Reset Code Generated',
        description: 'You can now proceed to set a new password.',
        type: 'info',
      });
      setActiveTab('reset');
    } else {
      setErrorMessage(res.error || 'Failed to dispatch reset request.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetToken || !newPassword) {
      setErrorMessage('Please provide the reset code and new password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(resetToken, newPassword);
    setLoading(false);

    if (res.success) {
      addToast({
        title: 'Password Updated',
        description: 'Your password has been changed. You may now sign in.',
        type: 'success',
      });
      setLoginPassword('');
      setActiveTab('signin');
    } else {
      setErrorMessage(res.error || 'Password reset failed. The token may be expired.');
    }
  };

  // Quick helper to fill demo customer
  const fillSampleCustomer = () => {
    setLoginEmail('alex.mercer@gmail.com');
    setLoginPassword('password123');
  };

  return (
    <CustomerLayout>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#12151c] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gold top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/20 via-amber-400 to-amber-400/20" />

          {/* Brand header */}
          <div className="text-center mb-8">
            <BrandLogo size="md" className="justify-center mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide">
              {activeTab === 'signin' && 'Welcome to RAYVEN'}
              {activeTab === 'signup' && 'Create Customer Account'}
              {activeTab === 'forgot' && 'Reset Password'}
              {activeTab === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {activeTab === 'signin' && 'Sign in to access your orders, wishlist, and exclusive kits.'}
              {activeTab === 'signup' && 'Join the RAYVEN syndicate for official football matchwear.'}
              {activeTab === 'forgot' && 'Enter your registered email to receive a recovery code.'}
              {activeTab === 'reset' && 'Enter your reset token and your new secure password.'}
            </p>
          </div>

          {/* Tabs for Sign In vs Sign Up */}
          {(activeTab === 'signin' || activeTab === 'signup') && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signin'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN TAB */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMessage(''); }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full justify-center mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>

              {/* Sample Customer Quick Fill Helper */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={fillSampleCustomer}
                  className="w-full py-2 px-3 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 text-[11px] text-neutral-400 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fill Demo Customer (alex.mercer@gmail.com)</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP TAB */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Marcus Rashford"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full justify-center mt-2"
                isLoading={loading}
              >
                Create Account & Join
              </Button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD TAB */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full justify-center"
                isLoading={loading}
              >
                Generate Password Reset Code
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD EXECUTION TAB */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              {demoTokenGenerated && (
                <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs">
                  <p className="font-bold">Generated Reset Code (Demo):</p>
                  <p className="font-mono text-[11px] break-all select-all mt-0.5">{demoTokenGenerated}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Reset Token / Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  New Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full justify-center"
                isLoading={loading}
              >
                Set New Password
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Divider & Separate Admin Login Link */}
          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Are you a store operator or staff member?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (needsInitialSetup) {
                  navigate('/admin/setup');
                } else {
                  navigate('/admin/login');
                }
              }}
              className="mt-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            >
              {needsInitialSetup
                ? 'First Time Admin Setup (Initialization) →'
                : 'Admin ERP Portal Login →'}
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
