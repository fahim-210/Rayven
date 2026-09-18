import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { BANGLADESH_DIVISION_NAMES } from '../../data/bangladeshGeoData.ts';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  Tag,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { navigate } = useRouter();
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();

  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Delivery charge calculation
  const deliveryCharge = items.length === 0 ? 0 : selectedDivision === 'Dhaka' ? 70 : 120;

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon === 'RAYVEN10') {
    discountAmount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'WELCOME100') {
    discountAmount = Math.min(100, subtotal);
  }

  const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'RAYVEN10' || code === 'WELCOME100') {
      setAppliedCoupon(code);
      setCouponCode('');
    } else {
      setCouponError('Invalid voucher code. Try RAYVEN10 or WELCOME100.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-white uppercase tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Review your official kits, selected sizes, and player customizations.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {items.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto mb-4 text-neutral-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-heading">Your Cart is Empty</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Explore authentic 24/25 match kits, retro reissues, and personalized club apparel.
            </p>
            <Button variant="gold" onClick={() => navigate('/shop')}>
              Explore Catalog
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-2 text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <span className="col-span-6">Product Details</span>
                <span className="col-span-2 text-right">Unit Price</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {items.map((item) => {
                const unitBase = item.variant.priceOverride ?? item.product.basePrice;
                let customCost = 0;
                if (item.customization?.playerPrint || item.customization?.playerName) customCost += 150;
                if (item.customization?.badgePatch && item.customization?.badgePatch !== 'none') customCost += 100;
                const lineUnitPrice = unitBase + customCost;
                const lineTotal = lineUnitPrice * item.quantity;
                const isMaxStock = item.quantity >= item.variant.stockQuantity;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-colors"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Product details & Image (6 cols on sm) */}
                      <div className="sm:col-span-6 flex items-center gap-4">
                        <img
                          src={item.product.images[0]?.url}
                          alt={item.product.title}
                          className="w-20 h-24 object-cover rounded-lg bg-neutral-950 shrink-0 border border-neutral-800"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                              {item.product.clubName}
                            </span>
                            <Badge variant="neutral" size="sm">
                              Size: {item.variant.size}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-bold text-white font-heading leading-tight">
                            {item.product.title}
                          </h4>
                          <p className="text-[11px] font-mono text-neutral-400">
                            SKU: {item.variant.sku} • In Stock: {item.variant.stockQuantity}
                          </p>

                          {/* Customization Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.customization?.playerPrint && (
                              <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                Print: {item.customization.playerPrint}
                              </span>
                            )}
                            {item.customization?.playerName && !item.customization.playerPrint && (
                              <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                {item.customization.playerName} #{item.customization.playerNumber}
                              </span>
                            )}
                            {item.customization?.badgePatch && item.customization.badgePatch !== 'none' && (
                              <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                Patch: {item.customization.badgePatch}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price (2 cols on sm) */}
                      <div className="sm:col-span-2 text-left sm:text-right">
                        <span className="sm:hidden text-xs text-neutral-400 mr-2">Unit:</span>
                        <span className="text-sm font-bold font-mono text-neutral-200">
                          {formatCurrency(lineUnitPrice)}
                        </span>
                      </div>

                      {/* Quantity Controls (2 cols on sm) */}
                      <div className="sm:col-span-2 flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-950 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isMaxStock}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isMaxStock && (
                          <span className="text-[9px] font-mono text-amber-400/90 font-semibold">
                            Max Stock
                          </span>
                        )}
                      </div>

                      {/* Line Total & Remove (2 cols on sm) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-right">
                          <span className="sm:hidden text-xs text-neutral-400 mr-2">Total:</span>
                          <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
                            {formatCurrency(lineTotal)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/shop')}>
                  ← Continue Shopping
                </Button>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-400 hover:text-red-300">
                  Clear Entire Cart
                </Button>
              </div>
            </div>

            {/* Order Summary & Calculations (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-mono text-neutral-400">Bangladesh Delivery</span>
                </h3>

                {/* Delivery Division Selector for accurate delivery charge preview */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs text-neutral-300 font-medium flex items-center justify-between">
                    <span>Delivery Location:</span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      {selectedDivision === 'Dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳120)'}
                    </span>
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {BANGLADESH_DIVISION_NAMES.map((div) => (
                      <option key={div} value={div}>
                        {div} Division
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voucher / Coupon Input */}
                <div className="pt-2 border-t border-neutral-800/80">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{appliedCoupon} APPLIED</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-white text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Coupon (e.g. RAYVEN10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="text-xs h-9"
                        />
                        <Button type="submit" variant="outline" size="sm" className="shrink-0 h-9">
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {couponError}
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      Delivery Charge
                    </span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(deliveryCharge)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Discount</span>
                      <span className="font-mono font-bold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-white block">Grand Total</span>
                      <span className="text-[10px] text-neutral-400">
                        Min. Advance on Checkout: {formatCurrency(deliveryCharge)}
                      </span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full font-bold uppercase tracking-wider py-3"
                  onClick={() => navigate('/checkout')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Checkout
                </Button>

                <div className="space-y-2 pt-2 text-[11px] text-neutral-400 border-t border-neutral-800/80">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Minimum advance payment is strictly the delivery charge.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Pay remaining amount via Cash on Delivery upon inspection.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
