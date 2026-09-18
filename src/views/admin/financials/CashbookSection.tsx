import React, { useState } from 'react';
import { storeService } from '../../../services/storeService.ts';
import { CashbookEntry } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../lib/utils.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const CashbookSection: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CashbookEntry[]>(() => storeService.getCashbook());
  const [summary, setSummary] = useState(() => storeService.getCashbookSummary());
  const [filterType, setFilterType] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INFLOW' | 'OUTFLOW'>('INFLOW');

  // Modal Form State
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAccount, setFormAccount] = useState('Primary Business Current Account');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formReference, setFormReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setEntries(storeService.getCashbook());
    setSummary(storeService.getCashbookSummary());
  };

  const handleOpenModal = (type: 'INFLOW' | 'OUTFLOW') => {
    setModalType(type);
    setFormCategory(type === 'INFLOW' ? 'Miscellaneous Inflow' : 'Operating Cash Disbursement');
    setFormAmount('');
    setFormDescription('');
    setFormReference(`MAN-${Date.now().toString().slice(-6)}`);
    setFormAccount(type === 'INFLOW' ? 'Primary Business Current Account' : 'Operating Cash Reserve');
    setFormDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);

    if (!amountNum || amountNum <= 0) {
      toast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Transaction amount must be strictly greater than 0.',
      });
      return;
    }

    if (!formCategory.trim() || !formDescription.trim()) {
      toast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please provide both category and description for the cash movement.',
      });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.recordCashTransaction({
      type: modalType,
      category: formCategory.trim(),
      amount: amountNum,
      description: formDescription.trim(),
      referenceCode: formReference.trim() || `TX-${Date.now().toString().slice(-6)}`,
      recordedBy: 'Finance Admin',
      entryDate: formDate,
      account: formAccount.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        type: 'success',
        title: `${modalType === 'INFLOW' ? 'Cash Inflow' : 'Cash Outflow'} Recorded`,
        message: `Successfully posted ৳${amountNum.toLocaleString()} to central cashbook.`,
      });
      setIsModalOpen(false);
      refreshData();
    } else {
      toast({
        type: 'error',
        title: 'Transaction Rejected',
        message: result.error || 'Failed to record cash transaction.',
      });
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'INFLOW' && (entry.entryType === 'INFLOW' || entry.type === 'CREDIT')) ||
      (filterType === 'OUTFLOW' && (entry.entryType === 'OUTFLOW' || entry.type === 'DEBIT'));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      entry.description.toLowerCase().includes(searchLower) ||
      entry.category.toLowerCase().includes(searchLower) ||
      (entry.referenceCode && entry.referenceCode.toLowerCase().includes(searchLower)) ||
      (entry.account && entry.account.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left" id="cashbook-management-section">
      {/* 1. Treasury KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Balance */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Current Liquid Balance
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <p
            className={`text-3xl font-bold font-mono mt-2 ${
              summary.currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary.currentBalance)}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single source of truth: Total In − Total Out</span>
          </div>
        </div>

        {/* Total Cash In */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Cash In (Inflows)
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-2">
            {formatCurrency(summary.totalIn)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Includes verified sales, owner equity, angel investments & loans
          </p>
        </div>

        {/* Total Cash Out */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Cash Out (Outflows)
            </span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-rose-400 mt-2">
            {formatCurrency(summary.totalOut)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Includes paid expenses, supplier outlays, withdrawals & debt paydowns
          </p>
        </div>
      </div>

      {/* 2. System Traceability Banner */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Central Cash Transaction Architecture:</strong> Every sales approval, supplier purchase,
            operational expense, investment injection, loan disbursement, repayment, and withdrawal automatically
            registers in this central cashbook with transactional rollback safety to eliminate double-counting.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('INFLOW')}
            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            leftIcon={<ArrowDownRight className="w-3.5 h-3.5" />}
          >
            Manual Cash In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('OUTFLOW')}
            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Manual Cash Out
          </Button>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, category, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12151c] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex bg-[#12151c] p-1 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'ALL' ? 'bg-amber-500 text-black font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilterType('INFLOW')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'INFLOW'
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Inflows
            </button>
            <button
              onClick={() => setFilterType('OUTFLOW')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'OUTFLOW'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Outflows
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* 4. Complete Cashbook Table */}
      <div className="bg-[#12151c] rounded-xl border border-neutral-800/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" id="cashbook-entries-table">
            <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Ref Code / Voucher</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account / Gateway</th>
                <th className="py-3.5 px-4">In / Out</th>
                <th className="py-3.5 px-4 text-right">Amount (৳)</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No cashbook transactions match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isInflow = entry.entryType === 'INFLOW' || entry.type === 'CREDIT';
                  return (
                    <tr key={entry.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {entry.entryDate || formatDate(entry.timestamp || entry.date || '')}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400 whitespace-nowrap">
                        {entry.referenceCode || entry.entryNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                        {entry.category}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                        {entry.account || 'Operating Reserve'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isInflow
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isInflow ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {isInflow ? 'CASH IN' : 'CASH OUT'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                          isInflow ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isInflow ? '+' : '−'}
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-200 whitespace-nowrap">
                        {typeof entry.balance === 'number' ? formatCurrency(entry.balance) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Add Manual Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-lg ${
                    modalType === 'INFLOW' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {modalType === 'INFLOW' ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Record Manual {modalType === 'INFLOW' ? 'Cash Inflow' : 'Cash Outflow'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Direct entry into central double-entry vault
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

            <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Transaction Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalType === 'INFLOW' ? 'e.g. Cash Recovery, Bank Interest' : 'e.g. Petty Cash, Office Tea'}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Description / Narration *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed justification for this treasury ledger movement..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Date
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
                    Account / Reserve
                  </label>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Primary Business Current Account">Bank Current Account</option>
                    <option value="Operating Cash Reserve">Operating Cash Reserve</option>
                    <option value="bKash Merchant Vault">bKash Merchant Vault</option>
                    <option value="Nagad Business Account">Nagad Business Account</option>
                    <option value="Petty Cash Box">Petty Cash Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Reference Code / Document #
                </label>
                <input
                  type="text"
                  placeholder="e.g. TR-9982"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
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
                  {isSubmitting ? 'Posting...' : 'Post to Ledger'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
