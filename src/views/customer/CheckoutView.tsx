import React, { useState, useMemo } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import {
  BANGLADESH_DIVISION_NAMES,
  BANGLADESH_GEO_HIERARCHY,
  getDeliveryChargeForDivision,
} from '../../data/bangladeshGeoData.ts';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  Check,
  Tag,
  CreditCard,
  ShoppingBag,
  Info,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { navigate } = useRouter();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  // Customer information
  const [fullName, setFullName] = useState(user?.fullName || 'Tanvir Hossain');
  const [phoneNumber, setPhoneNumber] = useState('01711223344');
  const [email, setEmail] = useState(user?.email || '');

  // Delivery information
  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [selectedAreaThana, setSelectedAreaThana] = useState<string>('Dhanmondi');
  const [fullAddress, setFullAddress] = useState('House 42, Road 7A, Dhanmondi');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment Option selection: OPTION 1 (Advance delivery charge only) vs OPTION 2 (Pay full amount)
  const [paymentOption, setPaymentOption] = useState<'ADVANCE_ONLY' | 'FULL_PAYMENT'>('ADVANCE_ONLY');

  // Coupon / Discount
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Errors & loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Districts based on selected division
  const availableDistricts = useMemo(() => {
    return BANGLADESH_GEO_HIERARCHY[selectedDivision]?.districts || [];
  }, [selectedDivision]);

  // Thanas based on selected district
  const availableThanas = useMemo(() => {
    const districtObj = availableDistricts.find((d) => d.name === selectedDistrict);
    return districtObj?.thanas || [];
  }, [availableDistricts, selectedDistrict]);

  // When division changes, update district & thana
  const handleDivisionChange = (div: string) => {
    setSelectedDivision(div);
    const firstDistrict = BANGLADESH_GEO_HIERARCHY[div]?.districts[0]?.name || '';
    setSelectedDistrict(firstDistrict);
    const firstThana = BANGLADESH_GEO_HIERARCHY[div]?.districts[0]?.thanas[0] || '';
    setSelectedAreaThana(firstThana);
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    const districtObj = availableDistricts.find((d) => d.name === dist);
    const firstThana = districtObj?.thanas[0] || '';
    setSelectedAreaThana(firstThana);
  };

  // Perform Server-Side Calculation Preview
  const calculation = useMemo(() => {
    return storeService.validateAndCalculateOrder({
      items: items.map((i) => ({
        productId: i.product.id,
        variantId: i.variant.id,
        quantity: i.quantity,
        customization: i.customization,
      })),
      delivery: {
        division: selectedDivision,
        district: selectedDistrict,
        areaThana: selectedAreaThana,
        fullAddress,
        customerName: fullName,
        customerPhone: phoneNumber,
        customerEmail: email,
        deliveryInstructions,
      },
      paymentOption,
      couponCode: appliedCoupon || undefined,
    });
  }, [
    items,
    selectedDivision,
    selectedDistrict,
    selectedAreaThana,
    fullAddress,
    fullName,
    phoneNumber,
    email,
    deliveryInstructions,
    paymentOption,
    appliedCoupon,
  ]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'RAYVEN10' || code === 'WELCOME100') {
      setAppliedCoupon(code);
      setCouponCode('');
    } else {
      setCouponError('Invalid voucher code. Valid codes: RAYVEN10, WELCOME100');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate customer form fields
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required.';
    } else if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      errors.phoneNumber = 'Please enter a valid Bangladesh mobile number (e.g. 01711223344).';
    }
    if (!selectedDivision) errors.division = 'Division is required.';
    if (!selectedDistrict) errors.district = 'District is required.';
    if (!selectedAreaThana) errors.areaThana = 'Area/Thana is required.';
    if (!fullAddress.trim()) errors.fullAddress = 'Full delivery address is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    // Call server-side order creation
    const orderResult = storeService.createOrder(
      {
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant.id,
          quantity: i.quantity,
          customization: i.customization,
        })),
        delivery: {
          division: selectedDivision,
          district: selectedDistrict,
          areaThana: selectedAreaThana,
          fullAddress: fullAddress.trim(),
          customerName: fullName.trim(),
          customerPhone: phoneNumber.trim(),
          customerEmail: email.trim() || undefined,
          deliveryInstructions: deliveryInstructions.trim() || undefined,
        },
        paymentOption,
        couponCode: appliedCoupon || undefined,
      },
      user?.id
    );

    if (!orderResult.success || !orderResult.order) {
      setIsSubmitting(false);
      setServerError(
        orderResult.errors?.join(', ') || 'Failed to place order due to stock or validation issues.'
      );
      return;
    }

    // Clear cart once order is registered
    clearCart();

    // Redirect to Manual Payment Verification page
    navigate(`/payment/${orderResult.order.id}`);
  };

  if (items.length === 0) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Your Bag is Empty</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Please add at least one match kit or training garment to proceed to checkout.
          </p>
          <Button variant="gold" onClick={() => navigate('/shop')}>
            Explore Official Kits
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        {/* Checkout Header */}
        <div className="mb-8 pb-4 border-b border-neutral-800">
          <h1 className="text-3xl font-extrabold font-heading text-white uppercase tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Complete customer and delivery details. Choose advance payment preference.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer Information */}
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                <span>01</span>
                <span className="text-white font-heading">Customer Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Tanvir Hossain"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={formErrors.fullName}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Phone Number <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g. 01711223344"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={formErrors.phoneNumber}
                  />
                  <p className="text-[10px] text-neutral-500">
                    Will be used for payment verification and delivery courier calls.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Email Address <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. tanvir@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-neutral-500">
                    Receive digital invoice, verification status updates, and courier tracking receipts.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Information */}
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                <span>02</span>
                <span className="text-white font-heading">Delivery Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Division */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Division <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {BANGLADESH_DIVISION_NAMES.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    District <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area / Thana */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Area / Thana <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={selectedAreaThana}
                    onChange={(e) => setSelectedAreaThana(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {availableThanas.map((thana) => (
                      <option key={thana} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Address */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Full Address <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="House / Apartment number, Road number, Sector, Area landmarks..."
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  {formErrors.fullAddress && (
                    <p className="text-[11px] text-red-400">{formErrors.fullAddress}</p>
                  )}
                </div>

                {/* Additional Instructions */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Additional Delivery Instructions <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Call before delivery, gate opens at 10 AM, leave with guard..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Advance Payment Rule & Preference */}
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-amber-400/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                    <span>03</span>
                    <span className="text-white font-heading">Advance Payment Preference</span>
                  </h2>
                  <p className="text-xs text-neutral-300 mt-1">
                    RAYVEN requires a minimum advance equal to the delivery charge (
                    <strong className="text-amber-400">{formatCurrency(calculation.deliveryCharge)}</strong>
                    ). Choose how much you want to pay now:
                  </p>
                </div>
                <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* Advance Options Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* OPTION 1 */}
                <div
                  onClick={() => setPaymentOption('ADVANCE_ONLY')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    paymentOption === 'ADVANCE_ONLY'
                      ? 'bg-amber-400/10 border-amber-400 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase font-heading">
                      OPTION 1: Advance Delivery Charge Only
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentOption === 'ADVANCE_ONLY'
                          ? 'border-amber-400 bg-amber-400 text-black'
                          : 'border-neutral-600'
                      }`}
                    >
                      {paymentOption === 'ADVANCE_ONLY' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mb-2">
                    Pay only the delivery charge now to confirm order dispatch. Pay product price upon arrival.
                  </p>
                  <div className="pt-2 border-t border-neutral-800/80 flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Pay Now:</span>
                    <span className="text-amber-400 font-bold">
                      {formatCurrency(calculation.deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400 mt-0.5">
                    <span>Due on Delivery:</span>
                    <span>{formatCurrency(calculation.totalOrderAmount - calculation.deliveryCharge)}</span>
                  </div>
                </div>

                {/* OPTION 2 */}
                <div
                  onClick={() => setPaymentOption('FULL_PAYMENT')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    paymentOption === 'FULL_PAYMENT'
                      ? 'bg-amber-400/10 border-amber-400 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase font-heading">
                      OPTION 2: Pay Full Order Amount
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentOption === 'FULL_PAYMENT'
                          ? 'border-amber-400 bg-amber-400 text-black'
                          : 'border-neutral-600'
                      }`}
                    >
                      {paymentOption === 'FULL_PAYMENT' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mb-2">
                    Pay complete total now via bKash, Nagad, or Rocket. Zero cash handling needed at doorstep.
                  </p>
                  <div className="pt-2 border-t border-neutral-800/80 flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Pay Now:</span>
                    <span className="text-amber-400 font-bold">
                      {formatCurrency(calculation.totalOrderAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400 mt-0.5">
                    <span>Due on Delivery:</span>
                    <span className="text-emerald-400 font-bold">৳0 (Paid in Full)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Action (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-2xl sticky top-24">
              <h3 className="text-base font-bold font-heading text-white uppercase tracking-wider flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-mono text-amber-400">
                  {items.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </h3>

              {/* Items List Preview */}
              <div className="max-h-56 overflow-y-auto divide-y divide-neutral-800/80 pr-1 space-y-2">
                {items.map((item) => {
                  const base = item.variant.priceOverride ?? item.product.basePrice;
                  let customCost = 0;
                  if (item.customization?.playerPrint || item.customization?.playerName) customCost += 150;
                  if (item.customization?.badgePatch && item.customization?.badgePatch !== 'none') customCost += 100;
                  const unit = base + customCost;

                  return (
                    <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]?.url}
                          alt={item.product.title}
                          className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.product.title}</p>
                          <p className="text-[11px] font-mono text-neutral-400">
                            Size: {item.variant.size} × {item.quantity}
                          </p>
                          {item.customization?.playerPrint && (
                            <span className="text-[9px] font-mono text-amber-400 block">
                              Print: {item.customization.playerPrint}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        {formatCurrency(unit * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Voucher Code Form */}
              <div className="pt-2 border-t border-neutral-800">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {appliedCoupon}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-neutral-400 hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code (RAYVEN10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        className="shrink-0 h-9"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-neutral-800 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Product Total</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(calculation.productTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    Delivery Charge ({selectedDivision === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(calculation.deliveryCharge)}
                  </span>
                </div>

                {calculation.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono font-bold">-{formatCurrency(calculation.discount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Order Amount</span>
                  <span className="font-mono text-amber-400">
                    {formatCurrency(calculation.totalOrderAmount)}
                  </span>
                </div>
              </div>

              {/* Highlighted Advance Payment Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Minimum Advance Required:</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(calculation.minimumAdvance)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-1 border-t border-neutral-800/80">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Amount to Pay Now:
                  </span>
                  <span className="font-mono text-xl font-extrabold text-amber-400">
                    {formatCurrency(calculation.payNow)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-neutral-400 pt-1">
                  <span>Remaining Due (Cash on Delivery):</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(calculation.remainingDue)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-bold uppercase tracking-wider py-3.5 text-black"
                disabled={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isSubmitting ? 'Validating Order...' : 'Place Order & Proceed to Payment'}
              </Button>

              <div className="space-y-1.5 text-[11px] text-neutral-400">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Manual Payment: bKash, Nagad, or Rocket verification.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Order status starts at PENDING_PAYMENT until verified by admin.</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
};
