import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { Supplier, PurchaseOrder } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Power,
  Eye,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Calendar,
  X,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from '../../router/RouterContext.tsx';

export const AdminSuppliersView: React.FC = () => {
  const { navigate } = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storeService.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [dueOnly, setDueOnly] = useState(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    email: '',
    country: 'Bangladesh',
    paymentTerms: 'Net 30 Days',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Settle Due Form State
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  const refreshData = () => {
    setSuppliers([...storeService.getSuppliers()]);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Metrics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.isActive).length;
  const totalSupplierDue = suppliers.reduce((sum, s) => sum + (s.supplierDue || 0), 0);
  const totalProcurementSpend = suppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);
  const totalSettled = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);

  // Filtered List
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && s.isActive) ||
      (statusFilter === 'INACTIVE' && !s.isActive);

    const matchesDue = !dueOnly || (s.supplierDue || 0) > 0;

    return matchesQuery && matchesStatus && matchesDue;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      notes: '',
      email: '',
      country: 'Bangladesh',
      paymentTerms: 'Net 30 Days',
    });
    setFormError('');
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setFormData({
      name: sup.name,
      phone: sup.phone || '',
      address: sup.address || '',
      notes: sup.notes || '',
      email: sup.email || '',
      country: sup.country || 'Bangladesh',
      paymentTerms: sup.paymentTerms || 'Net 30 Days',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  // Open View Modal
  const handleOpenView = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setIsViewOpen(true);
  };

  // Open Pay Due Modal
  const handleOpenPay = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setPayAmount(String(sup.supplierDue || ''));
    setPayNotes('');
    setPayError('');
    setIsPayOpen(true);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Supplier Name is required.');
      return;
    }

    const res = storeService.addSupplier({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      email: formData.email,
      country: formData.country,
      paymentTerms: formData.paymentTerms,
      adminName: 'Alex Mercer',
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to add supplier.');
      return;
    }

    refreshData();
    setIsAddOpen(false);
    showSuccess(`Supplier "${formData.name}" successfully registered.`);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (!formData.name.trim()) {
      setFormError('Supplier Name is required.');
      return;
    }

    const res = storeService.updateSupplier(selectedSupplier.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      email: formData.email,
      country: formData.country,
      paymentTerms: formData.paymentTerms,
      adminName: 'Alex Mercer',
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to update supplier.');
      return;
    }

    refreshData();
    setIsEditOpen(false);
    showSuccess(`Supplier "${formData.name}" updated successfully.`);
  };

  // Handle Deactivate / Activate
  const handleToggleActive = (sup: Supplier) => {
    const action = sup.isActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} supplier "${sup.name}"?`)) {
      const res = storeService.deactivateSupplier(sup.id, 'Alex Mercer');
      if (res.success) {
        refreshData();
        showSuccess(`Supplier "${sup.name}" is now ${res.supplier?.isActive ? 'Active' : 'Deactivated'}.`);
      }
    }
  };

  // Handle Record Payment
  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      setPayError('Please enter a valid payment amount greater than ৳0.');
      return;
    }
    if (amt > (selectedSupplier.supplierDue || 0)) {
      setPayError(`Payment cannot exceed outstanding due of ৳${(selectedSupplier.supplierDue || 0).toLocaleString()}.`);
      return;
    }

    const res = storeService.recordSupplierPayment({
      supplierId: selectedSupplier.id,
      amount: amt,
      notes: payNotes,
      adminName: 'Alex Mercer',
    });

    if (!res.success) {
      setPayError(res.error || 'Failed to process payment.');
      return;
    }

    refreshData();
    setIsPayOpen(false);
    if (isViewOpen) {
      const updated = storeService.getSupplierById(selectedSupplier.id);
      if (updated) setSelectedSupplier(updated);
    }
    showSuccess(`Paid ৳${amt.toLocaleString()} to ${selectedSupplier.name}. Supplier Due updated.`);
  };

  // Get purchase history for selected supplier in view modal
  const supplierPurchases: PurchaseOrder[] = selectedSupplier
    ? storeService.getPurchasesBySupplier(selectedSupplier.id)
    : [];

  return (
    <AdminLayout
      title="Suppliers & Fabric Mills"
      subtitle="Manage licensed garment manufacturers, jacquard textile mills, trim vendors, and payables."
      actions={
        <Button
          id="btn-register-supplier"
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Supplier
        </Button>
      }
    >
      {/* Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Suppliers</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalSuppliers} <span className="text-xs font-normal text-emerald-400 font-sans">({activeSuppliers} Active)</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Verified garment & textile mills</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Supplier Due (Payable)</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatCurrency(totalSupplierDue)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Outstanding vendor payables</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Procured Value</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatCurrency(totalProcurementSpend)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Lifetime raw material purchases</p>
        </div>

        <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid to Suppliers</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalSettled)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total cash outflow cleared</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="supplier-search-input"
            type="text"
            placeholder="Search name, phone, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'ALL' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'INACTIVE' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
            />
            <span>Has Due ({'>'} ৳0)</span>
          </label>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#12151c] rounded-xl border border-neutral-800">
            <Building2 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No suppliers found</h3>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your search criteria or register a new vendor.</p>
          </div>
        ) : (
          filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl bg-[#12151c] border transition-all flex flex-col justify-between ${
                s.isActive ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-800/60 opacity-70'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-heading leading-tight">{s.name}</h3>
                    <span className="text-[11px] text-amber-400 font-mono">{s.code}</span>
                  </div>
                  <Badge variant={s.isActive ? 'gold' : 'neutral'} size="sm">
                    {s.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs text-neutral-300 pt-1 border-t border-neutral-800/80">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{s.phone || 'No phone provided'}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-[11px] text-neutral-400">{s.address || 'No address specified'}</span>
                  </p>
                  {s.notes && (
                    <p className="flex items-start gap-2 pt-1">
                      <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      <span className="italic text-[11px] text-neutral-400 line-clamp-2">{s.notes}</span>
                    </p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Supplier Due:</span>
                    <span
                      className={`font-mono font-bold ${
                        (s.supplierDue || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(s.supplierDue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-400">
                    <span>Total Procurement:</span>
                    <span className="font-mono text-neutral-300">{formatCurrency(s.totalSpend || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-neutral-900/50 border-t border-neutral-800 flex items-center justify-between gap-2">
                <Button
                  id={`btn-view-${s.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenView(s)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  className="flex-1 text-[11px]"
                >
                  View Details
                </Button>

                {(s.supplierDue || 0) > 0 && (
                  <Button
                    id={`btn-pay-${s.id}`}
                    variant="gold"
                    size="sm"
                    onClick={() => handleOpenPay(s)}
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    className="text-[11px]"
                  >
                    Pay Due
                  </Button>
                )}

                <button
                  id={`btn-edit-${s.id}`}
                  onClick={() => handleOpenEdit(s)}
                  className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition-colors"
                  title="Edit Supplier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  id={`btn-deactivate-${s.id}`}
                  onClick={() => handleToggleActive(s)}
                  className={`p-2 rounded-lg transition-colors ${
                    s.isActive
                      ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30'
                      : 'text-neutral-500 hover:text-emerald-400 hover:bg-emerald-950/30'
                  }`}
                  title={s.isActive ? 'Deactivate Supplier' : 'Activate Supplier'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= ADD SUPPLIER MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-heading">Register New Supplier</h3>
                <p className="text-xs text-neutral-400">Add apparel factory, fabric mill, or trim distributor.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Supplier Name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="add-supplier-name"
                  type="text"
                  required
                  placeholder="e.g. Apex Jacquard Knit Mills Ltd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone</label>
                  <input
                    id="add-supplier-phone"
                    type="text"
                    placeholder="e.g. +880 1711-209841"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Email</label>
                  <input
                    id="add-supplier-email"
                    type="email"
                    placeholder="e.g. procurement@apexknit.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Address</label>
                <input
                  id="add-supplier-address"
                  type="text"
                  placeholder="e.g. Plot 42, Sector 3, Uttara EPZ, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Country</label>
                  <input
                    id="add-supplier-country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Payment Terms</label>
                  <select
                    id="add-supplier-terms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes</label>
                <textarea
                  id="add-supplier-notes"
                  rows={3}
                  placeholder="Specializations, fabric GSM capabilities, minimum order quantity (MOQ), bank credentials..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button id="btn-submit-add-supplier" type="submit" variant="gold" size="sm">
                  Register Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT SUPPLIER MODAL ================= */}
      {isEditOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-heading">Edit Supplier Profile</h3>
                <p className="text-xs text-neutral-400">Update contact and operational details for {selectedSupplier.code}.</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Supplier Name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="edit-supplier-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone</label>
                  <input
                    id="edit-supplier-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Email</label>
                  <input
                    id="edit-supplier-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Address</label>
                <input
                  id="edit-supplier-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Country</label>
                  <input
                    id="edit-supplier-country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Payment Terms</label>
                  <select
                    id="edit-supplier-terms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes</label>
                <textarea
                  id="edit-supplier-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button id="btn-submit-edit-supplier" type="submit" variant="gold" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW SUPPLIER & PURCHASE HISTORY MODAL ================= */}
      {isViewOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-start sticky top-0 bg-[#12151c] z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white font-heading">{selectedSupplier.name}</h3>
                  <Badge variant={selectedSupplier.isActive ? 'gold' : 'neutral'} size="sm">
                    {selectedSupplier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <span className="text-xs text-amber-400 font-mono">Code: {selectedSupplier.code}</span>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-left">
              {/* Profile Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Supplier Due</span>
                  <div className="text-lg font-bold font-mono text-rose-400">
                    {formatCurrency(selectedSupplier.supplierDue || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Procured</span>
                  <div className="text-lg font-bold font-mono text-white">
                    {formatCurrency(selectedSupplier.totalSpend || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Paid</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(selectedSupplier.totalPaid || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Payment Terms</span>
                  <div className="text-xs font-semibold text-amber-300 mt-1">
                    {selectedSupplier.paymentTerms || 'Net 30 Days'}
                  </div>
                </div>
              </div>

              {/* Details card */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">Vendor Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                  <p><span className="text-neutral-500">Phone:</span> {selectedSupplier.phone || 'N/A'}</p>
                  <p><span className="text-neutral-500">Email:</span> {selectedSupplier.email || 'N/A'}</p>
                  <p><span className="text-neutral-500">Address:</span> {selectedSupplier.address || 'N/A'}</p>
                  <p><span className="text-neutral-500">Country:</span> {selectedSupplier.country || 'Bangladesh'}</p>
                </div>
                {selectedSupplier.notes && (
                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="text-neutral-500">Notes: </span>
                    <span className="text-neutral-300 italic">{selectedSupplier.notes}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {(selectedSupplier.supplierDue || 0) > 0 && (
                  <Button
                    id="btn-modal-pay-due"
                    variant="gold"
                    size="sm"
                    onClick={() => handleOpenPay(selectedSupplier)}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  >
                    Pay Supplier Due ({formatCurrency(selectedSupplier.supplierDue || 0)})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsViewOpen(false);
                    navigate('/admin/purchases');
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create PO for this Supplier
                </Button>
              </div>

              {/* Purchase History for this Supplier */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Purchase History ({supplierPurchases.length})</span>
                  </h4>
                </div>

                {supplierPurchases.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                    No purchase orders recorded for this supplier yet.
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900/40">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">PO #</th>
                          <th className="py-2.5 px-3">Item / Size</th>
                          <th className="py-2.5 px-3">Qty</th>
                          <th className="py-2.5 px-3">Total Cost</th>
                          <th className="py-2.5 px-3">Paid</th>
                          <th className="py-2.5 px-3">Due</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {supplierPurchases.map((po) => (
                          <tr key={po.id} className="hover:bg-neutral-800/30">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                              {po.purchaseDate || (po.createdAt ? po.createdAt.slice(0, 10) : 'N/A')}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                              {po.poNumber}
                            </td>
                            <td className="py-2.5 px-3 text-white">
                              {po.productTitle} <span className="text-amber-400 font-mono">[{po.size}]</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {po.quantity} pcs
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-white">
                              {formatCurrency(po.totalCost)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-400">
                              {formatCurrency(po.amountPaid || 0)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-rose-400 font-semibold">
                              {formatCurrency(po.supplierDue || 0)}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant={po.supplierDue === 0 ? 'success' : 'gold'} size="sm">
                                {po.supplierDue === 0 ? 'PAID' : 'DUE'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 flex justify-end sticky bottom-0 bg-[#12151c]">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAY SUPPLIER DUE MODAL ================= */}
      {isPayOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12151c] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-heading">Record Due Payment</h3>
                <p className="text-xs text-neutral-400">Pay outstanding balance to {selectedSupplier.name}.</p>
              </div>
              <button onClick={() => setIsPayOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4 text-left">
              {payError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Current Outstanding Due:</span>
                  <span className="font-mono font-bold text-rose-400">
                    {formatCurrency(selectedSupplier.supplierDue || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Vendor Code:</span>
                  <span className="font-mono text-amber-400">{selectedSupplier.code}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Payment Amount (৳) <span className="text-amber-400">*</span>
                </label>
                <input
                  id="pay-due-amount"
                  type="number"
                  min="1"
                  max={selectedSupplier.supplierDue || 0}
                  required
                  placeholder="Enter amount to pay"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPayAmount(String(selectedSupplier.supplierDue || 0))}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Pay Full Due ({formatCurrency(selectedSupplier.supplierDue || 0)})
                  </button>
                  <span className="text-[10px] text-neutral-600">•</span>
                  <button
                    type="button"
                    onClick={() => setPayAmount(String(Math.round((selectedSupplier.supplierDue || 0) / 2)))}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Pay 50%
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Payment Reference / Notes</label>
                <input
                  id="pay-due-notes"
                  type="text"
                  placeholder="e.g. Bank Transfer Txn #8410294 or Cash Cheque #19"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Financial Accounting Impact
                </p>
                <p className="text-neutral-400">
                  This records a real cash outflow entry of <span className="text-white font-mono">৳{Number(payAmount || 0).toLocaleString()}</span> in the business cashbook and deducts it from the supplier's due balance.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPayOpen(false)}>
                  Cancel
                </Button>
                <Button id="btn-submit-pay-due" type="submit" variant="gold" size="sm">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
