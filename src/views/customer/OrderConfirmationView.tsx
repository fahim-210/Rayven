import React from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { CheckCircle2, Package, Truck, ArrowRight, Download, ShieldCheck } from 'lucide-react';

export const OrderConfirmationView: React.FC<{ orderId?: string }> = ({ orderId }) => {
  const { navigate, routeParams } = useRouter();
  const idToFind = orderId || routeParams.orderId;
  const order = storeService.getOrderById(idToFind || '') || storeService.getOrders()[0];

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        {/* Success Header Card */}
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
            Payment Authorized • Order Confirmed
          </span>

          <h1 className="text-3xl font-bold font-heading text-white uppercase mt-2">
            Thank You For Your Order
          </h1>

          <p className="text-sm text-neutral-300 mt-2 max-w-md">
            Order <span className="text-white font-mono font-bold">{order.orderNumber}</span> has been
            received and forwarded to our central distribution facility.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="gold" size="sm" onClick={() => navigate('/orders')}>
              Track in Account Portal
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
              Continue Browsing
            </Button>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Dispatch & Delivery Info */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Shipping & Logistics</span>
            </h3>

            <div className="text-xs space-y-2 text-neutral-300">
              <p>
                <strong className="text-white">Courier:</strong> {order.carrierName || 'DHL Express Worldwide'}
              </p>
              {order.trackingNumber && (
                <p>
                  <strong className="text-white">Tracking Number:</strong>{' '}
                  <span className="font-mono text-amber-400">{order.trackingNumber}</span>
                </p>
              )}
              <p>
                <strong className="text-white">Recipient:</strong> {order.customerName}
              </p>
              <p>
                <strong className="text-white">Destination:</strong>{' '}
                {order.shippingAddress ? (
                  `${order.shippingAddress.street1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`
                ) : (
                  'Standard Delivery Address'
                )}
              </p>
            </div>
          </div>

          {/* Payment & Financial Ledger */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Payment Details</span>
            </h3>

            <div className="text-xs space-y-2 text-neutral-300">
              <p>
                <strong className="text-white">Status:</strong>{' '}
                <span className="text-emerald-400 font-semibold">{order.paymentStatus}</span>
              </p>
              <p>
                <strong className="text-white">Method:</strong> {order.paymentMethod}
              </p>
              <p>
                <strong className="text-white">Date:</strong> {formatDate(order.createdAt)}
              </p>
              <p>
                <strong className="text-white">Total Charged:</strong>{' '}
                <span className="text-white font-mono font-bold text-sm">
                  {formatCurrency(order.totalAmount)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="mt-8 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Items in This Dispatch ({order.items.length})</span>
          </h3>

          <div className="divide-y divide-neutral-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.productTitle}</h4>
                  <p className="text-neutral-400 font-mono mt-0.5">
                    Size: {item.variantSize} • SKU: {item.variantSku} • Qty: {item.quantity}
                  </p>
                  {item.playerPrint && (
                    <span className="inline-block mt-1 text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                      Official Player Print: {item.playerPrint}
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-white text-sm">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
