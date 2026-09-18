import React from 'react';
import { CustomerLayout } from './CustomerLayout.tsx';
import { useRouter } from '../router/RouterContext.tsx';
import { useAuth } from '../lib/auth/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { storeService } from '../services/storeService.ts';
import {
  User,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Package,
  CreditCard,
  Bell,
} from 'lucide-react';

export const CustomerAccountLayout: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  const { currentPath, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { wishlist } = useCart();

  const unreadNotifs = storeService
    .getCustomerNotifications(user?.id)
    .filter((n) => !n.isRead).length;

  const accountNavItems = [
    { label: 'Profile & Security', path: '/account', icon: <User className="w-4 h-4" /> },
    { label: 'My Orders', path: '/orders', icon: <Package className="w-4 h-4" /> },
    { label: 'Payment History', path: '/account?tab=payments', icon: <CreditCard className="w-4 h-4" /> },
    {
      label: 'Wishlist',
      path: '/wishlist',
      icon: <Heart className="w-4 h-4" />,
      badge: wishlist.length > 0 ? wishlist.length.toString() : undefined,
    },
    {
      label: 'Notifications',
      path: '/account?tab=notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotifs > 0 ? unreadNotifs.toString() : undefined,
    },
  ];

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-mono">
          <button onClick={() => navigate('/')} className="hover:text-white">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <button onClick={() => navigate('/account')} className="hover:text-white">
            Customer Portal
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-amber-400 font-semibold">{title}</span>
        </nav>

        {/* Header greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">Customer:</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-amber-400">
              {user?.fullName || 'Tanvir Hossain'}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Customer Side Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-1">
              {accountNavItems.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path.startsWith('/orders') && currentPath.startsWith('/orders')) ||
                  (item.path === '/account' && currentPath === '/account');

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-black shadow-sm font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-black text-amber-400' : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Account Content */}
          <section className="lg:col-span-3">{children}</section>
        </div>
      </div>
    </CustomerLayout>
  );
};
