import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import {
  ShoppingBag,
  Boxes,
  Wallet,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  Truck,
  ShieldCheck,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Building,
  Receipt,
  PiggyBank,
  Landmark,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Order, InventoryItem, ActivityLog } from '../../types/index.ts';

export const AdminDashboardView: React.FC = () => {
  const { navigate } = useRouter();

  // Selected order for quick modal inspection
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dynamic real-time data calculated via storeService
  const orderStats = storeService.getDashboardOrderStats();
  const stockStats = storeService.getDashboardStockStats();
  const financials = storeService.getDashboardFinancials();
  const currentStockCost = storeService.getCurrentStockCost();
  const potentialSalesValue = storeService.getPotentialSalesValue();
  const recentOrders = storeService.getOrders().slice(0, 7);
  const recentLogs = storeService.getActivityLogs().slice(0, 8);
  const lowStockItems = stockStats.lowStockItems.slice(0, 6);

  const handleManualRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminLayout
      title="Admin Command Dashboard"
      subtitle="Complete operational control: live order pipeline, warehouse stock reserves, and verified financial telemetry."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Recalculate metrics from database"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/purchases')}
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
          >
            New PO
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/admin/products')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Kit
          </Button>
        </div>
      }
    >
      <div key={refreshKey} className="space-y-10 text-left">
        {/* ========================================================
            SECTION 1: ORDER INFORMATION
            - Today's Orders
            - Pending Orders
            - Delivered Orders
            - Cancelled Orders
            - Returned Orders
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  SECTION 1
                </span>
                <span className="text-neutral-500">•</span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Order Information
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time fulfillment stages across customer matchwear dispatches and courier tracking.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/orders')}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              className="text-xs text-neutral-400 hover:text-white"
            >
              View All Orders ({orderStats.totalOrdersCount})
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Today's Orders */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-amber-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Today's Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {orderStats.todayOrdersCount}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Last 24h intake</span>
              </div>
            </div>

            {/* 2. Pending Orders */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-blue-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Pending Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-blue-400">
                {orderStats.pendingOrdersCount}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-400">
                <Badge variant="info" size="sm">
                  Fulfillment Queue
                </Badge>
              </div>
            </div>

            {/* 3. Delivered Orders */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-emerald-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Delivered Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                {orderStats.deliveredOrdersCount}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
                <span>Completed parcels</span>
              </div>
            </div>

            {/* 4. Cancelled Orders */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-red-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Cancelled Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-300">
                {orderStats.cancelledOrdersCount}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400 font-mono">
                <span>Voided / Unpaid</span>
              </div>
            </div>

            {/* 5. Returned Orders */}
            <div
              onClick={() => navigate('/admin/returns')}
              className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-purple-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Returned Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">
                {orderStats.returnedOrdersCount}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 font-mono">
                <span>RMA & Exchanges</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: STOCK
            - Available Stock
            - Reserved Stock
            - Returned Stock
            - Low Stock
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  SECTION 2
                </span>
                <span className="text-neutral-500">•</span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Warehouse Stock
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Physical jersey inventory, active reservations, returns quarantine, and reorder alerts.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/inventory')}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Inventory Management
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Available Stock */}
            <div
              onClick={() => navigate('/admin/inventory')}
              className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Available Stock
                </span>
                <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                  {stockStats.availableStock.toLocaleString()}
                </p>
                <span className="text-xs text-neutral-500 font-mono">Units</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                Ready for immediate pick, print & pack
              </p>
            </div>

            {/* 2. Reserved Stock */}
            <div
              onClick={() => navigate('/admin/inventory')}
              className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Reserved Stock
                </span>
                <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-blue-400">
                  {stockStats.reservedStock.toLocaleString()}
                </p>
                <span className="text-xs text-neutral-500 font-mono">Units</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                Allocated to confirmed & unfulfilled orders
              </p>
            </div>

            {/* 3. Returned Stock */}
            <div
              onClick={() => navigate('/admin/returns')}
              className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Returned Stock
                </span>
                <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">
                  {stockStats.returnedStock.toLocaleString()}
                </p>
                <span className="text-xs text-neutral-500 font-mono">Units</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                In QC quarantine or size-exchange holding
              </p>
            </div>

            {/* 4. Low Stock */}
            <div
              onClick={() => navigate('/admin/inventory')}
              className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-amber-400/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Low Stock
                </span>
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                  {stockStats.lowStockCount}
                </p>
                <span className="text-xs text-neutral-500 font-mono">SKUs</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-amber-400 font-mono font-semibold">
                  Below safety reorder threshold
                </span>
              </div>
            </div>
          </div>

          {/* Stock Valuation (Buying Cost Basis vs Potential Sales) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#12151c] border border-amber-400/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" /> Current Stock Cost (Buying Value)
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  {formatCurrency(currentStockCost)}
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Calculated using buying cost (10 pcs × ৳500 = ৳5,000 basis)
                </p>
              </div>
              <div className="text-right text-xs font-mono text-neutral-400 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                <span className="text-amber-400 font-bold">{stockStats.availableStock} Available</span>
                <p className="text-[10px] text-neutral-500">Physical Assets</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Potential Sales Value
                </span>
                <p className="text-2xl font-black text-purple-300 font-mono">
                  {formatCurrency(potentialSalesValue)}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Available stock valued at full retail selling price
                </p>
              </div>
              <div className="text-right text-xs font-mono text-neutral-400 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                <span className="text-emerald-400 font-bold">
                  +{formatCurrency(potentialSalesValue - currentStockCost)}
                </span>
                <p className="text-[10px] text-neutral-500">Gross Margin</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: FINANCE
            - Today's Sales
            - Monthly Sales
            - Total Expenses
            - Total Investment
            - Customer Due
            - Supplier Due
            - Loan Outstanding
            - Total Delivery Charge Received
            - Actual Delivery Charge Paid
            - Delivery Charge Profit
            - Current Total Product Cost
            - Net Profit
            - Cash Balance
           ======================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  SECTION 3
                </span>
                <span className="text-neutral-500">•</span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Financial Telemetry & ERP Balance
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Audited calculations for sales, product procurement, logistics margins, net profit, and real cash balance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/cashbook')}
                leftIcon={<Wallet className="w-3.5 h-3.5" />}
              >
                Cashbook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/reports')}
                leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
              >
                P&L Report
              </Button>
            </div>
          </div>

          {/* Core Spotlight: Net Profit & Cash Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NET PROFIT CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161a22] to-[#10131a] border border-amber-400/30 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Core Business Metric
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Net Profit</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Strict business formula: Sales - Buying Cost - Expenses + Delivery Profit
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                    {formatCurrency(financials.netProfit)}
                  </span>
                  <Badge variant="gold" size="sm">
                    Verified P&L
                  </Badge>
                </div>
              </div>

              {/* Exact breakdown formula verification */}
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Total Sales (Gross Product Revenue):</span>
                  <span className="font-mono text-white font-semibold">
                    +{formatCurrency(financials.totalProductSales)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Product Buying Cost (COGS):</span>
                  <span className="font-mono text-red-400 font-semibold">
                    -{formatCurrency(financials.productBuyingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Business Expenses:</span>
                  <span className="font-mono text-red-400 font-semibold">
                    -{formatCurrency(financials.businessExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Delivery Charge Profit:</span>
                  <span className={`font-mono font-semibold ${financials.deliveryChargeProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {financials.deliveryChargeProfit >= 0 ? '+' : ''}{formatCurrency(financials.deliveryChargeProfit)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Audited Net Profit:</span>
                  <span className="font-mono">{formatCurrency(financials.netProfit)}</span>
                </div>
              </div>
            </div>

            {/* CASH BALANCE CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161a22] to-[#10131a] border border-emerald-400/30 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Liquidity & Treasury
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Cash Balance</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Conceptually: Total In - Total Out from recorded cash movements
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                    {formatCurrency(financials.cashBalance)}
                  </span>
                  <Badge variant="success" size="sm">
                    Reconciled
                  </Badge>
                </div>
              </div>

              {/* Exact Cashflow In / Out Verification */}
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Total Inflows (Sales, Investments, Loans):</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    +{formatCurrency(financials.cashIn.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Total Outflows (Expenses, Purchases, Couriers):</span>
                  <span className="font-mono text-red-400 font-semibold">
                    -{formatCurrency(financials.cashOut.total)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Treasury Vault Balance:</span>
                  <span className="font-mono">{formatCurrency(financials.cashBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Sales In: {formatCurrency(financials.cashIn.salesReceived)}</span>
                  <span>Purchases Paid: {formatCurrency(financials.cashOut.purchasesPaid)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 11 Sub-financial telemetry items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Today's Sales */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Today's Sales
              </span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(financials.todaySales)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Last 24h recognized
              </span>
            </div>

            {/* 2. Monthly Sales */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Monthly Sales
              </span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(financials.monthlySales)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Current billing month
              </span>
            </div>

            {/* 3. Total Expenses */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">
                {formatCurrency(financials.totalExpenses)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Vouchers & overhead
              </span>
            </div>

            {/* 4. Total Investment */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Total Investment
              </span>
              <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                {formatCurrency(financials.totalInvestment)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Partner & founder equity
              </span>
            </div>

            {/* 5. Customer Due */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Customer Due
              </span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                {formatCurrency(financials.customerDue)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Uncollected order dues
              </span>
            </div>

            {/* 6. Supplier Due */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Supplier Due
              </span>
              <p className="text-xl font-bold font-mono text-amber-300 mt-1">
                {formatCurrency(financials.supplierDue)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Pending procurement payables
              </span>
            </div>

            {/* 7. Loan Outstanding */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Loan Outstanding
              </span>
              <p className="text-xl font-bold font-mono text-purple-400 mt-1">
                {formatCurrency(financials.loanOutstanding)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Active commercial facilities
              </span>
            </div>

            {/* 8. Current Total Product Cost */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Current Total Product Cost
              </span>
              <p className="text-xl font-bold font-mono text-neutral-200 mt-1">
                {formatCurrency(financials.currentTotalProductCost)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Warehouse inventory valuation
              </span>
            </div>

            {/* 9. Total Delivery Charge Received */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Total Delivery Charge Received
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(financials.totalDeliveryChargeReceived)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Collected from customers
              </span>
            </div>

            {/* 10. Actual Delivery Charge Paid */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Actual Delivery Charge Paid
              </span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">
                {formatCurrency(financials.actualDeliveryChargePaid)}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Courier fees & cashbook freight
              </span>
            </div>

            {/* 11. Delivery Charge Profit */}
            <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Delivery Charge Profit
                </span>
                <Badge variant={financials.deliveryChargeProfit >= 0 ? 'success' : 'danger'} size="sm">
                  Logistics Net Margin
                </Badge>
              </div>
              <p className={`text-xl font-bold font-mono mt-1 ${financials.deliveryChargeProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {financials.deliveryChargeProfit >= 0 ? '+' : ''}{formatCurrency(financials.deliveryChargeProfit)}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                Received ({formatCurrency(financials.totalDeliveryChargeReceived)}) - Paid ({formatCurrency(financials.actualDeliveryChargePaid)})
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            OTHER DASHBOARD
            - Recent Orders
            - Low Stock
            - Recent Activity (Admin, Action, Timestamp, Related Entity)
           ======================================================== */}
        <section className="space-y-6 pt-2">
          <div className="pb-2 border-b border-neutral-800">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Operational Logs & Real-Time Monitoring
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live dispatches, low inventory reorder list, and staff audit trail.
            </p>
          </div>

          {/* 1. Recent Orders Table */}
          <div className="bg-[#12151c] rounded-2xl border border-neutral-800 overflow-hidden">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Recent Orders
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Latest customer match kit orders and fulfillment statuses
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/orders')}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                All Orders
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Paid / Due</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {recentOrders.map((order) => {
                    const due = order.remainingDue ?? Math.max(0, order.totalAmount - (order.amountPaid || 0));
                    return (
                      <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{order.customerName}</p>
                          <span className="text-[10px] text-neutral-500">{order.customerPhone || order.customerEmail}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-emerald-400">৳{order.amountPaid || 0}</span> /{' '}
                          <span className={due > 0 ? 'text-amber-400' : 'text-neutral-500'}>
                            ৳{due}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.paymentStatus === 'APPROVED' || order.paymentStatus === 'PAID'
                                ? 'success'
                                : order.paymentStatus === 'UNDER_REVIEW'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === 'DELIVERED'
                                ? 'success'
                                : order.status === 'CANCELLED'
                                ? 'danger'
                                : order.status === 'CONFIRMED'
                                ? 'gold'
                                : 'info'
                            }
                            size="sm"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setInspectOrder(order)}
                            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                            title="Inspect order details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-Column: Low Stock & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Low Stock (6 cols) */}
            <div className="lg:col-span-6 bg-[#12151c] rounded-2xl border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Low Stock Alert ({stockStats.lowStockCount})
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/admin/inventory')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Manage Inventory →
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 text-xs">
                  All warehouse items are safely above reorder points.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lowStockItems.map((item) => {
                    const avail = item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0));
                    const threshold = item.safetyStock ?? item.reorderPoint;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-400/40 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {item.productTitle || item.sku}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300">
                              {item.size}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                            SKU: {item.sku} • Cost: {formatCurrency(item.costPerUnit)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {avail} in stock
                          </span>
                          <p className="text-[10px] text-red-400 font-mono">
                            Reorder @ {threshold}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity (6 cols) */}
            {/* Show: admin, action, timestamp, related entity */}
            <div className="lg:col-span-6 bg-[#12151c] rounded-2xl border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Recent Activity
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/admin/activity-logs')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Full Audit Log →
                </button>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          {(log.admin || log.userName || 'A').charAt(0)}
                        </div>
                        <span className="font-semibold text-white">
                          {log.admin || log.userName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        {log.action}
                      </p>
                      {log.relatedEntity && (
                        <span className="shrink-0 px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-amber-400 border border-neutral-700">
                          {log.relatedEntity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Order Inspection Modal */}
      {inspectOrder && (
        <Dialog
          isOpen={true}
          onClose={() => setInspectOrder(null)}
          title={`Order ${inspectOrder.orderNumber}`}
          size="lg"
        >
          <div className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Customer</span>
                <p className="font-bold text-white mt-0.5">{inspectOrder.customerName}</p>
                <p className="text-[10px] text-neutral-400">{inspectOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Status</span>
                <p className="font-bold text-amber-400 mt-0.5">{inspectOrder.status}</p>
                <p className="text-[10px] text-neutral-400">{inspectOrder.paymentStatus}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Payment</span>
                <p className="font-bold text-white mt-0.5">{inspectOrder.paymentMethod}</p>
                <p className="text-[10px] text-neutral-400">
                  Paid: ৳{inspectOrder.amountPaid || 0}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Total Amount</span>
                <p className="font-bold text-emerald-400 mt-0.5 font-mono">
                  {formatCurrency(inspectOrder.totalAmount)}
                </p>
                <p className="text-[10px] text-amber-400 font-mono">
                  Due: ৳{inspectOrder.remainingDue || 0}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 block">
                Ordered Products ({inspectOrder.items.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {inspectOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-10 h-10 rounded object-cover border border-neutral-800"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-white">{item.productTitle}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Size: {item.variantSize} • Qty: {item.quantity}
                          {item.playerName && (
                            <span className="text-amber-400">
                              {' '}
                              • {item.playerName} #{item.playerNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Delivery Destination
              </span>
              <p className="text-neutral-300">
                {typeof inspectOrder.shippingAddress === 'string'
                  ? inspectOrder.shippingAddress
                  : inspectOrder.shippingAddress?.street1 || inspectOrder.fullAddress || 'Address on file'}{' '}
                • {inspectOrder.district || inspectOrder.shippingAddress?.city || 'Dhaka'},{' '}
                {inspectOrder.division || 'Dhaka'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setInspectOrder(null)}>
                Close
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  setInspectOrder(null);
                  navigate('/admin/orders');
                }}
              >
                Go to Order Management
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </AdminLayout>
  );
};
