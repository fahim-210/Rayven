import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { RotateCcw } from 'lucide-react';

export const AdminReturnsView: React.FC = () => {
  const returns = storeService.getReturns();

  return (
    <AdminLayout
      title="Returns & RMA Authorization"
      subtitle="Manage exchange requests, damaged goods inspections, and automated customer refunds."
    >
      <div className="space-y-6 text-left">
        <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">RMA ID</th>
                  <th className="py-3 px-4">Origin Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Claim Reason</th>
                  <th className="py-3 px-4">Requested Refund</th>
                  <th className="py-3 px-4">Return Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{ret.rmaNumber}</td>
                    <td className="py-3 px-4 font-mono text-white">{ret.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{ret.customerName}</td>
                    <td className="py-3 px-4 text-neutral-300">{ret.reason}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="gold" size="sm">
                        {ret.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="text-[11px] py-1">
                        Review Claim
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
