import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { Badge } from '../../components/ui/Badge.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { ShoppingBag, Truck, Eye } from 'lucide-react';
import { Order } from '../../types/index.ts';

export const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders());
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Sales Orders & Fulfillment"
      subtitle="Process customer matchwear dispatches, assign courier tracking numbers, and view transaction receipts."
    >
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              isSearch
              placeholder="Search by order #, customer, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {filtered.length} Orders in Database
          </span>
        </div>

        <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Placement Date</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4">Courier & Tracking</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <span className="text-[10px] text-neutral-500">{order.customerEmail}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="gold" size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                      {order.trackingNumber || 'Pending Label'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        <Dialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder?.orderNumber}`}
          size="md"
        >
          {selectedOrder && (
            <div className="space-y-4 text-xs text-left">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between">
                <div>
                  <p className="text-white font-bold">{selectedOrder.customerName}</p>
                  <p className="text-neutral-400">{selectedOrder.customerEmail}</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-white font-bold">{formatCurrency(selectedOrder.totalAmount)}</p>
                  <p className="text-amber-400">{selectedOrder.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-2">Order Items</h4>
                <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between">
                      <div>
                        <span className="font-bold text-white">{item.productTitle}</span>
                        <p className="text-neutral-500 font-mono text-[10px]">
                          Size: {item.variantSize} • SKU: {item.variantSku} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-white font-bold">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
};
