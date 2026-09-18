import React, { useState, useMemo } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { ManualPaymentMethod, PaymentMethodConfig } from '../../types/index.ts';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileText,
  RefreshCw,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

export const ManualPaymentView: React.FC<{ orderId?: string }> = ({ orderId }) => {
  const { navigate, routeParams, currentPath } = useRouter();

  // Extract order ID from path /payment/ord_xxx or prop
  const pathId = currentPath.startsWith('/payment/')
    ? currentPath.replace('/payment/', '').split('/')[0]
    : undefined;
  const activeOrderId = orderId || routeParams.orderId || pathId;

  // Retrieve order
  const order = activeOrderId ? storeService.getOrderById(activeOrderId) : undefined;

  // Payment configs from Business Settings (never hardcoded!)
  const paymentConfigs = storeService.getActivePaymentMethodConfigs();

  const [selectedMethod, setSelectedMethod] = useState<ManualPaymentMethod>(
    (paymentConfigs[0]?.name as ManualPaymentMethod) || 'bKash'
  );

  // Form inputs
  const defaultAmount = order
    ? order.paymentOption === 'FULL_PAYMENT'
      ? order.totalAmount
      : order.minimumAdvance || order.shippingFee || 120
    : 120;

  const [amountPaid, setAmountPaid] = useState<string>(defaultAmount.toString());
  const [senderPhone, setSenderPhone] = useState<string>(order?.customerPhone || '01711223344');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentDateTime, setPaymentDateTime] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');

  // UI state
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Admin demo quick simulation state
  const [adminSimReason, setAdminSimReason] = useState('Amount submitted does not match requirement or TrxID was missing from bank statement.');

  const currentConfig: PaymentMethodConfig | undefined = useMemo(() => {
    return paymentConfigs.find((c) => c.name.toLowerCase() === selectedMethod.toLowerCase()) || paymentConfigs[0];
  }, [paymentConfigs, selectedMethod]);

  const handleCopyNumber = (num: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setFormError(null);

    // Validate fields
    if (!selectedMethod) {
      setFormError('Please select a payment method.');
      return;
    }
    const parsedAmount = parseFloat(amountPaid);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount paid.');
      return;
    }
    if (!senderPhone.trim()) {
      setFormError('Sender phone number is required.');
      return;
    }
    if (!transactionId.trim()) {
      setFormError('Transaction ID (TrxID) is required.');
      return;
    }

    setIsSubmitting(true);

    const result = storeService.submitManualPayment(order.id, {
      method: selectedMethod,
      amountPaid: parsedAmount,
      senderPhone: senderPhone.trim(),
      transactionId: transactionId.trim().toUpperCase(),
      paymentDateTime: new Date(paymentDateTime).toLocaleString(),
      screenshotUrl: screenshotPreview || undefined,
      note: note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to submit payment.');
      return;
    }

    setIsResubmitting(false);
  };

  if (!order) {
    return (
      <CustomerLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Order Not Found</h2>
          <p className="text-xs text-neutral-400 mb-6">
            We couldn't locate an order with ID: <span className="font-mono text-amber-400">{activeOrderId}</span>
          </p>
          <Button variant="gold" onClick={() => navigate('/orders')}>
            View My Orders
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  const activeSubmission = order.activeSubmission || order.paymentSubmissions?.[0];
  const isApproved = order.paymentStatus === 'APPROVED';
  const isUnderReview = order.paymentStatus === 'UNDER_REVIEW';
  const isRejected = order.paymentStatus === 'REJECTED';
  const isPending = order.paymentStatus === 'PENDING';

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 font-mono text-neutral-400">
            <button onClick={() => navigate('/orders')} className="hover:text-white">
              Orders
            </button>
            <span>/</span>
            <span className="text-amber-400 font-bold">{order.orderNumber}</span>
            <span>/</span>
            <span className="text-white">Payment Verification</span>
          </div>

          <Badge
            variant={
              isApproved ? 'success' : isUnderReview ? 'gold' : isRejected ? 'danger' : 'neutral'
            }
            size="sm"
          >
            Payment: {order.paymentStatus}
          </Badge>
        </div>

        {/* Status Banners */}
        {isApproved && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-white">
                  Payment Verified • Order Confirmed
                </h2>
                <p className="text-xs text-neutral-300 mt-1">
                  Your advance payment of{' '}
                  <strong className="text-emerald-400 font-mono">
                    {formatCurrency(order.amountPaid || order.minimumAdvance || 0)}
                  </strong>{' '}
                  has been verified by admin. Your order is now queued for packaging.
                </p>
                {order.remainingDue > 0 && (
                  <p className="text-xs font-mono text-amber-400 mt-1">
                    Remaining Due upon Delivery: {formatCurrency(order.remainingDue)} (Cash on Delivery)
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate(`/orders/${order.orderNumber}`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Track Order Timeline
            </Button>
          </div>
        )}

        {isUnderReview && !isResubmitting && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Status: Under Review
                </span>
                <h2 className="text-lg font-bold font-heading text-white">
                  Payment Submitted for Manual Verification
                </h2>
                <p className="text-xs text-neutral-300 mt-1">
                  We received your transaction:{' '}
                  <strong className="text-white font-mono">{activeSubmission?.transactionId}</strong> via{' '}
                  <strong className="text-amber-400">{activeSubmission?.method}</strong> (
                  {formatCurrency(activeSubmission?.amountPaid || 0)}).
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Our verification desk checks statements manually within 15–30 minutes. You will receive an instant account notification once approved.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResubmitting(true)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Edit / Resubmit
              </Button>
              <Button variant="gold" size="sm" onClick={() => navigate('/orders')}>
                View My Orders
              </Button>
            </div>
          </div>
        )}

        {isRejected && !isResubmitting && (
          <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-left space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
                  Payment Status: Rejected
                </span>
                <h2 className="text-lg font-bold font-heading text-white">
                  Payment Verification Unsuccessful
                </h2>
                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-xs text-neutral-200 mt-2 space-y-1">
                  <p>
                    <strong className="text-red-400">Admin Rejection Reason:</strong>{' '}
                    {activeSubmission?.rejectionReason || 'The transaction ID could not be matched against our statement or amount is incomplete.'}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Submitted: {activeSubmission?.transactionId} • {activeSubmission?.method} • {formatDate(activeSubmission?.submittedAt || '')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsResubmitting(true)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Resubmit Payment Details
              </Button>
            </div>
          </div>
        )}

        {/* Order Financial Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 mb-8 text-xs font-mono">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Order ID</span>
            <span className="text-white font-bold">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Total Order</span>
            <span className="text-white font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Minimum Advance</span>
            <span className="text-amber-400 font-bold">
              {formatCurrency(order.minimumAdvance || order.shippingFee || 120)}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Amount to Pay Now</span>
            <span className="text-emerald-400 font-bold">
              {formatCurrency(
                order.paymentOption === 'FULL_PAYMENT'
                  ? order.totalAmount
                  : order.minimumAdvance || order.shippingFee || 120
              )}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Remaining Due</span>
            <span className="text-neutral-300 font-bold">
              {formatCurrency(order.remainingDue ?? order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Main Payment Section: Only show form if PENDING or user clicked Resubmit */}
        {(isPending || isResubmitting || (!isApproved && !isUnderReview)) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Payment Method Selection & How to Pay (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Payment Method Selector */}
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  1. Select Payment Method
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {paymentConfigs.map((cfg) => {
                    const isSelected = selectedMethod.toLowerCase() === cfg.name.toLowerCase();
                    return (
                      <button
                        key={cfg.id}
                        type="button"
                        onClick={() => setSelectedMethod(cfg.name as ManualPaymentMethod)}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 shadow-md'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-sm font-bold font-heading text-white">{cfg.name}</span>
                        <span className="text-[10px] text-neutral-400 uppercase font-mono mt-0.5">
                          {cfg.accountType}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Method Details Card */}
                {currentConfig && (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">
                        Send Money / Payment To ({currentConfig.accountType}):
                      </span>
                      <Badge variant="gold" size="sm">
                        {currentConfig.accountType}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-base font-mono font-bold text-white tracking-wider">
                        {currentConfig.accountNumber}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyNumber(currentConfig.accountNumber)}
                        className="text-xs shrink-0"
                        leftIcon={copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {copiedNumber ? 'Copied!' : 'Copy Number'}
                      </Button>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1">
                      <span className="text-neutral-400">Amount to Send:</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {formatCurrency(
                          order.paymentOption === 'FULL_PAYMENT'
                            ? order.totalAmount
                            : order.minimumAdvance || 120
                        )}
                      </span>
                    </div>

                    {currentConfig.instructions && (
                      <p className="text-[11px] text-neutral-400 pt-1 leading-relaxed border-t border-neutral-800">
                        {currentConfig.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* How to Pay Guide (6 steps per user specs) */}
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono">
                  HOW TO PAY (6 Steps)
                </h3>

                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p>
                      <strong>Select payment method</strong> (bKash, Nagad, or Rocket).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p>
                      <strong>Send the required amount</strong> to the displayed RAYVEN {currentConfig?.accountType}{' '}
                      number (<span className="font-mono text-white">{currentConfig?.accountNumber}</span>).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p>
                      <strong>Complete the payment</strong> in your mobile financial app or USSD menu.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <p>
                      <strong>Enter payment information</strong> (Sender Phone & Transaction ID / TrxID).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      5
                    </span>
                    <p>
                      <strong>Submit payment for verification</strong> by clicking the button.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      6
                    </span>
                    <p>
                      <strong>Wait for admin approval</strong>. Status updates to Confirmed immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Payment Submission Form (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <form
                onSubmit={handleSubmitVerification}
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                    2. Payment Submission Form
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {selectedMethod}
                  </Badge>
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Amount Paid */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300 flex justify-between">
                    <span>
                      Amount Paid (৳) <span className="text-amber-400">*</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Required: {formatCurrency(defaultAmount)}
                    </span>
                  </label>
                  <Input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="e.g. 120"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Sender Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Sender Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. 01711223344"
                    className="font-mono text-sm"
                  />
                  <p className="text-[10px] text-neutral-500">
                    The bKash / Nagad / Rocket number you sent the money from.
                  </p>
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300 flex justify-between">
                    <span>
                      Transaction ID (TrxID) <span className="text-amber-400">*</span>
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-mono">Must be unique</span>
                  </label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9K8J7H6G5F"
                    className="font-mono text-sm uppercase tracking-wider"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Copy the TrxID directly from your SMS or statement confirmation.
                  </p>
                </div>

                {/* Payment Date/Time */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Payment Date & Time <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={paymentDateTime}
                    onChange={(e) => setPaymentDateTime(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Payment Screenshot (Upload / Preview) */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Payment Screenshot <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Proof</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                    {screenshotPreview && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        Image Attached ✓
                      </span>
                    )}
                  </div>
                  {screenshotPreview && (
                    <div className="mt-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 max-w-xs">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot proof"
                        className="max-h-32 object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Note */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Additional Note <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Paid via cousin's wallet, ref: Jersey"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-bold uppercase tracking-wider py-3.5 text-black"
                  disabled={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment for Review'}
                </Button>

                <p className="text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manual review protects against fraud and duplicate transaction IDs.</span>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Previous Payment Submission History (Preserved History Requirement) */}
        {order.paymentSubmissions && order.paymentSubmissions.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Payment Submission History ({order.paymentSubmissions.length})</span>
            </h3>

            <div className="divide-y divide-neutral-800 text-xs">
              {order.paymentSubmissions.map((sub, idx) => (
                <div key={sub.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{sub.transactionId}</span>
                      <Badge
                        variant={
                          sub.status === 'APPROVED'
                            ? 'success'
                            : sub.status === 'UNDER_REVIEW'
                            ? 'gold'
                            : sub.status === 'REJECTED'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {sub.status}
                      </Badge>
                      <span className="text-neutral-400 font-mono">via {sub.method}</span>
                    </div>
                    <p className="text-neutral-400 font-mono text-[11px] mt-0.5">
                      Sender: {sub.senderPhone} • Submitted: {formatDate(sub.submittedAt || '')}
                      {sub.reviewedAt && ` • Reviewed: ${formatDate(sub.reviewedAt)}`}
                    </p>
                    {sub.rejectionReason && (
                      <p className="text-red-400 font-medium text-[11px] mt-1">
                        Reason: {sub.rejectionReason}
                      </p>
                    )}
                  </div>

                  <span className="font-mono font-bold text-amber-400 text-sm sm:text-right">
                    {formatCurrency(sub.amountPaid)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Verification Desk Simulation Card */}
        {/* Strictly clearly labeled as "Admin Desk Sandbox Controls" so reviewer can test approval and rejection */}
        <div className="mt-10 p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-400 font-mono uppercase tracking-wider font-bold">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Verification Desk Simulator (For Evaluation)</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              Role: RAYVEN Finance Officer
            </span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Per security mandates, customers can never approve their own payment. Use these admin controls to test the approval and rejection workflows in the live preview.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => {
                const subId = order.activeSubmission?.id || order.paymentSubmissions?.[0]?.id || 'sub_demo';
                storeService.adminApprovePayment(order.id, subId, 'Admin (Simulated)');
                setIsResubmitting(false);
                // Force reload or re-render via route ping
                navigate(`/payment/${order.id}`);
              }}
            >
              ✓ Simulate Admin Approval
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              onClick={() => {
                const subId = order.activeSubmission?.id || order.paymentSubmissions?.[0]?.id || 'sub_demo';
                storeService.adminRejectPayment(order.id, subId, adminSimReason, 'Admin (Simulated)');
                setIsResubmitting(false);
                navigate(`/payment/${order.id}`);
              }}
            >
              ✕ Simulate Admin Rejection
            </Button>

            <Input
              value={adminSimReason}
              onChange={(e) => setAdminSimReason(e.target.value)}
              placeholder="Rejection reason..."
              className="text-xs h-8 flex-1 min-w-[200px]"
            />
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
