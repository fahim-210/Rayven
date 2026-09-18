import React, { useState } from 'react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { useRouter } from '../router/RouterContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../lib/auth/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { PolicyModal, PolicyType } from '../components/customer/PolicyModal.tsx';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Truck,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Palette,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ChevronRight,
  Ruler,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils.ts';

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPath, navigate } = useRouter();
  const { cartCount, items, removeFromCart, updateQuantity, subtotal, isCartOpen, setIsCartOpen, wishlist } = useCart();
  const { user, logout, needsInitialSetup, isAdminAreaAllowed } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Clubs', path: '/clubs' },
    { label: 'New Arrivals', path: '/shop?filter=new-arrivals' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/shop?filter=new-arrivals' && currentPath === '/') {
      const el = document.getElementById('new-arrivals');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#f3f4f6]">
      {/* 1. Global Announcement Ticker */}
      <div className="bg-neutral-900 border-b border-neutral-800/80 px-4 py-1.5 text-xs text-neutral-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              2024/25 Match Kits Released
            </span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="hidden sm:inline text-neutral-400">
              Complimentary Worldwide Tracked Shipping on Orders $120+
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Context-aware Admin portal link */}
            {needsInitialSetup ? (
              <button
                onClick={() => navigate('/admin/setup')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 font-medium transition-colors text-[11px]"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>First Admin Setup</span>
              </button>
            ) : isAdminAreaAllowed ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-amber-400 hover:bg-neutral-700 font-medium transition-colors text-[11px]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin ERP</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors text-[11px]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
            <button
              onClick={() => navigate('/design-system')}
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-neutral-400 hover:text-white transition-colors text-[11px]"
            >
              <Palette className="w-3 h-3" />
              <span>UI Kit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Customer Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0b0c10]/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-neutral-300 hover:text-white"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <BrandLogo size="md" showSubtitle onClick={() => navigate('/')} />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path.split('?')[0]);
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-amber-400 border-b-2 border-amber-400 pb-1'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
              aria-label="Search"
              title="Search kits"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black font-mono text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account / Profile trigger */}
            <button
              type="button"
              onClick={() => navigate(user ? '/account' : '/login')}
              className="flex items-center gap-2 p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
              aria-label="Customer Account"
              title={user ? `Account: ${user.fullName}` : 'Sign In'}
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-xs font-medium text-neutral-300">
                {user ? user.fullName.split(' ')[0] : 'Account'}
              </span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 hover:border-amber-400/80 text-white transition-all shadow-sm group"
              aria-label="Shopping Cart"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold font-mono">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Proper Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/85 backdrop-blur-md transition-opacity">
          <div className="w-4/5 max-w-sm bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-6">
                <BrandLogo size="sm" onClick={() => { setMobileMenuOpen(false); navigate('/'); }} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search input */}
              <div className="mb-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (mobileSearchQuery.trim()) {
                      setMobileMenuOpen(false);
                      navigate('/shop');
                    }
                  }}
                  className="relative flex items-center"
                >
                  <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search jerseys, clubs..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </form>
              </div>

              {/* Mobile Main Navigation */}
              <div className="flex flex-col gap-1 text-left">
                {navLinks.map((link) => {
                  const isActive =
                    link.path === '/'
                      ? currentPath === '/'
                      : currentPath.startsWith(link.path.split('?')[0]);
                  return (
                    <button
                      key={link.label}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick(link.path);
                      }}
                      className={`flex items-center justify-between text-sm font-bold uppercase tracking-wider py-3 px-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'text-neutral-200 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </div>

              {/* Account, Wishlist & Cart Shortcuts in Drawer */}
              <div className="mt-6 pt-6 border-t border-neutral-800/80 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(user ? '/account' : '/login');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>{user ? `Account (${user.fullName.split(' ')[0]})` : 'Sign In / Register'}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {user ? 'Active' : 'Guest'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/wishlist');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-amber-400" />
                    <span>Saved Wishlist</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px] font-mono text-amber-400">
                    {wishlist.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Shopping Bag</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px] font-mono text-white">
                    {cartCount} items
                  </span>
                </button>
              </div>

              {/* Support & Policy Modal triggers in Mobile Drawer */}
              <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap gap-2 text-[11px] text-neutral-400">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPolicyModal('size-guide');
                  }}
                  className="hover:text-amber-400"
                >
                  Size Guide
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPolicyModal('shipping');
                  }}
                  className="hover:text-amber-400"
                >
                  Shipping
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPolicyModal('returns');
                  }}
                  className="hover:text-amber-400"
                >
                  Returns
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPolicyModal('faq');
                  }}
                  className="hover:text-amber-400"
                >
                  FAQ
                </button>
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="pt-6 border-t border-neutral-800">
              <p className="text-[11px] text-neutral-500 mb-3">RAYVEN Football & Athletic Apparel</p>
              <div className="flex items-center gap-4 text-neutral-400">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                Search RAYVEN Catalog
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-neutral-400 hover:text-white"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search jerseys, clubs, collections (e.g. Valkyrie, Home Kit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchOpen(false);
                    navigate('/shop');
                  }
                }}
                className="w-full bg-neutral-950 text-white pl-12 pr-4 py-3 text-base rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
              <span>Popular:</span>
              {['Valkyrie FC', '24/25 Home', 'Retro 1998', 'Atlético'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/shop');
                  }}
                  className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col justify-between shadow-2xl text-left">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-lg text-white">Your Cart ({cartCount})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-white"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-600 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">Your bag is empty</p>
                  <p className="text-xs text-neutral-500 mb-6">Discover the new 2024/25 season kits.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                  >
                    Browse Jerseys
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80"
                  >
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.title}
                      className="w-20 h-24 object-cover rounded-lg bg-neutral-900 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-0.5"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                          Size: {item.variant.size} • SKU: {item.variant.sku}
                        </p>
                        {item.customization?.playerPrint && (
                          <span className="inline-block mt-1 text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Print: {item.customization.playerPrint}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60">
                        <div className="flex items-center border border-neutral-700 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-white font-mono">
                          {formatCurrency(
                            (item.variant.priceOverride ?? item.product.basePrice) * item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 font-medium">Estimated Subtotal</span>
                  <span className="text-lg font-bold font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Taxes and final courier shipping calculated during checkout.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/cart');
                    }}
                  >
                    View Full Bag Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Main Content Injection */}
      <main className="flex-1">{children}</main>

      {/* 7. Public Storefront Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800/80 pt-16 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800/80">
            {/* 1. Brand Column: RAYVEN */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo size="lg" showSubtitle onClick={() => navigate('/')} />
              <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
                Forged on the pitch. Refined for the streets. RAYVEN delivers precision-engineered
                football kits and apparel honoring legendary clubs and football culture worldwide.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-xs pt-1">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  100% Authentic Matchwear
                </span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Truck className="w-4 h-4 text-amber-400" />
                  Express Global Delivery
                </span>
              </div>

              {/* Social Links */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Follow Football Culture
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Shop & Collections */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Shop
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button onClick={() => navigate('/shop')} className="hover:text-amber-400 transition-colors">
                    All Matchwear Kits
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/clubs')} className="hover:text-amber-400 transition-colors">
                    Partner Clubs Roster
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?filter=new-arrivals')} className="hover:text-amber-400 transition-colors">
                    New Arrivals Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?filter=best-sellers')} className="hover:text-amber-400 transition-colors">
                    Best Seller Kits
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?filter=retro')} className="hover:text-amber-400 transition-colors">
                    Retro Heritage Editions
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/wishlist')} className="hover:text-amber-400 transition-colors">
                    Saved Wishlist
                  </button>
                </li>
              </ul>
            </div>

            {/* 3. About & Client Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                About & Services
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button onClick={() => navigate('/about')} className="hover:text-amber-400 transition-colors">
                    About RAYVEN
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/about')} className="hover:text-amber-400 transition-colors">
                    Fabric Technology (Aeroknit™)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="hover:text-amber-400 transition-colors">
                    Contact Concierge
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModal('size-guide')} className="hover:text-amber-400 transition-colors">
                    Size Guide
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModal('faq')} className="hover:text-amber-400 transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/orders')} className="hover:text-amber-400 transition-colors">
                    Track Order & Shipping
                  </button>
                </li>
              </ul>
            </div>

            {/* 4. Customer Policies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Policies & Terms
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button onClick={() => setPolicyModal('shipping')} className="hover:text-amber-400 transition-colors">
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModal('returns')} className="hover:text-amber-400 transition-colors">
                    Return & Exchange
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModal('privacy')} className="hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModal('terms')} className="hover:text-amber-400 transition-colors">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/account')} className="hover:text-amber-400 transition-colors">
                    Customer Account
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>© 2026 RAYVEN Football & Athletic Apparel Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono text-neutral-500">
                Official Matchwear • Aeroknit™ 140g Spec
              </span>
              <span className="text-neutral-700">•</span>
              <button
                type="button"
                onClick={() => navigate(needsInitialSetup ? '/admin/setup' : '/admin/login')}
                className="text-[11px] text-neutral-500 hover:text-amber-400 transition-colors"
              >
                {needsInitialSetup ? 'First Admin Setup' : 'Admin ERP'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Interactive Policy & Help Modal */}
      <PolicyModal policy={policyModal} onClose={() => setPolicyModal(null)} />
    </div>
  );
};
