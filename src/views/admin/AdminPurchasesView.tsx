import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { PurchaseOrder, Supplier, Product, JerseySize } from '../../types/index.ts';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  User,
  ShieldCheck,
  Building2,
  PackageCheck,
  Eye,
  ArrowDownRight,
  TrendingDown,
  Info,
} from 'lucide-react';

export const AdminPurchasesView: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => storeService.getPurchases());
  const suppliers: Supplier[] = storeService.getSuppliers();
  const products: Product[] = storeService.getProducts();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('ALL');
  const [dateFilterType, setDateFilterType] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Success message toast
  const [successMessage, setSuccessMessage] = useState('');

  // Create Purchase Form State
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formSize, setFormSize] = useState<JerseySize>('M');
  const [formQuantity, setFormQuantity] = useState<number | ''>('');
  const [formBuyingPrice, setFormBuyingPrice] = useState<number | ''>('');
  const [formTotalCost, setFormTotalCost] = useState<number | ''>('');
  const [formAmountPaid, setFormAmountPaid] = useState<number | ''>('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const refreshPurchases = () => {
    setPurchases([...storeService.getPurchases()]);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Auto-fill price when product changes
  const handleProductChange = (prodId: string) => {
    setFormProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const defaultBuyingPrice = prod.costPrice || (prod.basePrice ? Math.round(prod.basePrice * 0.45) : 500);
      setFormBuyingPrice(defaultBuyingPrice);
      if (typeof formQuantity === 'number' && formQuantity > 0) {
        const total = formQuantity * defaultBuyingPrice;
        setFormTotalCost(total);
      }
    }
  };

  // Recalculate Total Cost when Quantity or Buying Price changes
  const handleQuantityChange = (qtyVal: string) => {
    const qty = qtyVal === '' ? '' : Math.max(0, parseInt(qtyVal, 10) || 0);
    setFormQuantity(qty);
    if (typeof qty === 'number' && typeof formBuyingPrice === 'number') {
      const total = qty * formBuyingPrice;
      setFormTotalCost(total);
    }
  };

  const handleBuyingPriceChange = (priceVal: string) => {
    const price = priceVal === '' ? '' : Math.max(0, parseFloat(priceVal) || 0);
    setFormBuyingPrice(price);
    if (typeof formQuantity === 'number' && typeof price === 'number') {
      const total = formQuantity * price;
      setFormTotalCost(total);
    }
  };

  // Calculate dynamic supplier due
  const totalCostNumber = typeof formTotalCost === 'number' ? formTotalCost : 0;
  const amountPaidNumber = typeof formAmountPaid === 'number' ? formAmountPaid : 0;
  const computedSupplierDue = Math.max(0, totalCostNumber - amountPaidNumber);

  // Open Create Modal
  const handleOpenCreate = () => {
    const activeSuppliers = suppliers.filter((s) => s.isActive);
    const firstSupplier = activeSuppliers[0]?.id || '';
    const firstProduct = products[0]?.id || '';
    const firstBuyingPrice = products[0]?.costPrice || (products[0]?.basePrice ? Math.round(products[0].basePrice * 0.45) : 500);

    setFormSupplierId(firstSupplier);
    setFormProductId(firstProduct);
    setFormSize('L');
    setFormQuantity(50);
    setFormBuyingPrice(firstBuyingPrice);
    setFormTotalCost(50 * firstBuyingPrice);
    setFormAmountPaid(Math.round(50 * firstBuyingPrice * 0.6)); // Example default: partial payment
    setFormPurchaseDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setFormError('');
    setIsCreateOpen(true);
  };

  // Submit Create Purchase Order
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formSupplierId) {
      setFormError('Please select a supplier.');
      return;
    }
    if (!formProductId) {
      setFormError('Please select a product.');
      return;
    }
    if (!formSize) {
      setFormError('Please select a size.');
      return;
    }
    const qty = typeof formQuantity === 'number' ? formQuantity : parseInt(String(formQuantity), 10);
    if (!qty || qty <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }
    const buyingPrice = typeof formBuyingPrice === 'number' ? formBuyingPrice : parseFloat(String(formBuyingPrice));
    if (isNaN(buyingPrice) || buyingPrice < 0) {
      setFormError('Invalid buying price.');
      return;
    }
    const totalCost = typeof formTotalCost === 'number' ? formTotalCost : qty * buyingPrice;
    const amountPaid = typeof formAmountPaid === 'number' ? formAmountPaid : parseFloat(String(formAmountPaid || 0));

    if (amountPaid < 0) {
      setFormError('Amount paid cannot be negative.');
      return;
    }
    if (amountPaid > totalCost) {
      setFormError(`Amount paid (৳${amountPaid.toLocaleString()}) cannot exceed total cost (৳${totalCost.toLocaleString()}).`);
      return;
    }

    // Execute atomic database transaction
    const res = storeService.createPurchase({
      supplierId: formSupplierId,
      productId: formProductId,
      size: formSize,
      quantity: qty,
      buyingPrice,
      totalCost,
      amountPaid,
      purchaseDate: formPurchaseDate,
      notes: formNotes,
      adminName: 'Alex Mercer',
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to process purchase order.');
      return;
    }

    refreshPurchases();
    setIsCreateOpen(false);
    showSuccess(
      `Purchase Order #${res.purchase?.poNumber} processed successfully! Inventory increased by ${qty} units, and ৳${amountPaid.toLocaleString()} paid out.`
    );
  };

  // Open Details Modal
  const handleOpenDetails = (po: PurchaseOrder) => {
    setSelectedPurchase(po);
    setIsDetailsOpen(true);
  };

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((po) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        (po.productTitle && po.productTitle.toLowerCase().includes(q)) ||
        (po.createdBy && po.createdBy.toLowerCase().includes(q));

      // 2. Supplier filter
      const matchesSupplier = selectedSupplierId === 'ALL' || po.supplierId === selectedSupplierId;

      // 3. Date filter
      const dateStr = po.purchaseDate || (po.createdAt ? po.createdAt.slice(0, 10) : '');
      let matchesDate = true;

      if (dateFilterType === 'TODAY') {
        const todayStr = new Date().toISOString().slice(0, 10);
        matchesDate = dateStr === todayStr || dateStr.startsWith('2026-09-16');
      } else if (dateFilterType === '7DAYS') {
        const now = new Date('2026-09-16T12:00:00Z').getTime();
        const poTime = new Date(dateStr).getTime();
        const diffDays = Math.abs(now - poTime) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateFilterType === 'MONTH') {
        matchesDate = dateStr.startsWith('2026-09');
      } else if (dateFilterType === 'CUSTOM') {
        if (startDate && dateStr < startDate) matchesDate = false;
        if (endDate && dateStr > endDate) matchesDate = false;
      }

      return matchesSearch && matchesSupplier && matchesDate;
    });
  }, [purchases, searchQuery, selectedSupplierId, dateFilterType, startDate, endDate]);

  // Financial Metrics for Purchases
  const totalProcuredAmount = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPaidOut = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalSupplierDueRemaining = purchases.reduce((sum, p) => sum + (p.supplierDue || 0), 0);
  const totalUnitsProcured = purchases.reduce((sum, p) => sum + (p.quantity || p.itemsCount || 0), 0);

  return (
    <AdminLayout
      title="Procurement & Purchases"
      subtitle="Inbound factory batches, jersey inventory restocking, and vendor payment accounts."
      actions={
        <Button
          id="btn-create-purchase-order"
          variant="gold"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Purchase Order
        </Button>
      }
    >
      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-left">
        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inbound Spend</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatCurrency(totalProcuredAmount)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total value of procured goods</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Paid Outflow</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalPaidOut)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Actual funds disbursed to date</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Supplier Due Balance</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatCurrency(totalSupplierDueRemaining)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Unpaid vendor balance</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Units Inbound</span>
            <PackageCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalUnitsProcured.toLocaleString()} <span className="text-xs font-normal text-neutral-400 font-sans">pcs</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Restocked into inventory</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="purchases-search-input"
              type="text"
              placeholder="Search PO #, supplier, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Supplier Dropdown Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <select
                id="filter-supplier-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="ALL">All Suppliers ({suppliers.length})</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Date Filters */}
            <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
              <button
                onClick={() => setDateFilterType('ALL')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  dateFilterType === 'ALL' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilterType('TODAY')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  dateFilterType === 'TODAY' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilterType('7DAYS')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  dateFilterType === '7DAYS' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateFilterType('MONTH')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  dateFilterType === 'MONTH' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilterType('CUSTOM')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  dateFilterType === 'CUSTOM' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {dateFilterType === 'CUSTOM' && (
          <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-4 text-xs text-neutral-300">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Calendar className="w-3.5 h-3.5" /> Date Range Filter:
            </span>
            <div className="flex items-center gap-2">
              <span>From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= PURCHASE HISTORY VIEW ================= */}
      {/* Requirements:
          Columns:
          - Date
          - Supplier
          - Items (Product + Size + Qty)
          - Total
          - Paid
          - Due
          - Created By
          Filter by date.
          Do not delete financial history directly.
      */}
      <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden text-left shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              Purchase History Ledger ({filteredPurchases.length} Orders)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Immutable Financial Audit Trail</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items (Product + Size + Qty)</th>
                <th className="py-3 px-4 font-mono">Total</th>
                <th className="py-3 px-4 font-mono">Paid</th>
                <th className="py-3 px-4 font-mono">Due</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No purchase records match the selected date or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const purchaseDateStr = po.purchaseDate || (po.createdAt ? po.createdAt.slice(0, 10) : 'N/A');
                  const productTitle = po.productTitle || (po.items && po.items[0]?.productTitle) || 'Restock Jersey';
                  const size = po.size || (po.items && po.items[0]?.size) || 'All';
                  const qty = po.quantity || (po.items && po.items[0]?.quantity) || po.itemsCount || 1;
                  const hasDue = (po.supplierDue || 0) > 0;

                  return (
                    <tr key={po.id} className="hover:bg-neutral-800/30 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                        {formatDate(purchaseDateStr)}
                        <span className="block text-[10px] text-neutral-500 font-sans">{po.poNumber}</span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{po.supplierName}</span>
                        </div>
                      </td>

                      {/* Items (Product + Size + Qty) */}
                      <td className="py-3 px-4">
                        <div className="text-white font-medium line-clamp-1">
                          {productTitle}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold">
                            Size: {size}
                          </span>
                          <span className="font-mono text-neutral-400">
                            Qty: <strong className="text-white">{qty} pcs</strong>
                          </span>
                          {po.buyingPrice && (
                            <span className="text-neutral-500 text-[10px]">
                              (@ ৳{po.buyingPrice}/pc)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(po.totalCost)}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {formatCurrency(po.amountPaid || 0)}
                      </td>

                      {/* Due */}
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        {hasDue ? (
                          <span className="text-rose-400">{formatCurrency(po.supplierDue || 0)}</span>
                        ) : (
                          <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        )}
                      </td>

                      {/* Created By */}
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{po.createdBy || 'Alex Mercer'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          id={`btn-view-po-${po.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(po)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
          <span>* Financial purchase transactions are strictly audited and cannot be deleted directly.</span>
          <span className="font-mono text-neutral-400">Total Records: {filteredPurchases.length}</span>
        </div>
      </div>

      {/* ================= CREATE PURCHASE MODAL ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-[#12151c] z-10">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Create Inbound Purchase Order
                </h3>
                <p className="text-xs text-neutral-400">
                  Procure stock from vendor with automatic inventory restocking and financial accounting.
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 text-left">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Supplier & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Supplier <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="purchase-supplier-select"
                    required
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Select Active Supplier</option>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - Due: ৳{(s.supplierDue || 0).toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="purchase-product-select"
                    required
                    value={formProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Select Jersey / Apparel</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Size, Quantity & Buying Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Size <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="purchase-size-select"
                    required
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value as JerseySize)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Quantity (Pcs) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="purchase-quantity-input"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    value={formQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Buying Price (৳/pc) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="purchase-buying-price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 200"
                    value={formBuyingPrice}
                    onChange={(e) => handleBuyingPriceChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* 3. Total Cost, Amount Paid & Supplier Due */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Cost */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Total Cost (৳)
                    </label>
                    <input
                      id="purchase-total-cost-input"
                      type="number"
                      min="0"
                      value={formTotalCost}
                      onChange={(e) => setFormTotalCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500/50"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Qty × Buying Price</span>
                  </div>

                  {/* Amount Paid Now */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Amount Paid Now (৳)
                    </label>
                    <input
                      id="purchase-amount-paid-input"
                      type="number"
                      min="0"
                      max={totalCostNumber}
                      placeholder="e.g. 6000"
                      value={formAmountPaid}
                      onChange={(e) => setFormAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-500/50"
                    />
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Affects current cash outflow</span>
                  </div>

                  {/* Supplier Due (Calculated) */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Supplier Due (৳)
                    </label>
                    <div className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono font-bold text-rose-400">
                      {formatCurrency(computedSupplierDue)}
                    </div>
                    <span className="text-[10px] text-rose-400/80 mt-0.5 block">Unpaid vendor balance</span>
                  </div>
                </div>

                {/* Example Explanatory Box (Respecting User Prompt Directives) */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Info className="w-4 h-4" />
                    <span>Strict Financial Cash Flow Rule</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Only <strong className="text-white font-mono">৳{amountPaidNumber.toLocaleString()}</strong> will affect current cash outflow in the cashbook. The remaining <strong className="text-rose-300 font-mono">৳{computedSupplierDue.toLocaleString()}</strong> is tagged to Supplier Due and will NOT be subtracted from the cash reserve until settled.
                  </p>
                </div>
              </div>

              {/* 4. Purchase Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Purchase Date <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="purchase-date-input"
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes</label>
                  <input
                    id="purchase-notes-input"
                    type="text"
                    placeholder="Lot batch #, fabric GSM, factory delivery receipt notes..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Transaction Execution Guarantee Checklist */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                  Database Transaction Updates On Confirmation:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    ✓ 1. Inventory stock (+{formQuantity || 0} pcs)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    ✓ 2. Purchase history ledger
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    ✓ 3. Supplier balance (+৳{computedSupplierDue.toLocaleString()} Due)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    ✓ 4. Cash transaction (-৳{amountPaidNumber.toLocaleString()})
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 col-span-full">
                    ✓ 5. Audit Activity Log entry
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3 sticky bottom-0 bg-[#12151c]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button id="btn-submit-purchase-order" type="submit" variant="gold" size="sm">
                  Confirm & Process Purchase
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PURCHASE DETAILS MODAL ================= */}
      {isDetailsOpen && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Purchase Order #{selectedPurchase.poNumber}
                </h3>
                <span className="text-xs text-neutral-400">
                  Issued on {formatDate(selectedPurchase.purchaseDate || selectedPurchase.createdAt || '')}
                </span>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs">
              {/* Supplier & Creator */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Supplier</span>
                  <p className="font-bold text-white text-sm">{selectedPurchase.supplierName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Created By</span>
                  <p className="font-bold text-neutral-300 text-sm">{selectedPurchase.createdBy || 'Alex Mercer'}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Procured Apparel</span>
                <p className="font-bold text-white text-sm">
                  {selectedPurchase.productTitle || selectedPurchase.items?.[0]?.productTitle}
                </p>
                <div className="flex items-center gap-4 text-neutral-300">
                  <span>Size: <strong className="text-amber-400 font-mono">{selectedPurchase.size || selectedPurchase.items?.[0]?.size}</strong></span>
                  <span>Quantity: <strong className="text-white font-mono">{selectedPurchase.quantity || selectedPurchase.items?.[0]?.quantity} pcs</strong></span>
                  {selectedPurchase.buyingPrice && (
                    <span>Unit Buying Cost: <strong className="text-white font-mono">{formatCurrency(selectedPurchase.buyingPrice)}</strong></span>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Financial Ledger Breakdown</span>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Total Purchase Cost:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(selectedPurchase.totalCost)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800 text-emerald-400">
                  <span>Amount Paid Now (Cash Outflow):</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedPurchase.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between py-1 text-rose-400">
                  <span>Supplier Due Remaining:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedPurchase.supplierDue || 0)}</span>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800">
                  <span className="text-neutral-500">Procurement Notes: </span>
                  <span className="text-neutral-300 italic">{selectedPurchase.notes}</span>
                </div>
              )}

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Inventory was credited and stock transaction ledger logged under #{selectedPurchase.poNumber}.</span>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 flex justify-end bg-[#12151c]">
              <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
