import React from 'react';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ShieldX, Lock, Store, LogOut, ArrowLeft } from 'lucide-react';

export const AdminAccessDeniedView: React.FC = () => {
  const { navigate } = useRouter();
  const { user, logout } = useAuth();

  const handleSignOutAndAdminLogin = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#07090c] text-[#f3f4f6] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-[#0f1218] border border-red-900/40 rounded-2xl p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
        {/* Red security warning accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
            HTTP 403 FORBIDDEN • ACCESS DENIED
          </span>
          <h1 className="text-2xl font-bold font-heading text-white">
            Administrative Area Restricted
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            You are currently signed in as <strong className="text-white">{user?.fullName || 'a Customer'}</strong> (Account Role: <code className="text-amber-400 font-mono">CUSTOMER</code>).
            Customer accounts are strictly prohibited from accessing internal ERP management dashboards or administrative endpoints.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left text-xs space-y-2">
          <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Enforced Server-Side Access Control</span>
          </p>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            All operations affecting catalog pricing, stock quantities, order fulfillment, financial ledgers, and team members require active administrator credentials with valid role permissions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="gold"
            size="md"
            className="flex-1 justify-center"
            onClick={() => navigate('/')}
            leftIcon={<Store className="w-4 h-4" />}
          >
            Return to Storefront
          </Button>

          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center border-neutral-700 text-neutral-300 hover:text-white"
            onClick={handleSignOutAndAdminLogin}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch to Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
};
