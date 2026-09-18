import React, { useState } from 'react';
import { storeService } from '../../../services/storeService.ts';
import { Loan } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../lib/utils.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import {
  Landmark,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Calendar,
  Percent,
} from 'lucide-react';

export const LoansSection: React.FC = () => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>(() => storeService.getLoans());
  const [summary, setSummary] = useState(() => storeService.getLoanSummary());
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<Loan | null>(null);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Register Loan Form
  const [formLender, setFormLender] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formInterest, setFormInterest] = useState('9.0');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAddedBy, setFormAddedBy] = useState('Alex Mercer (Director)');

  // Repay Loan Form
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));
  const [repayNotes, setRepayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setLoans(storeService.getLoans());
    setSummary(storeService.getLoanSummary());
  };

  const handleRegisterLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    const interestNum = parseFloat(formInterest) || 0;

    if (!amountNum || amountNum <= 0) {
      toast({ type: 'error', title: 'Invalid Amount', message: 'Loan amount must be greater than 0.' });
      return;
    }
    if (!formLender.trim()) {
      toast({ type: 'error', title: 'Missing Lender', message: 'Please specify the lender or financial institution.' });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.createLoan({
      lender: formLender.trim(),
      amount: amountNum,
      date: formDate,
      interest: interestNum,
      dueDate: formDueDate || undefined,
      notes: formNotes.trim(),
      addedBy: formAddedBy.trim(),
    });
    setIsSubmitting(false);

    if (result.success && result.loan) {
      toast({
        type: 'success',
        title: 'Loan Registered',
        message: `Loan facility of ৳${amountNum.toLocaleString()} from ${formLender} added with cash inflow recorded.`,
      });
      setIsRegisterModalOpen(false);
      setFormLender('');
      setFormAmount('');
      setFormNotes('');
      refreshData();
    } else {
      toast({ type: 'error', title: 'Failed to Register Loan', message: result.error || 'Could not save loan.' });
    }
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepay) return;

    const amountNum = parseFloat(repayAmount);
    const currentRemaining =
      selectedLoanForRepay.balanceRemaining ??
      Math.max(0, (selectedLoanForRepay.principal || selectedLoanForRepay.principalAmount || 0) - (selectedLoanForRepay.amountRepaid || 0));

    if (!amountNum || amountNum <= 0) {
      toast({ type: 'error', title: 'Invalid Amount', message: 'Repayment amount must be positive.' });
      return;
    }

    if (amountNum > currentRemaining + 0.01) {
      toast({
        type: 'error',
        title: 'Amount Exceeds Balance',
        message: `Maximum payable is remaining due: ৳${currentRemaining.toLocaleString()}`,
      });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.repayLoan({
      loanId: selectedLoanForRepay.id,
      amount: amountNum,
      date: repayDate,
      notes: repayNotes.trim(),
      addedBy: 'Finance Admin',
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        type: 'success',
        title: 'Repayment Recorded',
        message: `Paid ৳${amountNum.toLocaleString()} towards ${selectedLoanForRepay.lender || selectedLoanForRepay.lenderName}. Cash outflow recorded.`,
      });
      setSelectedLoanForRepay(null);
      setRepayAmount('');
      setRepayNotes('');
      refreshData();
    } else {
      toast({ type: 'error', title: 'Repayment Failed', message: result.error || 'Could not process repayment.' });
    }
  };

  return (
    <div className="space-y-6 text-left" id="loans-management-section">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Borrowed
            </span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Landmark className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(summary.totalBorrowed)}
          </p>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cumulative principal disbursed</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Outstanding Loan (Remaining Due)
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {formatCurrency(summary.outstandingLoan)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Current debt liability across {summary.activeLoansCount} active facilities
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Paid Amount (Total Repaid)
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatCurrency(summary.totalRepaid)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Processed with verifiable cash outflow receipts
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Repayment Progress
            </span>
            <span className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
              <Percent className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-2">
            {summary.totalBorrowed > 0
              ? `${Math.round((summary.totalRepaid / summary.totalBorrowed) * 100)}%`
              : '0%'}
          </p>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${
                  summary.totalBorrowed > 0
                    ? Math.min(100, Math.round((summary.totalRepaid / summary.totalBorrowed) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Controls & Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Commercial Loans & Debt Schedule
          </h3>
          <p className="text-xs text-neutral-400">
            Disbursements trigger cash inflows; scheduled repayments trigger cash outflows.
          </p>
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
            onClick={() => setIsRegisterModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Register New Loan
          </Button>
        </div>
      </div>

      {/* 3. Detailed Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loans.map((loan) => {
          const originalAmount = loan.principal || loan.principalAmount || 0;
          const paidAmount = loan.amountRepaid || 0;
          const remainingDue =
            loan.balanceRemaining ?? Math.max(0, originalAmount - paidAmount);
          const isPaidOff = remainingDue <= 0 || loan.status === 'PAID_OFF';
          const lenderTitle = loan.lender || loan.lenderName || 'Financial Creditor';
          const percentPaid = originalAmount > 0 ? Math.round((paidAmount / originalAmount) * 100) : 0;
          const isExpanded = expandedLoanId === loan.id;
          const repaymentList = loan.repayments || [];

          return (
            <div
              key={loan.id}
              className={`p-5 rounded-xl bg-[#12151c] border transition-all ${
                isPaidOff
                  ? 'border-neutral-800/80 opacity-80'
                  : 'border-neutral-800 hover:border-amber-500/40 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white font-heading">{lenderTitle}</h4>
                    <span className="font-mono text-[11px] text-amber-400">
                      #{loan.loanNumber || loan.id}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    Disbursed: {formatDate(loan.date || loan.startDate || '')}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    isPaidOff
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isPaidOff ? 'PAID OFF' : 'ACTIVE FACILITY'}
                </span>
              </div>

              {/* Amount Breakdown: Original Loan Amount, Paid Amount, Remaining Due */}
              <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-neutral-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Original Amount
                  </span>
                  <p className="text-sm font-bold font-mono text-white mt-0.5">
                    {formatCurrency(originalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Paid Amount
                  </span>
                  <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(paidAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Remaining Due
                  </span>
                  <p className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                    {formatCurrency(remainingDue)}
                  </p>
                </div>
              </div>

              {/* Repayment Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>Repaid: {percentPaid}%</span>
                  <span>Due Date: {loan.dueDate ? formatDate(loan.dueDate) : 'Open Line'}</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPaidOff ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, percentPaid)}%` }}
                  />
                </div>
              </div>

              {/* Interest & Notes */}
              <div className="flex justify-between items-center text-xs text-neutral-400 pb-3 border-b border-neutral-800/80">
                <span>Interest: <strong className="text-white font-mono">{loan.interest || loan.interestRate || 0}% APR</strong></span>
                <span className="truncate max-w-[200px] text-[11px]">{loan.notes || 'Working capital line'}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                  className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-mono"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{repaymentList.length} Repayments {isExpanded ? '▲' : '▼'}</span>
                </button>

                {!isPaidOff && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setSelectedLoanForRepay(loan);
                      setRepayAmount(remainingDue > 0 ? remainingDue.toString() : '');
                      setRepayDate(new Date().toISOString().slice(0, 10));
                    }}
                    leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Repay Loan
                  </Button>
                )}
              </div>

              {/* Expanded Repayment History */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">
                    Repayment Schedule & Transaction Log
                  </span>
                  {repaymentList.length === 0 ? (
                    <p className="text-neutral-500 text-[11px] py-1">No repayments recorded yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {repaymentList.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center text-[11px]"
                        >
                          <div>
                            <span className="font-mono text-neutral-400">{formatDate(rep.date)}</span>
                            <span className="text-neutral-300 ml-2 font-medium">{rep.notes || 'Scheduled installment'}</span>
                          </div>
                          <span className="font-mono font-bold text-rose-400">
                            −{formatCurrency(rep.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Register New Loan */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Landmark className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Register Loan Facility</h3>
                  <p className="text-xs text-neutral-400">Commercial borrowing with automatic cash inflow</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterLoan} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Lender / Financial Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRAC Bank SME Term Loan, City Bank Line of Credit"
                  value={formLender}
                  onChange={(e) => setFormLender(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Loan Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 200000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Interest Rate (% APR)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 9.0"
                    value={formInterest}
                    onChange={(e) => setFormInterest(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Disbursement Date *
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
                    Maturity / Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Sanction & Facility Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Collateral terms, monthly tenure, sanction letter number..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-neutral-300 text-[11px] flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatically posts a <strong>Cash Inflow</strong> to Central Cashbook upon loan registration.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register Loan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Repay Loan */}
      {selectedLoanForRepay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Repay Loan Installment</h3>
                  <p className="text-xs text-neutral-400">
                    {selectedLoanForRepay.lender || selectedLoanForRepay.lenderName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanForRepay(null)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            {/* Loan Summary Info Box */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase">Original</span>
                <p className="font-mono font-bold text-white mt-0.5">
                  {formatCurrency(selectedLoanForRepay.principal || selectedLoanForRepay.principalAmount || 0)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase">Paid So Far</span>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(selectedLoanForRepay.amountRepaid || 0)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase">Remaining Due</span>
                <p className="font-mono font-bold text-amber-400 mt-0.5">
                  {formatCurrency(
                    selectedLoanForRepay.balanceRemaining ??
                      Math.max(
                        0,
                        (selectedLoanForRepay.principal || selectedLoanForRepay.principalAmount || 0) -
                          (selectedLoanForRepay.amountRepaid || 0)
                      )
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">
                    Repayment Amount (৳) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const maxBal =
                        selectedLoanForRepay.balanceRemaining ??
                        Math.max(
                          0,
                          (selectedLoanForRepay.principal || selectedLoanForRepay.principalAmount || 0) -
                            (selectedLoanForRepay.amountRepaid || 0)
                        );
                      setRepayAmount(maxBal.toString());
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-mono"
                  >
                    Pay Full Due
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  max={
                    selectedLoanForRepay.balanceRemaining ??
                    Math.max(
                      0,
                      (selectedLoanForRepay.principal || selectedLoanForRepay.principalAmount || 0) -
                        (selectedLoanForRepay.amountRepaid || 0)
                    )
                  }
                  placeholder="Enter repayment amount"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Repayment Date *
                </label>
                <input
                  type="date"
                  required
                  value={repayDate}
                  onChange={(e) => setRepayDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Payment Notes / Cheque Ref
                </label>
                <textarea
                  rows={2}
                  placeholder="Installment voucher number, cheque reference, etc..."
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-neutral-300 text-[11px] flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Reduces outstanding balance and posts a <strong>Cash Outflow</strong> to Central Cashbook.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLoanForRepay(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Repayment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
