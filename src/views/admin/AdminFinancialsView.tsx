import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { CashbookSection } from './financials/CashbookSection.tsx';
import { ExpensesSection } from './financials/ExpensesSection.tsx';
import { InvestmentsSection } from './financials/InvestmentsSection.tsx';
import { LoansSection } from './financials/LoansSection.tsx';
import { Wallet, Receipt, PiggyBank, Landmark } from 'lucide-react';

export const AdminFinancialsView: React.FC<{
  type: 'cashbook' | 'expenses' | 'investments' | 'loans';
}> = ({ type }) => {
  const { currentPath, navigate } = useRouter();

  const financeTabs = [
    {
      id: 'expenses',
      label: 'Expenses',
      path: '/admin/expenses',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'investments',
      label: 'Investment & Withdrawal',
      path: '/admin/investments',
      icon: <PiggyBank className="w-4 h-4" />,
    },
    {
      id: 'cashbook',
      label: 'Central Cashbook',
      path: '/admin/cashbook',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'loans',
      label: 'Loans & Credit',
      path: '/admin/loans',
      icon: <Landmark className="w-4 h-4" />,
    },
  ];

  let title = 'Financial Management System';
  let subtitle = 'Transactional accounting with central cash transaction engine and zero double-counting.';

  if (type === 'cashbook') {
    title = 'Central Cashbook & Treasury Ledger';
    subtitle =
      'Real-time double-entry register of all cash inflows and outflows across sales, expenses, investments, loans, and partner drawings.';
  } else if (type === 'expenses') {
    title = 'Business Expenses & Operational Outflows';
    subtitle =
      'Track operational expenditures including rent, packaging, poly, transportation, marketing, utilities, and other business overheads.';
  } else if (type === 'investments') {
    title = 'Capital Investments, External Equity & Withdrawals';
    subtitle =
      'Track separate capital investments across the 3 business owners, manage external angel investors, and monitor partner drawings.';
  } else if (type === 'loans') {
    title = 'Loans & Commercial Debt Facilities';
    subtitle =
      'Register commercial bank and private credit facilities, monitor outstanding debt, and record traceable loan repayments.';
  }

  return (
    <AdminLayout
      title={title}
      subtitle={subtitle}
      actions={
        <div className="flex bg-[#12151c] p-1 rounded-xl border border-neutral-800 text-xs">
          {financeTabs.map((tab) => {
            const isActive = type === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      }
    >
      <div className="space-y-6">
        {type === 'cashbook' && <CashbookSection />}
        {type === 'expenses' && <ExpensesSection />}
        {type === 'investments' && <InvestmentsSection />}
        {type === 'loans' && <LoansSection />}
      </div>
    </AdminLayout>
  );
};
