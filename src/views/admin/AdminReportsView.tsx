import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { reportsService, getDateRange } from '../../services/reportsService.ts';
import { formatCurrency } from '../../lib/utils.ts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  Building2,
  PieChart as PieChartIcon,
  ShieldAlert,
  Calendar,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { ReportDateFilter, ReportType } from '../../types/index.ts';

const REPORT_TABS: { id: ReportType; label: string; icon: any }[] = [
  { id: 'sales', label: 'Sales Report', icon: TrendingUp },
  { id: 'profit', label: 'Profit & Loss', icon: DollarSign },
  { id: 'expense', label: 'Expense Report', icon: PieChartIcon },
  { id: 'inventory', label: 'Inventory Report', icon: Package },
  { id: 'purchase', label: 'Purchase Report', icon: Building2 },
  { id: 'order', label: 'Order Report', icon: ShoppingCart },
  { id: 'payment', label: 'Payment Report', icon: CreditCard },
  { id: 'customer_due', label: 'Customer Due', icon: Users },
  { id: 'supplier_due', label: 'Supplier Due', icon: Building2 },
  { id: 'investment', label: 'Investment Report', icon: BarChart3 },
  { id: 'loan', label: 'Loan & Debt Report', icon: ShieldAlert },
];

const DATE_FILTERS: { id: ReportDateFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'previous_month', label: 'Previous Month' },
  { id: 'custom', label: 'Custom Range' },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

export const AdminReportsView: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateFilter, setDateFilter] = useState<ReportDateFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Active Date Range
  const activeRange = useMemo(() => {
    return getDateRange(dateFilter, customStartDate, customEndDate);
  }, [dateFilter, customStartDate, customEndDate]);

  const rangeStartStr = activeRange.startDate.toISOString().slice(0, 10);
  const rangeEndStr = activeRange.endDate.toISOString().slice(0, 10);

  // Load Real Report Data from reportsService
  const salesData = useMemo(() => reportsService.getSalesReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const profitData = useMemo(() => reportsService.getProfitReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const expenseData = useMemo(() => reportsService.getExpenseReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const inventoryData = useMemo(() => reportsService.getInventoryReport(), []);
  const purchaseData = useMemo(() => reportsService.getPurchaseReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const orderData = useMemo(() => reportsService.getOrderReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const paymentData = useMemo(() => reportsService.getPaymentReport(dateFilter, customStartDate, customEndDate), [dateFilter, customStartDate, customEndDate]);
  const customerDueData = useMemo(() => reportsService.getCustomerDueReport(), []);
  const supplierDueData = useMemo(() => reportsService.getSupplierDueReport(), []);
  const investmentData = useMemo(() => reportsService.getInvestmentReport(), []);
  const loanData = useMemo(() => reportsService.getLoanReport(), []);

  // CSV Exporter for current active report
  const handleExportReportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `RAYVEN_${activeReport.toUpperCase()}_REPORT_${rangeStartStr}_to_${rangeEndStr}.csv`;

    if (activeReport === 'sales') {
      headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Total Amount (BDT)', 'Paid (BDT)', 'Due (BDT)', 'Status', 'Payment Method'];
      rows = salesData.orders.map((o) => [
        `"${o.orderNumber}"`,
        `"${o.createdAt.slice(0, 10)}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        o.totalAmount,
        o.amountPaid || 0,
        o.remainingDue || 0,
        `"${o.status}"`,
        `"${o.paymentMethod || ''}"`,
      ]);
    } else if (activeReport === 'profit') {
      headers = ['Metric', 'Amount (BDT)', 'Percentage / Details'];
      rows = [
        ['Total Gross Revenue', profitData.totalRevenue, '100%'],
        ['Cost of Goods Sold (COGS)', profitData.totalCogs, `${((profitData.totalCogs / (profitData.totalRevenue || 1)) * 100).toFixed(1)}%`],
        ['Gross Profit Margin', profitData.grossProfit, `${profitData.grossMarginPct}%`],
        ['Total Operating Expenses', profitData.totalExpenses, 'Operational outflows'],
        ['Net Net Profit', profitData.netProfit, `${profitData.netMarginPct}%`],
      ];
    } else if (activeReport === 'expense') {
      headers = ['Voucher No', 'Date', 'Category', 'Description', 'Amount (BDT)', 'Method', 'Added By'];
      rows = expenseData.expenses.map((e) => [
        `"${e.voucherNo || (e as any).voucherNumber || e.id}"`,
        `"${e.expenseDate || e.date || ''}"`,
        `"${e.category}"`,
        `"${(e.description || '').replace(/"/g, '""')}"`,
        e.amount,
        `"${e.paymentMethod}"`,
        `"${e.addedBy || 'Finance'}"`,
      ]);
    } else if (activeReport === 'inventory') {
      headers = ['SKU', 'Title', 'Size', 'Available Qty', 'Reserved', 'Cost/Unit (BDT)', 'Price/Unit (BDT)', 'Total Asset Valuation (BDT)'];
      rows = inventoryData.inventory.map((i) => {
        const avail = i.available ?? i.availableQuantity ?? 0;
        return [
          `"${i.sku}"`,
          `"${i.productTitle.replace(/"/g, '""')}"`,
          `"${i.size}"`,
          avail,
          i.reserved ?? i.reservedStock ?? 0,
          i.costPerUnit || 600,
          i.sellingPrice || 1400,
          avail * (i.costPerUnit || 600),
        ];
      });
    } else if (activeReport === 'purchase') {
      headers = ['PO Number', 'Date', 'Supplier', 'Items Qty', 'Total Cost (BDT)', 'Amount Paid (BDT)', 'Supplier Due (BDT)', 'Status'];
      rows = purchaseData.purchases.map((p) => [
        `"${p.poNumber}"`,
        `"${p.purchaseDate || (p.createdAt ? p.createdAt.slice(0, 10) : '')}"`,
        `"${p.supplierName.replace(/"/g, '""')}"`,
        p.quantity || p.itemsCount || 1,
        p.totalCost,
        p.amountPaid || 0,
        p.supplierDue || 0,
        `"${p.status}"`,
      ]);
    } else if (activeReport === 'order') {
      headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Division', 'Total (BDT)', 'Status', 'Payment Status'];
      rows = orderData.orders.map((o) => [
        `"${o.orderNumber}"`,
        `"${o.createdAt.slice(0, 10)}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.division || ''}"`,
        o.totalAmount,
        `"${o.status}"`,
        `"${o.paymentStatus}"`,
      ]);
    } else if (activeReport === 'payment') {
      headers = ['Order Number', 'Date', 'Customer Name', 'Method', 'Transaction ID', 'Phone', 'Amount (BDT)', 'Verification Status'];
      rows = paymentData.submissions.map((s) => [
        `"${s.orderNumber}"`,
        `"${s.date ? s.date.slice(0, 10) : ''}"`,
        `"${s.customerName.replace(/"/g, '""')}"`,
        `"${s.method}"`,
        `"${s.trxId}"`,
        `"${s.phone}"`,
        s.amount,
        `"${s.status}"`,
      ]);
    } else if (activeReport === 'customer_due') {
      headers = ['Order Number', 'Date', 'Customer Name', 'Customer Phone', 'Total Amount (BDT)', 'Paid (BDT)', 'Receivable Due (BDT)'];
      rows = customerDueData.dueOrders.map((o) => [
        `"${o.orderNumber}"`,
        `"${o.createdAt.slice(0, 10)}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        o.totalAmount,
        o.amountPaid || 0,
        o.remainingDue,
      ]);
    } else if (activeReport === 'supplier_due') {
      headers = ['Supplier Code', 'Supplier Name', 'Phone', 'Total Spend (BDT)', 'Total Paid (BDT)', 'Payable Due (BDT)'];
      rows = supplierDueData.suppliers.map((s) => [
        `"${s.code}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.phone}"`,
        s.totalSpend || 0,
        s.totalPaid || 0,
        s.supplierDue,
      ]);
    } else if (activeReport === 'investment') {
      headers = ['Ref', 'Date', 'Investor', 'Type', 'Amount (BDT)', 'Share %', 'Status'];
      rows = investmentData.investments.map((i) => [
        `"${i.investmentNumber || i.id}"`,
        `"${i.date || ''}"`,
        `"${(i.investor || i.investorName || '').replace(/"/g, '""')}"`,
        `"${i.investorType}"`,
        i.amount,
        i.sharePercentage ? `${i.sharePercentage}%` : 'N/A',
        `"${i.status}"`,
      ]);
    } else if (activeReport === 'loan') {
      headers = ['Loan Number', 'Start Date', 'Lender', 'Principal (BDT)', 'Repaid (BDT)', 'Remaining Due (BDT)', 'Status', 'Due Date'];
      rows = loanData.loans.map((l) => [
        `"${l.loanNumber}"`,
        `"${l.startDate || l.date || ''}"`,
        `"${(l.lender || l.lenderName || '').replace(/"/g, '""')}"`,
        l.principal,
        l.amountRepaid,
        l.balanceRemaining ?? Math.max(0, l.principal - l.amountRepaid),
        `"${l.status}"`,
        `"${l.dueDate || ''}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPeriodApplicable = !['inventory', 'customer_due', 'supplier_due'].includes(activeReport);

  return (
    <AdminLayout
      title="Financial & ERP Intelligence Reports"
      subtitle="Audited enterprise statements, real ledger data aggregation, and multi-period financial reconciliation."
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
            onClick={handleExportReportCSV}
          >
            Export Active Report (CSV)
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-left">
        {/* Navigation Tabs for All 11 Reports */}
        <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReport === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filter Controls (Only shown for period-based reports) */}
        {isPeriodApplicable && (
          <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Select Period Filter:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      dateFilter === f.id
                        ? 'bg-neutral-200 text-neutral-900 font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Start Date:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-neutral-900 border border-neutral-750 text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">End Date:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-neutral-900 border border-neutral-750 text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-neutral-400 font-mono">
              Audited Data Window:{' '}
              <span className="text-blue-400 font-semibold">{rangeStartStr}</span> to{' '}
              <span className="text-blue-400 font-semibold">{rangeEndStr}</span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 1: SALES REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Gross Sales Revenue</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {formatCurrency(salesData.grossSales)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {salesData.ordersCount} total orders placed
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Net Sales Revenue</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(salesData.totalRevenue)}
                </p>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">
                  After discounts & coupon codes
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Paid Advance</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {formatCurrency(salesData.totalAmountCollected)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Pending due: {formatCurrency(salesData.totalDue)}
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Average Order Value (AOV)</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {formatCurrency(salesData.aov)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {salesData.totalUnitsSold} jersey units sold
                </span>
              </div>
            </div>

            {/* Sales Daily Trend Chart */}
            <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
                <span>Daily Sales Velocity (BDT)</span>
                <span className="text-xs text-neutral-400 font-normal">Real Database Order Dates</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData.trendData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }}
                      formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Sales Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Orders Ledger Table */}
            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Audited Sales Orders Ledger ({salesData.orders.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5 text-right">Total (BDT)</th>
                      <th className="py-2.5 text-right">Paid (BDT)</th>
                      <th className="py-2.5 text-right">Due (BDT)</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {salesData.orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-neutral-500 font-sans">
                          No orders found within selected date filter.
                        </td>
                      </tr>
                    ) : (
                      salesData.orders.slice(0, 15).map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 font-bold text-white font-sans">{o.orderNumber}</td>
                          <td className="py-3 text-neutral-400">{o.createdAt.slice(0, 10)}</td>
                          <td className="py-3 font-sans text-neutral-200">{o.customerName}</td>
                          <td className="py-3 text-neutral-400">{o.customerPhone}</td>
                          <td className="py-3 text-right font-bold text-white">{formatCurrency(o.totalAmount)}</td>
                          <td className="py-3 text-right text-emerald-400">{formatCurrency(o.amountPaid || 0)}</td>
                          <td className="py-3 text-right text-rose-400">{formatCurrency(o.remainingDue || 0)}</td>
                          <td className="py-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.status === 'DELIVERED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : o.status === 'CANCELLED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 2: PROFIT & LOSS REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Net Inflow Revenue</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {formatCurrency(profitData.totalRevenue)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Delivered orders revenue
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Cost of Goods Sold (COGS)</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(profitData.totalCogs)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Direct procurement unit cost
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Operating Expenses</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {formatCurrency(profitData.totalExpenses)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Packaging, rent, courier & ops
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Net Audited Profit</span>
                <p
                  className={`text-2xl font-bold font-mono mt-1 ${
                    profitData.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(profitData.netProfit)}
                </p>
                <span className="text-[11px] font-mono mt-2 block text-emerald-400">
                  {profitData.netMarginPct}% Net Margin
                </span>
              </div>
            </div>

            {/* P&L Statement Breakdown */}
            <div className="p-6 rounded-xl bg-[#12151c] border border-neutral-800 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Formal Profit & Loss Statement (P&L Ledger)
              </h3>
              <div className="divide-y divide-neutral-800 font-mono text-xs">
                <div className="py-3 flex items-center justify-between text-white font-bold font-sans">
                  <span>1. Gross Sales Revenue (Delivered Batches)</span>
                  <span className="font-mono text-emerald-400">{formatCurrency(profitData.totalRevenue)}</span>
                </div>
                <div className="py-3 flex items-center justify-between text-neutral-300 pl-4">
                  <span>Less: Cost of Goods Sold (Procurement Buying Price × Sold Units)</span>
                  <span className="text-rose-400">- {formatCurrency(profitData.totalCogs)}</span>
                </div>
                <div className="py-3 flex items-center justify-between text-white font-bold bg-neutral-900/50 px-2 rounded">
                  <span>GROSS PROFIT</span>
                  <span className="text-emerald-400">{formatCurrency(profitData.grossProfit)}</span>
                </div>
                <div className="py-3 flex items-center justify-between text-neutral-300 pl-4">
                  <span>Less: Operational & General Expenses (Rent, Courier, Logistics)</span>
                  <span className="text-amber-400">- {formatCurrency(profitData.totalExpenses)}</span>
                </div>
                <div className="py-3 flex items-center justify-between text-white font-bold bg-blue-950/30 px-2 rounded border border-blue-800/40">
                  <span className="text-sm">NET OPERATING PROFIT</span>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(profitData.netProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 3: EXPENSE REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'expense' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Period Expenses</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(expenseData.totalExpense)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {expenseData.voucherCount} vouchers recorded
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Active Cost Categories</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {expenseData.categories.length}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Rent, Packaging, Logistics, etc.
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Top Cost Driver</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {expenseData.categories[0]?.category || 'N/A'}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {formatCurrency(expenseData.categories[0]?.amount || 0)}
                </span>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-5 rounded-xl bg-[#12151c] border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Expense Distribution</h3>
                <div className="space-y-3">
                  {expenseData.categories.map((c, idx) => (
                    <div key={c.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <span className="text-neutral-300 font-medium">{c.category}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 p-5 rounded-xl bg-[#12151c] border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Audited Expense Vouchers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                      <tr>
                        <th className="py-2">Voucher #</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Category</th>
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Amount (BDT)</th>
                        <th className="py-2">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                      {expenseData.expenses.map((e) => (
                        <tr key={e.id}>
                          <td className="py-2.5 font-bold text-white font-sans">
                            {e.voucherNo || (e as any).voucherNumber || e.id}
                          </td>
                          <td className="py-2.5 text-neutral-400">{e.expenseDate || e.date}</td>
                          <td className="py-2.5 font-sans text-amber-400">{e.category}</td>
                          <td className="py-2.5 font-sans text-neutral-300">{e.description || e.title}</td>
                          <td className="py-2.5 text-right font-bold text-rose-400">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="py-2.5 font-sans">{e.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 4: INVENTORY REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Available Units</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {inventoryData.totalAvailable.toLocaleString()} units
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {inventoryData.totalReserved} units reserved in orders
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Asset Valuation (Cost)</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(inventoryData.stockValuationCost)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Factory procurement valuation
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Potential Retail Value</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {formatCurrency(inventoryData.stockPotentialRetail)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Projected revenue if all stock sold
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Low Stock SKUs</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {inventoryData.lowStockCount}
                </p>
                <span className="text-[11px] text-amber-400/80 font-mono mt-2 block">
                  Below safety threshold
                </span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Inventory SKUs & Valuation Ledger ({inventoryData.inventory.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5">Jersey Name</th>
                      <th className="py-2.5">Size</th>
                      <th className="py-2.5 text-right">Available</th>
                      <th className="py-2.5 text-right">Reserved</th>
                      <th className="py-2.5 text-right">Cost Price (BDT)</th>
                      <th className="py-2.5 text-right">Retail Price (BDT)</th>
                      <th className="py-2.5 text-right">Asset Value (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {inventoryData.inventory.map((i) => {
                      const avail = i.available ?? i.availableQuantity ?? 0;
                      const cost = i.costPerUnit || 600;
                      return (
                        <tr key={i.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 font-bold text-white font-sans">{i.sku}</td>
                          <td className="py-3 font-sans text-neutral-200">{i.productTitle}</td>
                          <td className="py-3 font-sans">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                              {i.size}
                            </span>
                          </td>
                          <td
                            className={`py-3 text-right font-bold ${
                              avail <= 5 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {avail}
                          </td>
                          <td className="py-3 text-right text-neutral-400">{i.reserved ?? i.reservedStock ?? 0}</td>
                          <td className="py-3 text-right text-neutral-400">{formatCurrency(cost)}</td>
                          <td className="py-3 text-right text-white">
                            {formatCurrency(i.sellingPrice || 1400)}
                          </td>
                          <td className="py-3 text-right font-bold text-emerald-400">
                            {formatCurrency(avail * cost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 5: PURCHASE REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'purchase' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Procurement Cost</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {formatCurrency(purchaseData.totalSpend)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {purchaseData.totalPOs} purchase orders
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Paid to Suppliers</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(purchaseData.totalPaid)}
                </p>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">
                  Settled procurement cash
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Supplier Payable Dues</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(purchaseData.totalDue)}
                </p>
                <span className="text-[11px] text-rose-400/80 font-mono mt-2 block">
                  Outstanding credit balances
                </span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Audited Purchase Orders Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">PO #</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Supplier</th>
                      <th className="py-2.5 text-right">Units</th>
                      <th className="py-2.5 text-right">Total Cost (BDT)</th>
                      <th className="py-2.5 text-right">Paid (BDT)</th>
                      <th className="py-2.5 text-right">Due (BDT)</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {purchaseData.purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 font-bold text-white font-sans">{p.poNumber}</td>
                        <td className="py-3 text-neutral-400">{p.purchaseDate}</td>
                        <td className="py-3 font-sans text-neutral-200">{p.supplierName}</td>
                        <td className="py-3 text-right">{p.quantity || p.itemsCount || 1}</td>
                        <td className="py-3 text-right font-bold text-white">{formatCurrency(p.totalCost)}</td>
                        <td className="py-3 text-right text-emerald-400">{formatCurrency(p.amountPaid || 0)}</td>
                        <td className="py-3 text-right text-rose-400">{formatCurrency(p.supplierDue || 0)}</td>
                        <td className="py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'RECEIVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 6: ORDER REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'order' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Confirmed</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">{orderData.statusCounts.CONFIRMED || 0}</p>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">In Hub / Transit</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {(orderData.statusCounts.IN_HUB || 0) + (orderData.statusCounts.OUT_FOR_DELIVERY || 0)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Delivered</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{orderData.statusCounts.DELIVERED || 0}</p>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Cancelled</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{orderData.statusCounts.CANCELLED || 0}</p>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Customer Orders Detail Breakdown ({orderData.orders.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Division</th>
                      <th className="py-2.5 text-right">Total (BDT)</th>
                      <th className="py-2.5">Fulfillment Status</th>
                      <th className="py-2.5">Payment Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {orderData.orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 font-bold text-white font-sans">{o.orderNumber}</td>
                        <td className="py-3 text-neutral-400">{o.createdAt.slice(0, 10)}</td>
                        <td className="py-3 font-sans text-neutral-200">{o.customerName}</td>
                        <td className="py-3 font-sans text-neutral-400">{o.division || 'Dhaka'}</td>
                        <td className="py-3 text-right font-bold text-white">{formatCurrency(o.totalAmount)}</td>
                        <td className="py-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : o.paymentStatus === 'UNDER_REVIEW'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 7: PAYMENT REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'payment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Collected (Cash Inflow)</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(paymentData.totalCollected)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Advance: {formatCurrency(paymentData.advanceTotal)} | Full: {formatCurrency(paymentData.fullPaymentTotal)}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Verification Status</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {paymentData.approvalRate}% Approved
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {paymentData.approvedCount} approved, {paymentData.reviewCount} in review
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Top Channel (bKash/Nagad)</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {formatCurrency(
                    paymentData.methodBreakdown.bKash?.amount || paymentData.methodBreakdown.Nagad?.amount || 0
                  )}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">Mobile financial gateways</span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Customer Payment Verification Records ({paymentData.submissions.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Customer Name</th>
                      <th className="py-2.5">Method</th>
                      <th className="py-2.5">TrxID</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5 text-right">Amount (BDT)</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {paymentData.submissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-neutral-500 font-sans">
                          No customer payment submissions found for this period.
                        </td>
                      </tr>
                    ) : (
                      paymentData.submissions.map((s, idx) => (
                        <tr key={idx} className="hover:bg-neutral-800/30">
                          <td className="py-3 font-bold text-white font-sans">{s.orderNumber}</td>
                          <td className="py-3 text-neutral-400">{s.date ? s.date.slice(0, 10) : ''}</td>
                          <td className="py-3 font-sans text-neutral-200">{s.customerName}</td>
                          <td className="py-3 font-sans text-white">{s.method}</td>
                          <td className="py-3 text-amber-400">{s.trxId}</td>
                          <td className="py-3 text-neutral-400">{s.phone}</td>
                          <td className="py-3 text-right font-bold text-emerald-400">{formatCurrency(s.amount)}</td>
                          <td className="py-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : s.status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 8: CUSTOMER DUE REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'customer_due' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Customer Dues</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(customerDueData.totalDue)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Pending cash-on-delivery receivable
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Due Orders Count</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {customerDueData.totalOrdersWithDue}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">Orders awaiting final collection</span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Advance Collected</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(
                    customerDueData.dueOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0)
                  )}
                </p>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">Secured upfront advance</span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Outstanding Customer Receivables List ({customerDueData.dueOrders.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5 text-right">Order Total (BDT)</th>
                      <th className="py-2.5 text-right">Advance Paid (BDT)</th>
                      <th className="py-2.5 text-right">Remaining Due (BDT)</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {customerDueData.dueOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 font-bold text-white font-sans">{o.orderNumber}</td>
                        <td className="py-3 text-neutral-400">{o.createdAt.slice(0, 10)}</td>
                        <td className="py-3 font-sans text-neutral-200">{o.customerName}</td>
                        <td className="py-3 text-neutral-400">{o.customerPhone}</td>
                        <td className="py-3 text-right font-bold text-white">{formatCurrency(o.totalAmount)}</td>
                        <td className="py-3 text-right text-emerald-400">{formatCurrency(o.amountPaid || 0)}</td>
                        <td className="py-3 text-right font-bold text-rose-400">{formatCurrency(o.remainingDue)}</td>
                        <td className="py-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-200">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 9: SUPPLIER DUE REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'supplier_due' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Supplier Payables</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(supplierDueData.totalSupplierDue)}
                </p>
                <span className="text-[11px] text-rose-400/80 font-mono mt-2 block">
                  Outstanding credit to vendors
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Suppliers with Dues</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {supplierDueData.suppliersWithDueCount}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">Active factory credit accounts</span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Disbursed Paid</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(supplierDueData.totalPaid)}
                </p>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">Disbursed factory capital</span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Factory Supplier Dues Ledger ({supplierDueData.suppliers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Code</th>
                      <th className="py-2.5">Company Name</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5 text-right">Total Spend (BDT)</th>
                      <th className="py-2.5 text-right">Total Paid (BDT)</th>
                      <th className="py-2.5 text-right">Outstanding Due (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {supplierDueData.suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 font-bold text-white font-sans">{s.code}</td>
                        <td className="py-3 font-sans text-neutral-200">{s.name}</td>
                        <td className="py-3 text-neutral-400">{s.phone}</td>
                        <td className="py-3 text-right text-white">{formatCurrency(s.totalSpend || 0)}</td>
                        <td className="py-3 text-right text-emerald-400">{formatCurrency(s.totalPaid || 0)}</td>
                        <td className="py-3 text-right font-bold text-rose-400">
                          {formatCurrency(s.supplierDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 10: INVESTMENT REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'investment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Capital Invested</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(investmentData.totalInvested)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  Net retained: {formatCurrency(investmentData.netRetainedCapital)}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Owner Equity Capital</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {formatCurrency(investmentData.totalOwnerCapital)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">From the 3 Business Owners</span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">External Investor Capital</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {formatCurrency(investmentData.totalExternalCapital)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">Angel & equity partners</span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Audited Capital Investment Register
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Investor</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5 text-right">Amount (BDT)</th>
                      <th className="py-2.5 text-right">Equity Share %</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {investmentData.investments.map((i) => (
                      <tr key={i.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 text-neutral-400">{i.date}</td>
                        <td className="py-3 font-sans text-white font-bold">{i.investor || i.investorName}</td>
                        <td className="py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              i.investorType === 'OWNER'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {i.investorType}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-400">
                          {formatCurrency(i.amount)}
                        </td>
                        <td className="py-3 text-right text-neutral-300">
                          {i.sharePercentage ? `${i.sharePercentage}%` : 'N/A'}
                        </td>
                        <td className="py-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                            {i.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 11: LOAN REPORT */}
        {/* ---------------------------------------------------- */}
        {activeReport === 'loan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Total Principal Borrowed</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {formatCurrency(loanData.totalBorrowed)}
                </p>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
                  {loanData.loans.length} total loan facilities
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Principal Repaid</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(loanData.totalRepaid)}
                </p>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">
                  {loanData.closedLoansCount} loans paid in full
                </span>
              </div>
              <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium uppercase">Outstanding Debt Balance</span>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {formatCurrency(loanData.totalOutstanding)}
                </p>
                <span className="text-[11px] text-rose-400/80 font-mono mt-2 block">
                  {loanData.activeLoansCount} active liabilities
                </span>
              </div>
            </div>

            <div className="bg-[#12151c] rounded-xl border border-neutral-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Audited Loan & Debt Facilities Register
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5">Loan #</th>
                      <th className="py-2.5">Lender</th>
                      <th className="py-2.5">Start Date</th>
                      <th className="py-2.5 text-right">Principal (BDT)</th>
                      <th className="py-2.5 text-right">Repaid (BDT)</th>
                      <th className="py-2.5 text-right">Remaining Due (BDT)</th>
                      <th className="py-2.5">Due Date</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {loanData.loans.map((l) => (
                      <tr key={l.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 font-bold text-white font-sans">{l.loanNumber}</td>
                        <td className="py-3 font-sans text-neutral-200">{l.lender || l.lenderName}</td>
                        <td className="py-3 text-neutral-400">{l.startDate || l.date}</td>
                        <td className="py-3 text-right font-bold text-white">{formatCurrency(l.principal)}</td>
                        <td className="py-3 text-right text-emerald-400">{formatCurrency(l.amountRepaid)}</td>
                        <td className="py-3 text-right font-bold text-rose-400">
                          {formatCurrency(l.balanceRemaining ?? Math.max(0, l.principal - l.amountRepaid))}
                        </td>
                        <td className="py-3 text-neutral-400">{l.dueDate}</td>
                        <td className="py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              l.status === 'PAID_OFF'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
