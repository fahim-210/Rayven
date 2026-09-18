import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext.tsx';
import { useAuth } from '../lib/auth/AuthContext.tsx';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Dropdown } from '../components/ui/Dropdown.tsx';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  RotateCcw,
  Truck,
  Users,
  Wallet,
  Receipt,
  PiggyBank,
  Landmark,
  BarChart3,
  Bell,
  History,
  Trash2,
  Building2,
  HardDriveDownload,
  UserCheck,
  Store,
  Menu,
  X,
  ChevronDown,
  Database,
  Search,
  ExternalLink,
  Shield,
  LogOut,
} from 'lucide-react';
import { UserRole, CustomerNotification } from '../types/index.ts';
import { storeService } from '../services/storeService.ts';

interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export const AdminLayout: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, actions, children }) => {
  const { currentPath, navigate } = useRouter();
  const { user, role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>(() =>
    storeService.getCustomerNotifications()
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    storeService.markAllNotificationsRead();
    setNotifications([...storeService.getCustomerNotifications()]);
  };

  // Exact Sidebar items in requested order:
  // Dashboard, Products, Inventory, Purchases, Suppliers, Orders, Returns, Expenses,
  // Investment & Withdrawal, Cashbook, Loans, Reports, Notifications, Activity Logs,
  // Recycle Bin, Business, Backup, My Profile, Users
  const sidebarNavItems: AdminNavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products', path: '/admin/products', icon: <Shirt className="w-4 h-4" /> },
    { label: 'Inventory', path: '/admin/inventory', icon: <Boxes className="w-4 h-4" />, badge: 'Low Stock' },
    { label: 'Purchases', path: '/admin/purchases', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Suppliers', path: '/admin/suppliers', icon: <Truck className="w-4 h-4" /> },
    { label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Returns', path: '/admin/returns', icon: <RotateCcw className="w-4 h-4" />, badge: '1 RMA' },
    { label: 'Expenses', path: '/admin/expenses', icon: <Receipt className="w-4 h-4" /> },
    { label: 'Investment & Withdrawal', path: '/admin/investments', icon: <PiggyBank className="w-4 h-4" /> },
    { label: 'Cashbook', path: '/admin/cashbook', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Loans', path: '/admin/loans', icon: <Landmark className="w-4 h-4" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: <History className="w-4 h-4" /> },
    { label: 'Recycle Bin', path: '/admin/recycle-bin', icon: <Trash2 className="w-4 h-4" /> },
    { label: 'Business', path: '/admin/business', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Backup', path: '/admin/backup', icon: <HardDriveDownload className="w-4 h-4" /> },
    { label: 'My Profile', path: '/admin/profile', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#0c0e12] text-neutral-200 font-sans">
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#12151c] border-r border-neutral-800/80 shrink-0 h-screen sticky top-0 z-30">
        {/* Top Logo and ERP identifier */}
        <div className="h-16 px-5 border-b border-neutral-800/80 flex items-center justify-between">
          <BrandLogo size="sm" onClick={() => navigate('/admin')} />
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
            ERP v1.0
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Navigation Menu
          </div>
          {sidebarNavItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-black text-amber-400'
                        : 'bg-neutral-800 text-amber-400 border border-amber-400/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Storefront & Sign Out shortcuts */}
        <div className="p-3 border-t border-neutral-800/80 bg-[#0f1218] space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700/60"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer Storefront</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-72 bg-[#12151c] border-r border-neutral-800 flex flex-col h-full">
            <div className="h-16 px-5 border-b border-neutral-800 flex items-center justify-between">
              <BrandLogo size="sm" onClick={() => { setSidebarOpen(false); navigate('/admin'); }} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Navigation Menu
              </div>
              {sidebarNavItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive
                        ? 'bg-amber-400 text-black font-bold'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-neutral-800 text-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-white"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Exit to Storefront</span>
              </button>
              <button
                onClick={async () => {
                  setSidebarOpen(false);
                  await logout();
                  navigate('/admin/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main ERP Command Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Command Bar */}
        <header className="h-16 bg-[#12151c]/95 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Architecture pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>PostgreSQL Schema Ready</span>
            </div>
            {/* Quick jump to Storefront */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Store</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </button>
          </div>

          {/* Right ERP tools & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Interactive Notification area with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
                aria-label="Admin Notifications"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-4 h-4 text-[9px] font-bold rounded-full bg-amber-400 text-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161a22] border border-neutral-700/80 rounded-xl shadow-2xl p-3 z-50 text-left">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Admin Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-mono">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-amber-400 hover:underline font-mono"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 py-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-4">No notifications</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-lg border text-xs transition-colors ${
                              n.isRead
                                ? 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400'
                                : 'bg-neutral-800/60 border-amber-400/30 text-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white text-[11px]">{n.title}</span>
                              <span className="text-[9px] text-neutral-500 font-mono">{n.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/notifications');
                        }}
                        className="w-full text-center text-xs font-semibold text-amber-400 hover:text-amber-300 py-1"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Interactive Role Switcher Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 hover:border-amber-400/80 transition-colors cursor-pointer text-left">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {user?.fullName.charAt(0) || 'A'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {user?.fullName || 'Administrator'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono leading-none">
                      {role || 'SUPER_ADMIN'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              }
              items={[
                {
                  label: <span className="text-[11px] font-bold text-neutral-400 uppercase">My Account</span>,
                  disabled: true,
                },
                {
                  label: 'Admin Profile & Security',
                  icon: <UserCheck className="w-3.5 h-3.5 text-amber-400" />,
                  onClick: () => navigate('/admin/profile'),
                },
                {
                  label: 'Team & Role Access',
                  icon: <Users className="w-3.5 h-3.5 text-amber-400" />,
                  onClick: () => navigate('/admin/users'),
                },
                { separator: true, label: '' },
                {
                  label: 'Storefront Customer View',
                  icon: <Store className="w-3.5 h-3.5 text-neutral-300" />,
                  onClick: () => navigate('/'),
                },
                {
                  label: 'Sign Out (End Session)',
                  icon: <LogOut className="w-3.5 h-3.5 text-red-400" />,
                  onClick: async () => {
                    await logout();
                    navigate('/admin/login');
                  },
                },
              ]}
            />
          </div>
        </header>

        {/* Subheader: Page title & Actions bar */}
        <div className="bg-[#0f1218] border-b border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto text-left">
          {children}
        </main>
      </div>
    </div>
  );
};
