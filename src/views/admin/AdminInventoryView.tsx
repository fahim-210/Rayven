import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  ArrowRight,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  History,
  Tag,
} from 'lucide-react';
import {
  InventoryItem,
  InventoryTransaction,
  StockFlowType,
  JerseySize,
  ReturnRequest,
} from '../../types/index.ts';

const SIZES_ORDER: JerseySize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const AdminInventoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'TRANSACTIONS'>('MATRIX');
  const [items, setItems] = useState<InventoryItem[]>(() => storeService.getInventory());
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() =>
    storeService.getInventoryTransactions()
  );
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>(() => storeService.getReturns());

  // Search and Filters
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Stock Flow Modal State
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [selectedItemForFlow, setSelectedItemForFlow] = useState<InventoryItem | null>(null);
  const [flowType, setFlowType] = useState<StockFlowType>('PURCHASE');
  const [flowQuantity, setFlowQuantity] = useState('10');
  const [flowReason, setFlowReason] = useState('Direct warehouse factory batch intake');
  const [flowReference, setFlowReference] = useState('PO-2026-904');
  const [flowAdmin, setFlowAdmin] = useState('Alex Mercer (Inventory Lead)');
  const [flowError, setFlowError] = useState<string | null>(null);

  // Return Processing Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [returnDecision, setReturnDecision] = useState<'AVAILABLE' | 'DAMAGED'>('AVAILABLE');
  const [returnNotes, setReturnNotes] = useState('Passed return quality inspection and returned to available stock');

  // Refresh helper
  const refreshData = () => {
    setItems([...storeService.getInventory()]);
    setTransactions([...storeService.getInventoryTransactions()]);
    setReturnsList([...storeService.getReturns()]);
  };

  // Stock aggregates calculation
  const stats = useMemo(() => {
    let totalAvailable = 0;
    let totalReserved = 0;
    let totalSold = 0;
    let totalReturned = 0;
    let totalDamaged = 0;
    let totalLost = 0;
    let currentStockCost = 0; // Available * buying cost
    let potentialSalesValue = 0; // Available * selling price

    items.forEach((item) => {
      const avail = item.available ?? item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0));
      const res = item.reserved ?? item.reservedStock ?? 0;
      const sld = item.sold ?? 0;
      const ret = item.returned ?? 0;
      const dmg = item.damaged ?? 0;
      const lst = item.lost ?? 0;
      const cost = item.costPerUnit || 500;
      const price = item.sellingPrice || 950;

      totalAvailable += avail;
      totalReserved += res;
      totalSold += sld;
      totalReturned += ret;
      totalDamaged += dmg;
      totalLost += lst;

      currentStockCost += avail * cost;
      potentialSalesValue += avail * price;
    });

    return {
      totalAvailable,
      totalReserved,
      totalSold,
      totalReturned,
      totalDamaged,
      totalLost,
      currentStockCost,
      potentialSalesValue,
    };
  }, [items]);

  // Filtered inventory rows
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase()) ||
        item.variantSku?.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouseLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesSize = sizeFilter === 'ALL' || item.size === sizeFilter;

      const avail = item.available ?? item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0));
      const res = item.reserved ?? item.reservedStock ?? 0;
      const dmg = item.damaged ?? 0;

      let matchesStatus = true;
      if (statusFilter === 'LOW_STOCK') {
        matchesStatus = avail > 0 && avail <= (item.safetyStock || 10);
      } else if (statusFilter === 'OUT_OF_STOCK') {
        matchesStatus = avail <= 0;
      } else if (statusFilter === 'RESERVED') {
        matchesStatus = res > 0;
      } else if (statusFilter === 'DAMAGED') {
        matchesStatus = dmg > 0;
      }

      return matchesSearch && matchesSize && matchesStatus;
    });
  }, [items, search, sizeFilter, statusFilter]);

  // Filtered transactions for audit ledger
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchesSearch =
        trx.productTitle?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        trx.variantSku?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        trx.reference?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        trx.reason?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        trx.admin?.toLowerCase().includes(transactionSearch.toLowerCase());

      const matchesType = transactionTypeFilter === 'ALL' || trx.type === transactionTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, transactionSearch, transactionTypeFilter]);

  // Open Stock Flow Modal for an Item
  const handleOpenStockFlow = (item: InventoryItem, initialType: StockFlowType = 'PURCHASE') => {
    setSelectedItemForFlow(item);
    setFlowType(initialType);
    setFlowQuantity('10');
    setFlowError(null);
    if (initialType === 'PURCHASE') {
      setFlowReason('Factory supplier batch receipt & quality clearance');
      setFlowReference(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
    } else if (initialType === 'DAMAGE') {
      setFlowReason('Transit seam tear detected; moved to damaged quarantine');
      setFlowReference(`DMG-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (initialType === 'LOST') {
      setFlowReason('Quarterly bin audit count discrepancy; shrinkage written off');
      setFlowReference(`SHRINK-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setFlowReason('Standard inventory stock adjustment');
      setFlowReference(`ADJ-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    setIsFlowModalOpen(true);
  };

  // Submit Stock Flow
  const handleSubmitStockFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForFlow) return;

    setFlowError(null);
    const qty = parseInt(flowQuantity, 10);

    if (isNaN(qty) || qty <= 0) {
      setFlowError('Quantity must be a positive number greater than 0.');
      return;
    }

    if (!flowReason.trim()) {
      setFlowError('Reason is required. Silent stock modifications are strictly prohibited.');
      return;
    }

    if (!flowReference.trim()) {
      setFlowError('Reference code is required for audit tracking.');
      return;
    }

    const result = storeService.recordStockFlow({
      productId: selectedItemForFlow.productId,
      variantSku: selectedItemForFlow.variantSku,
      size: selectedItemForFlow.size,
      type: flowType,
      quantity: qty,
      reason: flowReason,
      reference: flowReference,
      admin: flowAdmin,
    });

    if (!result.success) {
      setFlowError(result.error || 'Failed to apply stock flow.');
      return;
    }

    refreshData();
    setIsFlowModalOpen(false);
  };

  // Handle Process Return Submit
  const handleOpenReturnModal = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setReturnDecision('AVAILABLE');
    setReturnNotes('Customer returned intact match jersey; restocked to Available after QC pass');
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturnDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    const result = storeService.processReturnStockDecision({
      returnId: selectedReturn.id,
      decision: returnDecision,
      adminName: 'Alex Mercer (QC Admin)',
      notes: returnNotes,
    });

    if (result.success) {
      refreshData();
      setIsReturnModalOpen(false);
      setSelectedReturn(null);
    } else {
      alert(result.error || 'Error processing return');
    }
  };

  return (
    <AdminLayout
      title="Size-Aware Inventory Management"
      subtitle="Full lifecycle stock control: Available, Reserved, Sold, Returned, Damaged, and Lost with audit logging."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'MATRIX' ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('MATRIX')}
            leftIcon={<Boxes className="w-3.5 h-3.5" />}
            id="tab-size-aware-matrix"
          >
            Size-Aware Matrix
          </Button>
          <Button
            variant={activeTab === 'TRANSACTIONS' ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('TRANSACTIONS')}
            leftIcon={<History className="w-3.5 h-3.5" />}
            id="tab-audit-ledger"
          >
            Inventory Transactions ({transactions.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (items[0]) handleOpenStockFlow(items[0], 'PURCHASE');
            }}
            leftIcon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
            id="btn-quick-inflow"
          >
            Record Stock Flow
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-left">
        {/* ========================================================================= */}
        {/* SECTION 1: COMPREHENSIVE STOCK BUCKETS & FINANCIAL VALUATION              */}
        {/* Exact rule: Current stock value uses buying cost, not selling price.     */}
        {/* Example: 10 pieces × buying price ৳500 = Current Stock Cost ৳5,000         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Available */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Available
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">
              {stats.totalAvailable.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Ready for instant order</span>
          </div>

          {/* Reserved */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Reserved
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">
              {stats.totalReserved.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Allocated in pending orders</span>
          </div>

          {/* Sold */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-blue-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-400" /> Sold
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">
              {stats.totalSold.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Delivered to customers</span>
          </div>

          {/* Returned */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-indigo-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-indigo-400" /> Returned
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">
              {stats.totalReturned.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Logged RMA returns</span>
          </div>

          {/* Damaged */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-rose-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Damaged
            </span>
            <p className="text-xl font-black text-rose-300 font-mono mt-1">
              {stats.totalDamaged.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Quarantined defects</span>
          </div>

          {/* Lost */}
          <div className="bg-[#12151c] p-3.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-neutral-400" /> Lost
            </span>
            <p className="text-xl font-black text-neutral-300 font-mono mt-1">
              {stats.totalLost.toLocaleString()}{' '}
              <span className="text-xs font-normal text-neutral-400">pcs</span>
            </p>
            <span className="text-[10px] text-neutral-400">Written off shrinkage</span>
          </div>
        </div>

        {/* Financial Valuation Banner (Buying Cost vs Potential Sales) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#12151c] p-4 rounded-xl border border-amber-500/40 relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Current Stock Cost (Buying Value)
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {formatCurrency(stats.currentStockCost)}
              </p>
              <p className="text-[11px] text-amber-300/80">
                Rule: Available pieces × buying price (e.g. 10 pcs × ৳500 = ৳5,000)
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs font-mono text-neutral-400 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              <span>{stats.totalAvailable} pieces in stock</span>
              <p className="text-[10px] text-amber-400/80">Cost basis only</p>
            </div>
          </div>

          <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Potential Sales Value
              </span>
              <p className="text-2xl font-black text-purple-300 font-mono">
                {formatCurrency(stats.potentialSalesValue)}
              </p>
              <p className="text-[11px] text-neutral-400">
                Available pieces × selling price (Kept strictly separate from stock cost)
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs font-mono text-neutral-400 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              <span className="text-emerald-400 font-bold">
                +{formatCurrency(stats.potentialSalesValue - stats.currentStockCost)}
              </span>
              <p className="text-[10px] text-neutral-400">Potential Gross Margin</p>
            </div>
          </div>
        </div>

        {/* Pending Returns Banner if any need QC decision */}
        {returnsList.some((r) => r.status === 'REQUESTED' || r.status === 'INSPECTED') && (
          <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pending Customer Returns (RMA Decision)</h4>
                <p className="text-xs text-neutral-300">
                  Admin must decide for returned kits: <strong>Return to Available</strong> OR <strong>Mark as Damaged</strong>.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20"
              onClick={() => {
                const pending = returnsList.find((r) => r.status === 'REQUESTED' || r.status === 'INSPECTED');
                if (pending) handleOpenReturnModal(pending);
              }}
              id="btn-process-returns"
            >
              Process RMA Decision
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SIZE-AWARE STOCK MATRIX                                           */}
        {/* Every product + size: Available, Reserved, Sold, Returned, Damaged, Lost  */}
        {/* ========================================================================= */}
        {activeTab === 'MATRIX' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[240px] max-w-md">
                <Input
                  isSearch
                  placeholder="Search by jersey title, variant SKU, bin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  id="input-inventory-search"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Size Filter */}
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                  id="select-inventory-size-filter"
                >
                  <option value="ALL">All Sizes</option>
                  {SIZES_ORDER.map((s) => (
                    <option key={s} value={s}>
                      Size {s}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                  id="select-inventory-status-filter"
                >
                  <option value="ALL">All Health States</option>
                  <option value="LOW_STOCK">Low Stock (≤ 10 pcs)</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0 pcs)</option>
                  <option value="RESERVED">Has Reserved Stock</option>
                  <option value="DAMAGED">Has Damaged Stock</option>
                </select>

                <span className="text-xs text-neutral-400 font-mono pl-2">
                  Showing {filteredItems.length} size-aware items
                </span>
              </div>
            </div>

            {/* Size-Aware Inventory Table */}
            <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden shadow-sm" id="table-size-aware-inventory">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-4">Product & Size</th>
                      <th className="py-3.5 px-3">Variant SKU</th>
                      <th className="py-3.5 px-3">Cost / Unit</th>
                      <th className="py-3.5 px-3 text-center bg-emerald-500/5 text-emerald-400 border-l border-r border-neutral-800">
                        Available
                      </th>
                      <th className="py-3.5 px-3 text-center text-amber-400">Reserved</th>
                      <th className="py-3.5 px-3 text-center text-blue-400">Sold</th>
                      <th className="py-3.5 px-3 text-center text-indigo-400">Returned</th>
                      <th className="py-3.5 px-3 text-center text-rose-400">Damaged</th>
                      <th className="py-3.5 px-3 text-center text-neutral-400">Lost</th>
                      <th className="py-3.5 px-3">Stock Value</th>
                      <th className="py-3.5 px-4 text-right">Stock Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-neutral-400">
                          <Boxes className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                          No inventory items match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const avail =
                          item.available ??
                          item.availableQuantity ??
                          (item.currentStock - (item.reservedStock || 0));
                        const res = item.reserved ?? item.reservedStock ?? 0;
                        const sld = item.sold ?? 0;
                        const ret = item.returned ?? 0;
                        const dmg = item.damaged ?? 0;
                        const lst = item.lost ?? 0;
                        const cost = item.costPerUnit || 500;
                        // Stock value uses buying cost strictly:
                        const stockCostVal = avail * cost;

                        return (
                          <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                            {/* Product & Size */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded bg-neutral-900 border border-neutral-700 font-mono font-bold text-amber-400 text-xs flex items-center justify-center shrink-0">
                                  {item.size}
                                </span>
                                <div>
                                  <p className="font-bold text-white leading-tight">
                                    {item.productTitle || 'Match Jersey'}
                                  </p>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    {item.warehouseLocation || 'Bin Main Warehouse'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-3 font-mono text-neutral-400 text-[11px]">
                              {item.variantSku || item.sku}
                            </td>

                            {/* Cost Per Unit */}
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {formatCurrency(cost)}
                            </td>

                            {/* 1. AVAILABLE */}
                            <td className="py-3 px-3 text-center bg-emerald-500/5 border-l border-r border-neutral-800 font-mono">
                              <span
                                className={`inline-block px-2.5 py-1 rounded font-bold text-xs ${
                                  avail === 0
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : avail <= (item.safetyStock || 10)
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {avail}
                              </span>
                            </td>

                            {/* 2. RESERVED */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  res > 0
                                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {res}
                              </span>
                            </td>

                            {/* 3. SOLD */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  sld > 0
                                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {sld}
                              </span>
                            </td>

                            {/* 4. RETURNED */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  ret > 0
                                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {ret}
                              </span>
                            </td>

                            {/* 5. DAMAGED */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  dmg > 0
                                    ? 'bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {dmg}
                              </span>
                            </td>

                            {/* 6. LOST */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  lst > 0
                                    ? 'bg-neutral-800 text-neutral-300 font-bold'
                                    : 'text-neutral-600'
                                }`}
                              >
                                {lst}
                              </span>
                            </td>

                            {/* Stock Value (Buying Cost * Available) */}
                            <td className="py-3 px-3 font-mono">
                              <span className="font-bold text-amber-300">
                                {formatCurrency(stockCostVal)}
                              </span>
                            </td>

                            {/* Stock Flow Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenStockFlow(item, 'PURCHASE')}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                                  title="Purchase Inflow: Available increases"
                                  id={`btn-inflow-${item.id}`}
                                >
                                  + Inflow
                                </button>
                                <button
                                  onClick={() => handleOpenStockFlow(item, 'DAMAGE')}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                  title="Mark as Damaged / Defective"
                                  id={`btn-damage-${item.id}`}
                                >
                                  Damage
                                </button>
                                <button
                                  onClick={() => handleOpenStockFlow(item, 'LOST')}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                                  title="Mark as Lost / Shrinkage"
                                  id={`btn-lost-${item.id}`}
                                >
                                  Lost
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INVENTORY TRANSACTIONS (AUDIT LEDGER)                             */}
        {/* Every stock change must create an InventoryTransaction:                   */}
        {/* product, size, quantity, previous quantity/status, new quantity/status,   */}
        {/* reason, admin, timestamp, reference                                       */}
        {/* ========================================================================= */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-4">
            <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[240px] max-w-md">
                <Input
                  isSearch
                  placeholder="Search transaction reason, reference, admin, SKU..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  onClear={() => setTransactionSearch('')}
                  id="input-trx-search"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                  id="select-trx-type-filter"
                >
                  <option value="ALL">All Stock Flow Types</option>
                  <option value="PURCHASE">PURCHASE (Inflow)</option>
                  <option value="ORDER_RESERVED">ORDER_RESERVED (Checkout)</option>
                  <option value="ORDER_DELIVERED">ORDER_DELIVERED (Sold)</option>
                  <option value="ORDER_CANCELLED">ORDER_CANCELLED (Restocked)</option>
                  <option value="RETURN_TO_AVAILABLE">RETURN_TO_AVAILABLE (RMA)</option>
                  <option value="RETURN_TO_DAMAGED">RETURN_TO_DAMAGED (RMA Defect)</option>
                  <option value="DAMAGE">DAMAGE (Quarantine)</option>
                  <option value="LOST">LOST (Shrinkage)</option>
                  <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT</option>
                </select>

                <span className="text-xs text-neutral-400 font-mono">
                  Showing {filteredTransactions.length} of {transactions.length} entries
                </span>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden shadow-sm" id="table-inventory-transactions">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp & Ref</th>
                      <th className="py-3.5 px-4">Product & Size</th>
                      <th className="py-3.5 px-3">Flow Type</th>
                      <th className="py-3.5 px-3 text-center">Qty</th>
                      <th className="py-3.5 px-4">Previous State → New State</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4 text-right">Authorized Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          <History className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                          No stock movement transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((trx) => {
                        const isPositive =
                          trx.type === 'PURCHASE' ||
                          trx.type === 'ORDER_CANCELLED' ||
                          trx.type === 'RETURN_TO_AVAILABLE';

                        return (
                          <tr key={trx.id} className="hover:bg-neutral-800/30 transition-colors">
                            {/* Timestamp & Reference */}
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-white block">
                                {trx.reference || 'REF-N/A'}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {new Date(trx.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* Product & Size */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-neutral-900 border border-neutral-700 font-mono font-bold text-amber-400 text-xs flex items-center justify-center shrink-0">
                                  {trx.size}
                                </span>
                                <div>
                                  <p className="font-bold text-white leading-tight">
                                    {trx.productTitle}
                                  </p>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    {trx.variantSku}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Flow Type Badge */}
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  trx.type === 'PURCHASE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : trx.type === 'ORDER_RESERVED'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : trx.type === 'ORDER_DELIVERED'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                    : trx.type === 'ORDER_CANCELLED'
                                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                                    : trx.type === 'RETURN_TO_AVAILABLE'
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                    : trx.type === 'RETURN_TO_DAMAGED' || trx.type === 'DAMAGE'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                    : 'bg-neutral-800 text-neutral-300'
                                }`}
                              >
                                {trx.type}
                              </span>
                            </td>

                            {/* Qty */}
                            <td className="py-3 px-3 text-center font-mono font-bold">
                              <span className={isPositive ? 'text-emerald-400' : 'text-neutral-200'}>
                                {isPositive ? `+${trx.quantity}` : `${trx.quantity}`}
                              </span>
                            </td>

                            {/* Previous State → New State */}
                            <td className="py-3 px-4 font-mono text-[11px]">
                              <div className="flex items-center gap-2">
                                <div className="text-neutral-400">
                                  <span>Avail: {trx.previousQuantity.available}</span> •{' '}
                                  <span>Res: {trx.previousQuantity.reserved}</span> •{' '}
                                  <span>Sold: {trx.previousQuantity.sold}</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                                <div className="text-white font-semibold">
                                  <span className="text-emerald-300">
                                    Avail: {trx.newQuantity.available}
                                  </span>{' '}
                                  •{' '}
                                  <span className="text-amber-300">
                                    Res: {trx.newQuantity.reserved}
                                  </span>{' '}
                                  • <span className="text-blue-300">Sold: {trx.newQuantity.sold}</span>
                                </div>
                              </div>
                            </td>

                            {/* Reason */}
                            <td className="py-3 px-4 text-neutral-300 max-w-xs">
                              <p className="line-clamp-2 text-xs">{trx.reason}</p>
                            </td>

                            {/* Admin */}
                            <td className="py-3 px-4 text-right text-neutral-400 font-mono text-[11px]">
                              {trx.admin}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: RECORD STOCK MOVEMENT / FLOW                                     */}
        {/* Strictly enforces: reason required, reference required, no negative stock */}
        {/* ========================================================================= */}
        <Dialog
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          title="Record Stock Flow Movement"
          size="md"
        >
          {selectedItemForFlow && (
            <form onSubmit={handleSubmitStockFlow} className="space-y-4 text-left" id="form-stock-flow">
              {/* Product Header */}
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded bg-neutral-950 border border-neutral-700 font-mono font-bold text-amber-400 text-sm flex items-center justify-center">
                    {selectedItemForFlow.size}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">{selectedItemForFlow.productTitle}</h5>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      SKU: {selectedItemForFlow.variantSku}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-neutral-400">Available:</span>
                  <p className="text-emerald-400 font-bold text-sm">
                    {selectedItemForFlow.available ?? selectedItemForFlow.availableQuantity ?? 0} pcs
                  </p>
                </div>
              </div>

              {/* Error Message if negative stock or missing fields */}
              {flowError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{flowError}</span>
                </div>
              )}

              {/* Flow Type Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Stock Flow Lifecycle Operation *
                </label>
                <select
                  value={flowType}
                  onChange={(e) => setFlowType(e.target.value as StockFlowType)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400 font-mono"
                  id="select-stock-flow-type"
                >
                  <option value="PURCHASE">PURCHASE (Available increases from Supplier PO)</option>
                  <option value="DAMAGE">DAMAGE (Available decreases, Damaged increases)</option>
                  <option value="LOST">LOST (Available decreases, Lost increases)</option>
                  <option value="ORDER_DELIVERED">DELIVERY (Reserved decreases, Sold increases)</option>
                  <option value="ORDER_CANCELLED">CANCELLATION (Reserved returns to Available)</option>
                  <option value="MANUAL_ADJUSTMENT">MANUAL RECOUNT ADJUSTMENT</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Quantity (Pieces) *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={flowQuantity}
                  onChange={(e) => setFlowQuantity(e.target.value)}
                  placeholder="e.g. 10"
                  required
                  id="input-flow-quantity"
                />
              </div>

              {/* Reference Code (Required) */}
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Reference Code (PO#, RMA#, Order#, ADJ#) *
                </label>
                <Input
                  value={flowReference}
                  onChange={(e) => setFlowReference(e.target.value)}
                  placeholder="e.g. PO-2026-904"
                  required
                  id="input-flow-reference"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Mandatory audit key. Cannot be empty.
                </p>
              </div>

              {/* Reason (Required) */}
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Audit Reason (Silent modification is prohibited) *
                </label>
                <textarea
                  rows={2}
                  value={flowReason}
                  onChange={(e) => setFlowReason(e.target.value)}
                  placeholder="Explain why stock is being modified..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                  id="textarea-flow-reason"
                />
              </div>

              {/* Admin Sign-Off */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Authorized Admin Officer
                </label>
                <Input
                  value={flowAdmin}
                  onChange={(e) => setFlowAdmin(e.target.value)}
                  id="input-flow-admin"
                />
              </div>

              {/* Dialog Actions */}
              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsFlowModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" id="btn-submit-stock-flow">
                  Apply & Record Transaction
                </Button>
              </div>
            </form>
          )}
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: RMA RETURN QC DECISION                                           */}
        {/* Rule: Return -> Admin decides: Return to Available OR Mark as Damaged     */}
        {/* ========================================================================= */}
        <Dialog
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          title="Process RMA Return Stock Decision"
          size="md"
        >
          {selectedReturn && (
            <form onSubmit={handleSubmitReturnDecision} className="space-y-4 text-left" id="form-return-decision">
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {selectedReturn.returnNumber}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Order: {selectedReturn.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-white">Customer: {selectedReturn.customerName}</p>
                <p className="text-[11px] text-neutral-400">Reason: {selectedReturn.reason}</p>
              </div>

              {/* Admin Decision Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                  Admin QC Destination Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      returnDecision === 'AVAILABLE'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-400">Return to Available</span>
                      <input
                        type="radio"
                        name="returnDecision"
                        checked={returnDecision === 'AVAILABLE'}
                        onChange={() => {
                          setReturnDecision('AVAILABLE');
                          setReturnNotes('Item passed QC and restocked into active Available pool');
                        }}
                        className="text-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-300">
                      Jersey is intact, unworn, tags attached. +1 to Available stock.
                    </p>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      returnDecision === 'DAMAGED'
                        ? 'bg-rose-500/10 border-rose-500 text-white ring-1 ring-rose-500/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-400">Mark as Damaged</span>
                      <input
                        type="radio"
                        name="returnDecision"
                        checked={returnDecision === 'DAMAGED'}
                        onChange={() => {
                          setReturnDecision('DAMAGED');
                          setReturnNotes('Item is damaged / stained / torn; quarantined into Damaged pool');
                        }}
                        className="text-rose-500"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-300">
                      Defective or worn. Quarantined into Damaged stock.
                    </p>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  QC Inspection Notes & Reason
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsReturnModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" id="btn-confirm-return-decision">
                  Confirm & Update Stock
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
};
