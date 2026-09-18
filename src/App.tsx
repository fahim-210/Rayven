import React from 'react';
import { RouterProvider, useRouter } from './router/RouterContext.tsx';
import { AuthProvider } from './lib/auth/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

// Customer Storefront Views
import { HomeView } from './views/customer/HomeView.tsx';
import { ShopView } from './views/customer/ShopView.tsx';
import { ClubsView } from './views/customer/ClubsView.tsx';
import { ProductDetailView } from './views/customer/ProductDetailView.tsx';
import { CartView } from './views/customer/CartView.tsx';
import { CheckoutView } from './views/customer/CheckoutView.tsx';
import { ManualPaymentView } from './views/customer/ManualPaymentView.tsx';
import { OrderConfirmationView } from './views/customer/OrderConfirmationView.tsx';
import { AccountOverviewView } from './views/customer/AccountOverviewView.tsx';
import { OrdersView } from './views/customer/OrdersView.tsx';
import { WishlistView } from './views/customer/WishlistView.tsx';
import { AboutView, ContactView } from './views/customer/AboutContactViews.tsx';

// Admin ERP Views
import { AdminDashboardView } from './views/admin/AdminDashboardView.tsx';
import { AdminProductsView } from './views/admin/AdminProductsView.tsx';
import { AdminInventoryView } from './views/admin/AdminInventoryView.tsx';
import { AdminPurchasesView } from './views/admin/AdminPurchasesView.tsx';
import { AdminSuppliersView } from './views/admin/AdminSuppliersView.tsx';
import { AdminOrdersView } from './views/admin/AdminOrdersView.tsx';
import { AdminReturnsView } from './views/admin/AdminReturnsView.tsx';
import { AdminFinancialsView } from './views/admin/AdminFinancialsView.tsx';
import { AdminReportsView } from './views/admin/AdminReportsView.tsx';
import { AdminGovernanceView } from './views/admin/AdminGovernanceViews.tsx';

// Design System Showcase View
import { DesignSystemView } from './views/dev/DesignSystemView.tsx';

const AppRoutes: React.FC = () => {
  const { currentPath } = useRouter();

  // Dynamic route patterns
  if (currentPath.startsWith('/product/')) {
    return <ProductDetailView />;
  }
  if (currentPath.startsWith('/payment/')) {
    return <ManualPaymentView />;
  }
  if (currentPath.startsWith('/orders/')) {
    return <OrdersView />;
  }

  // Exact routes
  switch (currentPath) {
    // Public Customer
    case '/':
      return <HomeView />;
    case '/shop':
      return <ShopView />;
    case '/clubs':
      return <ClubsView />;
    case '/cart':
      return <CartView />;
    case '/checkout':
      return <CheckoutView />;
    case '/payment':
      return <ManualPaymentView />;
    case '/order-confirmation':
      return <OrderConfirmationView />;
    case '/orders':
      return <OrdersView />;
    case '/wishlist':
      return <WishlistView />;
    case '/account':
      return <AccountOverviewView />;
    case '/about':
      return <AboutView />;
    case '/contact':
      return <ContactView />;

    // Design System Kit
    case '/design-system':
      return <DesignSystemView />;

    // Admin ERP System
    case '/admin':
      return <AdminDashboardView />;
    case '/admin/products':
      return <AdminProductsView />;
    case '/admin/inventory':
      return <AdminInventoryView />;
    case '/admin/purchases':
      return <AdminPurchasesView />;
    case '/admin/suppliers':
      return <AdminSuppliersView />;
    case '/admin/orders':
      return <AdminOrdersView />;
    case '/admin/returns':
      return <AdminReturnsView />;
    case '/admin/cashbook':
      return <AdminFinancialsView type="cashbook" />;
    case '/admin/expenses':
      return <AdminFinancialsView type="expenses" />;
    case '/admin/investments':
      return <AdminFinancialsView type="investments" />;
    case '/admin/loans':
      return <AdminFinancialsView type="loans" />;
    case '/admin/reports':
      return <AdminReportsView />;
    case '/admin/notifications':
      return <AdminGovernanceView type="notifications" />;
    case '/admin/activity-logs':
      return <AdminGovernanceView type="activity-logs" />;
    case '/admin/recycle-bin':
      return <AdminGovernanceView type="recycle-bin" />;
    case '/admin/business':
      return <AdminGovernanceView type="business" />;
    case '/admin/backup':
      return <AdminGovernanceView type="backup" />;
    case '/admin/profile':
      return <AdminGovernanceView type="profile" />;
    case '/admin/users':
      return <AdminGovernanceView type="users" />;

    default:
      return <HomeView />;
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider>
              <AppRoutes />
            </RouterProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
