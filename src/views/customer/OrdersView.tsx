import React, { useState } from 'react';
import { CustomerAccountLayout } from '../../layouts/CustomerAccountLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { OrderStatus, PaymentStatus } from '../../types/index.ts';
import {
  Package,
  Truck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

// Visual Order Timeline steps strictly matching user specs:
// Order Placed -> Payment Approved -> Order Confirmed -> Packed -> In Hub -> Out for Delivery -> Delivered
const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Order received into system' },
  { key: 'PAYMENT_APPROVED', label: 'Payment Approved', desc: 'Manual payment verified' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Dispatched to fulfillment' },
  { key: 'PACKED', label: 'Packed', desc: 'Quality checked & boxed' },
  { key: 'IN_HUB', label: 'In Hub', desc: 'Arrived at distribution hub' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With courier delivery agent' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Received by customer' },
];

function getTimelineCurrentIndex(orderStatus: OrderStatus, paymentStatus: PaymentStatus): number {
  if (orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED') return -1;
  if (orderStatus === 'DELIVERED') return 6;
  if (orderStatus === 'OUT_FOR_DELIVERY') return 5;
  if (orderStatus === 'IN_HUB') return 4;
  if (orderStatus === 'PACKED') return 3;
  if (orderStatus === 'CONFIRMED') return 2;
  if (paymentStatus === 'APPROVED') return 1;
  // If payment under review or pending, we are at step 0 (Order Placed)
  return 0;
}

export const OrdersView: React.FC<{ orderId?: string }> = ({ orderId }) => {
  const { navigate, routeParams, currentPath } = useRouter();
  const { user } = useAuth();

  // Extract ID from path /orders/RYV-xxx or /orders/ord_xxx
  const pathId = currentPath.startsWith('/orders/')
    ? currentPath.replace('/orders/', '').split('/')[0]
    : undefined;
  const activeId = orderId || routeParams.id || pathId;

  // Customer security: get customer orders
  const orders = storeService.getCustomerOrders({
    id: user?.id,
    email: user?.email,
    phone: user?.phone,
  });

  // If viewing a single order detail
  if (activeId) {
    const order = storeService.getOrderById(activeId) || orders.find((o) => o.id === activeId || o.orderNumber === activeId);

    if (!order) {
      return (
        <CustomerAccountLayout title="Order Details">
          <div className="p-12 text-center rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <Package className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Order Not Found</h3>
            <p className="text-xs text-neutral-400">
              We couldn't locate order #{activeId}. It may belong to another account or does not exist.
            </p>
            <Button variant="gold" size="sm" onClick={() => navigate('/orders')}>
              Back to My Orders
            </Button>
          </div>
        </CustomerAccountLayout>
      );
    }

    const currentStepIdx = getTimelineCurrentIndex(order.status, order.paymentStatus);
    const activeSub = order.activeSubmission || order.paymentSubmissions?.[0];
    const isRejected = order.paymentStatus === 'REJECTED';
    const isUnderReview = order.paymentStatus === 'UNDER_REVIEW';
    const isApproved = order.paymentStatus === 'APPROVED';

    return (
      <CustomerAccountLayout
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${formatDate(order.createdAt)} • Status: ${order.status}`}
      >
        <div className="space-y-8">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to All Orders
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Payment Verification:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/payment/${order.id}`)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Payment Desk
              </Button>
            </div>
          </div>

          {/* Payment Status Notification Banner (Under Review / Rejected / Approved) */}
          {isRejected && (
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white font-heading">
                    Payment Status: Rejected
                  </h4>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    <strong>Reason:</strong>{' '}
                    {activeSub?.rejectionReason || 'The transaction ID could not be matched against our statement or amount is incomplete.'}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono mt-1">
                    Submitted TrxID: {activeSub?.transactionId || 'None'} via {activeSub?.method || 'Manual'}
                  </p>
                </div>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => navigate(`/payment/${order.id}`)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="shrink-0 text-black"
              >
                Resubmit Payment
              </Button>
            </div>
          )}

          {isUnderReview && (
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-white font-heading">
                    Payment Under Verification Review
                  </h4>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Your payment of {formatCurrency(activeSub?.amountPaid || order.minimumAdvance || 0)} (TrxID:{' '}
                    <span className="font-mono font-bold text-white">{activeSub?.transactionId}</span>) is being audited by RAYVEN admin.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/payment/${order.id}`)}
                className="shrink-0"
              >
                View Payment Details
              </Button>
            </div>
          )}

          {/* VISUAL ORDER TIMELINE (Strict Specification) */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                  Order Tracking Timeline
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live fulfillment progression from verification to courier doorstep delivery.
                </p>
              </div>
              <Badge variant={order.status === 'DELIVERED' ? 'success' : 'gold'} size="sm">
                Current: {order.status}
              </Badge>
            </div>

            {/* Desktop / Tablet Horizontal Stepper */}
            <div className="hidden md:block overflow-x-auto pb-4">
              <div className="min-w-[700px] flex items-center justify-between relative">
                {/* Connecting background line */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-neutral-800 -z-0" />
                <div
                  className="absolute left-6 top-4 h-0.5 bg-amber-400 -z-0 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (currentStepIdx / (TIMELINE_STEPS.length - 1)) * 100))}%`,
                  }}
                />

                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isPendingStep = idx > currentStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 text-center w-24">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-amber-400 text-black shadow-md'
                            : isCurrent
                            ? 'bg-amber-400 text-black ring-4 ring-amber-400/20 animate-pulse'
                            : 'bg-neutral-900 border-2 border-neutral-700 text-neutral-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <span
                        className={`text-xs font-bold mt-2 font-heading ${
                          isCurrent ? 'text-amber-400' : isCompleted ? 'text-white' : 'text-neutral-500'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-4 pt-2">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-amber-400 text-black'
                          : isCurrent
                          ? 'bg-amber-400 text-black ring-4 ring-amber-400/20'
                          : 'bg-neutral-900 border border-neutral-700 text-neutral-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-amber-400' : isCompleted ? 'text-white' : 'text-neutral-500'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-mono">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Products Table (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  Products in this Order ({order.items.length})
                </h3>

                <div className="divide-y divide-neutral-800/80">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80'}
                          alt={item.productTitle}
                          className="w-16 h-20 object-cover rounded-lg bg-neutral-950 shrink-0 border border-neutral-800"
                        />
                        <div className="space-y-1 text-xs">
                          <h4 className="font-bold text-white text-sm font-heading">
                            {item.productTitle}
                          </h4>
                          <p className="text-neutral-400 font-mono text-[11px]">
                            Size: <span className="text-amber-400 font-bold">{item.variantSize}</span> • SKU: {item.variantSku} • Qty: {item.quantity}
                          </p>
                          <p className="text-neutral-400 font-mono text-[11px]">
                            Unit Price: {formatCurrency(item.unitPrice)}
                          </p>

                          {/* Customization Details */}
                          {(item.playerPrint || item.playerName || item.customBadge) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {item.playerPrint && (
                                <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                  Print: {item.playerPrint}
                                </span>
                              )}
                              {item.playerName && !item.playerPrint && (
                                <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                  {item.playerName} #{item.playerNumber}
                                </span>
                              )}
                              {item.customBadge && (
                                <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                                  Patch: {item.customBadge}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right sm:self-center">
                        <span className="text-xs text-neutral-400 sm:hidden mr-2">Line Total:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Instructions */}
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 text-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Delivery Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-300 pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Recipient</span>
                    <p className="font-bold text-white text-sm">{order.customerName}</p>
                    <p className="font-mono text-neutral-400 mt-0.5">{order.customerPhone}</p>
                    {order.customerEmail && <p className="text-neutral-400">{order.customerEmail}</p>}
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Destination Address</span>
                    <p className="text-white">{order.fullAddress || order.shippingAddress?.street1}</p>
                    <p className="text-neutral-400 font-mono mt-0.5">
                      {order.areaThana && `${order.areaThana}, `}
                      {order.district && `${order.district}, `}
                      {order.division && `${order.division} Division`}
                    </p>
                  </div>
                </div>

                {order.deliveryInstructions && (
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 mt-2 text-neutral-300">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Delivery Instructions</span>
                    <p className="italic">{order.deliveryInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Ledger & Payment Information (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Payment Details Card */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Payment Information</span>
                </h3>

                <div className="space-y-2.5 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Payment Status:</span>
                    <Badge
                      variant={
                        isApproved ? 'success' : isUnderReview ? 'gold' : isRejected ? 'danger' : 'neutral'
                      }
                      size="sm"
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-400">Payment Method:</span>
                    <span className="font-mono font-bold text-white">{order.paymentMethod || 'Manual'}</span>
                  </div>

                  {activeSub && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Transaction ID:</span>
                        <span className="font-mono font-bold text-amber-400">{activeSub.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Sender Phone:</span>
                        <span className="font-mono text-white">{activeSub.senderPhone}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/payment/${order.id}`)}
                  >
                    View Payment Verification Desk
                  </Button>
                </div>
              </div>

              {/* Order Financial Calculation Card */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  Financial Breakdown
                </h3>

                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Product Total:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(order.subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(order.shippingFee)}</span>
                  </div>

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                    <span>Total Order Amount:</span>
                    <span className="font-mono text-amber-400">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Amount Paid (Advance):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(order.amountPaid || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Remaining Due (COD):</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(order.remainingDue ?? order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Evaluation Sandbox Controls for Timeline Testing */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] space-y-2">
                <div className="flex items-center gap-1.5 text-neutral-400 font-mono uppercase font-bold">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timeline Simulation (For Testing)</span>
                </div>
                <p className="text-neutral-500 text-[10px]">
                  Simulate moving order through warehouse lifecycle:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    onClick={() => {
                      storeService.adminUpdateOrderStatus(order.id, 'PACKED');
                      navigate(`/orders/${order.orderNumber}`);
                    }}
                  >
                    Set Packed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    onClick={() => {
                      storeService.adminUpdateOrderStatus(order.id, 'IN_HUB');
                      navigate(`/orders/${order.orderNumber}`);
                    }}
                  >
                    Set In Hub
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    onClick={() => {
                      storeService.adminUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
                      navigate(`/orders/${order.orderNumber}`);
                    }}
                  >
                    Out for Delivery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 text-emerald-400"
                    onClick={() => {
                      storeService.adminUpdateOrderStatus(order.id, 'DELIVERED');
                      navigate(`/orders/${order.orderNumber}`);
                    }}
                  >
                    Set Delivered
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerAccountLayout>
    );
  }

  // Otherwise viewing the list of customer orders (/orders)
  return (
    <CustomerAccountLayout
      title="My Orders"
      subtitle="Track your official matchwear orders, advance payment reviews, and delivery timeline."
    >
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <Package className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-heading">No Orders Placed Yet</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              When you order club match kits or retro jerseys, your order ID, payment verification, and courier tracking timeline will appear here.
            </p>
            <Button variant="gold" size="sm" onClick={() => navigate('/shop')}>
              Discover Official Kits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isRejected = ord.paymentStatus === 'REJECTED';
              const isUnderReview = ord.paymentStatus === 'UNDER_REVIEW';
              const isApproved = ord.paymentStatus === 'APPROVED';

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 text-amber-400 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white font-mono text-sm">
                            {ord.orderNumber}
                          </h4>
                          <Badge
                            variant={
                              isApproved
                                ? 'success'
                                : isUnderReview
                                ? 'gold'
                                : isRejected
                                ? 'danger'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            Payment: {ord.paymentStatus}
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            Order: {ord.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          Date: {formatDate(ord.createdAt)} • {ord.items.length} Product(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRejected && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => navigate(`/payment/${ord.id}`)}
                          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          className="text-black text-xs"
                        >
                          Resubmit Payment
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${ord.orderNumber}`)}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Track Order
                      </Button>
                    </div>
                  </div>

                  {/* Order Financial & Payment Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Total Order</span>
                      <span className="text-white font-bold">{formatCurrency(ord.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Amount Paid</span>
                      <span className="text-emerald-400 font-bold">
                        {formatCurrency(ord.amountPaid || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Remaining Due</span>
                      <span className="text-amber-400 font-bold">
                        {formatCurrency(ord.remainingDue ?? ord.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Payment Method</span>
                      <span className="text-neutral-300">{ord.paymentMethod || 'Manual'}</span>
                    </div>
                  </div>

                  {/* Rejection Alert snippet if rejected */}
                  {isRejected && ord.activeSubmission?.rejectionReason && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>
                        <strong>Rejection Reason:</strong> {ord.activeSubmission.rejectionReason}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerAccountLayout>
  );
};
