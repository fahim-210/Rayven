import React, { useState } from 'react';
import { storeService } from '../../../services/storeService.ts';
import { Expense } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../lib/utils.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  Tag,
  Building,
  Box,
  Truck,
  Megaphone,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Packaging',
  'Poly',
  'Transportation',
  'Marketing',
  'Utilities',
  'Maintenance',
  'Office Supplies',
  'Staff Allowance',
  'Other business expenses',
];

const PAYMENT_METHODS = [
  'Cash on Hand',
  'Bank Transfer (City Bank)',
  'bKash Merchant',
  'Nagad Business',
  'Petty Cash',
];

export const ExpensesSection: React.FC = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(() => storeService.getExpenses());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formAddedBy, setFormAddedBy] = useState('Alex Mercer (Director)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setExpenses(storeService.getExpenses());
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // This month expenses
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = e.date || '';
      return d.startsWith('2026-09') || d.startsWith(new Date().toISOString().slice(0, 7));
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAddModal = () => {
    setFormCategory(EXPENSE_CATEGORIES[0]);
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDescription('');
    setFormPaymentMethod(PAYMENT_METHODS[0]);
    setFormNotes('');
    setFormAddedBy('Alex Mercer (Director)');
    setIsModalOpen(true);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);

    if (!amountNum || amountNum <= 0) {
      toast({
        type: 'error',
        title: 'Invalid Expense Amount',
        message: 'Amount must be greater than zero.',
      });
      return;
    }

    if (!formCategory || !formDescription.trim()) {
      toast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please fill in category and description.',
      });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.addExpense({
      category: formCategory,
      amount: amountNum,
      date: formDate,
      description: formDescription.trim(),
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim(),
      addedBy: formAddedBy.trim(),
    });
    setIsSubmitting(false);

    if (result.success && result.expense) {
      toast({
        type: 'success',
        title: 'Expense Voucher Created',
        message: `Voucher ${result.expense.voucherNo} of ৳${amountNum.toLocaleString()} recorded with automatic cash outflow.`,
      });
      setIsModalOpen(false);
      refreshData();
    } else {
      toast({
        type: 'error',
        title: 'Failed to Save Expense',
        message: result.error || 'Could not record expense.',
      });
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      exp.description.toLowerCase().includes(searchLower) ||
      (exp.voucherNo && exp.voucherNo.toLowerCase().includes(searchLower)) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchLower)) ||
      (exp.addedBy && exp.addedBy.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Category totals
  const categoryStats = EXPENSE_CATEGORIES.map((cat) => {
    const catTotal = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.filter((e) => e.category === cat).length;
    return { category: cat, total: catTotal, count };
  }).filter((c) => c.count > 0);

  return (
    <div className="space-y-6 text-left" id="expenses-management-section">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Business Expenses
            </span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Receipt className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalExpenseAmount)}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Cumulative operating outflows recorded</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Current Month Expenses
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Tag className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-amber-400 mt-2">
            {formatCurrency(thisMonthExpenses)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Deducted from gross product margins in Net Profit
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Expense Vouchers
            </span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-indigo-400 mt-2">
            {expenses.length}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            All vouchers synchronized with Central Cashbook
          </p>
        </div>
      </div>

      {/* 2. Top Expense Categories Quick Pills */}
      <div className="p-4 rounded-xl bg-[#12151c] border border-neutral-800/80">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-2.5">
          Top Outlay Categories Breakdown
        </span>
        <div className="flex flex-wrap gap-2">
          {categoryStats.map((item) => (
            <button
              key={item.category}
              onClick={() => setSelectedCategory(selectedCategory === item.category ? 'ALL' : item.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border transition-all ${
                selectedCategory === item.category
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <span>{item.category}</span>
              <span className="text-amber-400 font-bold">{formatCurrency(item.total)}</span>
              <span className="text-[10px] text-neutral-500">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search voucher, description, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12151c] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#12151c] border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Expense Voucher
          </Button>
        </div>
      </div>

      {/* 4. Expenses Table */}
      <div className="bg-[#12151c] rounded-xl border border-neutral-800/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" id="expenses-table">
            <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Voucher No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Added By</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No expense vouchers found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {exp.voucherNo || exp.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {exp.date ? formatDate(exp.date) : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700 text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                      {exp.addedBy || 'Finance Admin'}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 max-w-[180px] truncate text-[11px]">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-rose-400 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Add Expense Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <Receipt className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Add Expense Voucher</h3>
                  <p className="text-xs text-neutral-400">
                    Creates expense record and immediate cash outflow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Warehouse & Factory Rent for September"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Added By (Admin / Manager) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={formAddedBy}
                  onChange={(e) => setFormAddedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Receipt voucher reference or supplementary notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-neutral-300 text-[11px] flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Posting this expense will create a verifiable <strong>Cash Outflow</strong> in the central cashbook.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
