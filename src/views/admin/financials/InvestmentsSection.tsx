import React, { useState } from 'react';
import { storeService, BUSINESS_OWNERS } from '../../../services/storeService.ts';
import { Investment, Withdrawal } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../lib/utils.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import {
  PiggyBank,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Users,
  Briefcase,
  UserCheck,
  Percent,
  RefreshCw,
  Info,
  DollarSign,
  PieChart,
} from 'lucide-react';

export const InvestmentsSection: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'OWNERS' | 'EXTERNAL' | 'WITHDRAWALS'>('OWNERS');
  const [summary, setSummary] = useState(() => storeService.getInvestmentSummary());
  const [investments, setInvestments] = useState<Investment[]>(() => storeService.getInvestments());
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => storeService.getWithdrawals());

  // Modal States
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  // Owner Form
  const [ownerInvestor, setOwnerInvestor] = useState<string>(BUSINESS_OWNERS[0]);
  const [ownerAmount, setOwnerAmount] = useState('');
  const [ownerDate, setOwnerDate] = useState(new Date().toISOString().slice(0, 10));
  const [ownerNotes, setOwnerNotes] = useState('');
  const [ownerAddedBy, setOwnerAddedBy] = useState('RAYVEN Admin');

  // External Form
  const [extName, setExtName] = useState('');
  const [extAmount, setExtAmount] = useState('');
  const [extShare, setExtShare] = useState('');
  const [extDate, setExtDate] = useState(new Date().toISOString().slice(0, 10));
  const [extNotes, setExtNotes] = useState('');

  // Withdrawal Form
  const [withPerson, setWithPerson] = useState<string>(BUSINESS_OWNERS[0]);
  const [withAmount, setWithAmount] = useState('');
  const [withDate, setWithDate] = useState(new Date().toISOString().slice(0, 10));
  const [withReason, setWithReason] = useState('Monthly Partner Drawings');
  const [withNotes, setWithNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setSummary(storeService.getInvestmentSummary());
    setInvestments(storeService.getInvestments());
    setWithdrawals(storeService.getWithdrawals());
  };

  const handleAddOwnerInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(ownerAmount);
    if (!amountNum || amountNum <= 0) {
      toast({ type: 'error', title: 'Invalid Amount', message: 'Investment amount must be greater than 0.' });
      return;
    }
    if (!ownerInvestor) {
      toast({ type: 'error', title: 'Missing Investor', message: 'Please select an owner.' });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.addOwnerInvestment({
      investor: ownerInvestor,
      amount: amountNum,
      date: ownerDate,
      notes: ownerNotes.trim(),
      addedBy: ownerAddedBy.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        type: 'success',
        title: 'Capital Injected',
        message: `Added ৳${amountNum.toLocaleString()} capital from ${ownerInvestor} with automatic cash inflow.`,
      });
      setIsOwnerModalOpen(false);
      setOwnerAmount('');
      setOwnerNotes('');
      refreshData();
    } else {
      toast({ type: 'error', title: 'Error', message: result.error || 'Failed to add investment.' });
    }
  };

  const handleAddExternalInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(extAmount);
    const shareNum = parseFloat(extShare);

    if (!amountNum || amountNum <= 0) {
      toast({ type: 'error', title: 'Invalid Amount', message: 'Investment amount must be greater than 0.' });
      return;
    }
    if (isNaN(shareNum) || shareNum < 0 || shareNum > 100) {
      toast({ type: 'error', title: 'Invalid Share', message: 'Equity share must be between 0% and 100%.' });
      return;
    }
    if (!extName.trim()) {
      toast({ type: 'error', title: 'Missing Name', message: 'Please provide external investor name.' });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.addExternalInvestment({
      name: extName.trim(),
      investmentAmount: amountNum,
      sharePercentage: shareNum,
      date: extDate,
      notes: extNotes.trim(),
      addedBy: 'Finance Admin',
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        type: 'success',
        title: 'External Investment Added',
        message: `Recorded ৳${amountNum.toLocaleString()} from ${extName} (${shareNum}% equity) with cash inflow.`,
      });
      setIsExternalModalOpen(false);
      setExtName('');
      setExtAmount('');
      setExtShare('');
      setExtNotes('');
      refreshData();
    } else {
      toast({ type: 'error', title: 'Error', message: result.error || 'Failed to add external investment.' });
    }
  };

  const handleAddWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withAmount);
    if (!amountNum || amountNum <= 0) {
      toast({ type: 'error', title: 'Invalid Amount', message: 'Withdrawal amount must be greater than 0.' });
      return;
    }
    if (!withPerson.trim() || !withReason.trim()) {
      toast({ type: 'error', title: 'Missing Fields', message: 'Person and reason are required.' });
      return;
    }

    setIsSubmitting(true);
    const result = storeService.addWithdrawal({
      person: withPerson,
      amount: amountNum,
      date: withDate,
      reason: withReason,
      notes: withNotes.trim(),
      addedBy: withPerson,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        type: 'success',
        title: 'Withdrawal Recorded',
        message: `Recorded ৳${amountNum.toLocaleString()} withdrawal by ${withPerson} with automatic cash outflow.`,
      });
      setIsWithdrawalModalOpen(false);
      setWithAmount('');
      setWithNotes('');
      refreshData();
    } else {
      toast({ type: 'error', title: 'Error', message: result.error || 'Failed to record withdrawal.' });
    }
  };

  const ownerInvestmentsList = investments.filter((i) => (i.investorType || 'OWNER') === 'OWNER');
  const externalInvestmentsList = investments.filter((i) => i.investorType === 'EXTERNAL');

  return (
    <div className="space-y-6 text-left" id="investments-management-section">
      {/* 1. Treasury Equity & Drawings KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Total Capital Invested
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatCurrency(summary.totalInvestment)}
          </p>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Founders + External Equity</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Founder Capital (3 Owners)
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {formatCurrency(summary.totalOwnerInvestment)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Alex Mercer, Tarek Rahman, Fahim Shahriar
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              External Investors
            </span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-400 mt-2">
            {formatCurrency(summary.totalExternalInvestment)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            {externalInvestmentsList.length} external strategic investors
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151c] border border-neutral-800/90 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Partner Withdrawals
            </span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {formatCurrency(summary.totalWithdrawals)}
          </p>
          <p className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Net Founder Capital: <strong className="text-white">{formatCurrency(summary.netOwnerCapital)}</strong>
          </p>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-800 pb-3">
        <div className="flex bg-[#12151c] p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('OWNERS')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'OWNERS'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Founder Investments (3 Owners)
          </button>
          <button
            onClick={() => setActiveTab('EXTERNAL')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'EXTERNAL'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            External Investors ({externalInvestmentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'WITHDRAWALS'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Partner Withdrawals ({withdrawals.length})
          </button>
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
          {activeTab === 'OWNERS' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsOwnerModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Owner Investment
            </Button>
          )}
          {activeTab === 'EXTERNAL' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsExternalModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add External Investor
            </Button>
          )}
          {activeTab === 'WITHDRAWALS' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Record Withdrawal
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: OWNER CAPITAL (3 OWNERS) */}
      {activeTab === 'OWNERS' && (
        <div className="space-y-6">
          {/* Individual Owner Cards */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-3">
              Individual Owner Investments (Total: {formatCurrency(summary.totalOwnerInvestment)})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.ownersBreakdown.map((owner) => {
                const ownerWithdrawals = withdrawals
                  .filter((w) => w.person.toLowerCase() === owner.name.toLowerCase())
                  .reduce((sum, w) => sum + w.amount, 0);
                const netCap = owner.amount - ownerWithdrawals;

                return (
                  <div
                    key={owner.name}
                    className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-white font-heading">{owner.name}</h4>
                        <span className="text-xs text-amber-400 font-mono">Business Owner / Partner</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {owner.percentage}% Pool
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        Invested Capital
                      </span>
                      <p className="text-2xl font-bold font-mono text-white mt-0.5">
                        {formatCurrency(owner.amount)}
                      </p>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        {owner.count} capital injection transaction{owner.count === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex justify-between items-center text-xs text-neutral-400">
                      <span>Drawings: <strong className="text-rose-400">{formatCurrency(ownerWithdrawals)}</strong></span>
                      <span>Net: <strong className="text-emerald-400">{formatCurrency(netCap)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owner Investments Table */}
          <div className="bg-[#12151c] rounded-xl border border-neutral-800/90 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Owner Capital Injections Ledger
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {ownerInvestmentsList.length} transactions recorded
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Investor / Owner</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Notes / Purpose</th>
                    <th className="py-3 px-4 text-right">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {ownerInvestmentsList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {formatDate(inv.date || inv.fundingDate || '')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {inv.investor || inv.investorName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Founder Equity
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {inv.notes || 'Founder equity capital addition'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(inv.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXTERNAL INVESTORS */}
      {activeTab === 'EXTERNAL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {externalInvestmentsList.map((ext) => (
              <div
                key={ext.id}
                className="p-5 rounded-xl bg-[#12151c] border border-neutral-800 hover:border-indigo-500/40 transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white font-heading">
                      {ext.investor || ext.investorName}
                    </h4>
                    <span className="text-xs text-indigo-400 font-mono">External Strategic Investor</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {ext.sharePercentage || ext.equityShare || 0}% Equity Share
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Investment Amount
                    </span>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                      {formatCurrency(ext.amount)}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Funded: {formatDate(ext.date || ext.fundingDate || '')}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 text-xs text-neutral-400">
                  <p className="line-clamp-2">{ext.notes || 'Angel financing commitment'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#12151c] rounded-xl border border-neutral-800/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Investor Name</th>
                    <th className="py-3 px-4">Share Percentage</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Investment Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {externalInvestmentsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500">
                        No external investors registered. Click "Add External Investor" to add one.
                      </td>
                    </tr>
                  ) : (
                    externalInvestmentsList.map((ext) => (
                      <tr key={ext.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                          {formatDate(ext.date || ext.fundingDate || '')}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {ext.investor || ext.investorName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-indigo-400 font-bold">
                          {ext.sharePercentage || ext.equityShare || 0}%
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {ext.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-sm text-emerald-400 whitespace-nowrap">
                          +{formatCurrency(ext.amount)}
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

      {/* TAB 3: PARTNER WITHDRAWALS */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-neutral-300 flex items-center gap-3">
            <Info className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              Partner drawings and capital withdrawals decrease total cash in hand and are tracked individually against each owner's equity balance.
            </span>
          </div>

          <div className="bg-[#12151c] rounded-xl border border-neutral-800/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" id="withdrawals-table">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Partner / Person</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Withdrawal Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500">
                        No partner withdrawals recorded.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono text-amber-400 font-bold whitespace-nowrap">
                          {w.withdrawalNumber || w.id}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                          {formatDate(w.date)}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {w.person}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {w.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {w.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-sm text-rose-400 whitespace-nowrap">
                          −{formatCurrency(w.amount)}
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

      {/* MODAL 1: Add Owner Investment */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <PiggyBank className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Add Founder Investment</h3>
                  <p className="text-xs text-neutral-400">Direct founder equity injection into business</p>
                </div>
              </div>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOwnerInvestment} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Owner / Investor *
                </label>
                <select
                  value={ownerInvestor}
                  onChange={(e) => setOwnerInvestor(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {BUSINESS_OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner} (Business Partner)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Investment Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 100000"
                  value={ownerAmount}
                  onChange={(e) => setOwnerAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={ownerDate}
                  onChange={(e) => setOwnerDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Additional working capital for Autumn kit production..."
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-neutral-300 text-[11px] flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatically posts a <strong>Cash Inflow</strong> to Central Cashbook.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOwnerModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Investment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add External Investor */}
      {isExternalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Add External Investor</h3>
                  <p className="text-xs text-neutral-400">Angel / Strategic equity partner</p>
                </div>
              </div>
              <button
                onClick={() => setIsExternalModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExternalInvestment} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Investor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahbub Alom (Angel Investor)"
                  value={extName}
                  onChange={(e) => setExtName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Investment Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 500000"
                    value={extAmount}
                    onChange={(e) => setExtAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                    Share Percentage (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={extShare}
                    onChange={(e) => setExtShare(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={extDate}
                  onChange={(e) => setExtDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Shareholder rights, board observer seat terms, etc..."
                  value={extNotes}
                  onChange={(e) => setExtNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExternalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Investor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Record Partner Withdrawal */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Record Partner Withdrawal</h3>
                  <p className="text-xs text-neutral-400">Capital withdrawal / partner drawings</p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawalModalOpen(false)}
                className="text-neutral-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWithdrawal} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Partner / Person *
                </label>
                <select
                  value={withPerson}
                  onChange={(e) => setWithPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {BUSINESS_OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Withdrawal Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 25000"
                  value={withAmount}
                  onChange={(e) => setWithAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Reason *
                </label>
                <select
                  value={withReason}
                  onChange={(e) => setWithReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Monthly Partner Drawings">Monthly Partner Drawings</option>
                  <option value="Interim Profit Share Dividend">Interim Profit Share Dividend</option>
                  <option value="Personal Emergency Drawing">Personal Emergency Drawing</option>
                  <option value="Partner Travel Allowance">Partner Travel Allowance</option>
                  <option value="Director Loan Settlement">Director Loan Settlement</option>
                  <option value="Other Capital Withdrawal">Other Capital Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={withDate}
                  onChange={(e) => setWithDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Bank cheque reference or drawing details..."
                  value={withNotes}
                  onChange={(e) => setWithNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-neutral-300 text-[11px] flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Reduces available liquid cash and posts a <strong>Cash Outflow</strong> to Central Cashbook.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWithdrawalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording...' : 'Record Withdrawal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
