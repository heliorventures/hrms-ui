import type { PayrollTabId } from '../payrollTypes';

const payrollPayTabs: { id: PayrollTabId; label: string }[] = [
  { id: 'salary', label: 'Salary' },
  { id: 'payslip', label: 'Payslip' },
  { id: 'incometax', label: 'Income Tax' },
];

interface PayrollPayTabsProps {
  activeTab: PayrollTabId;
  canReadTax: boolean;
  onChange: (tab: PayrollTabId) => void;
}

const PayrollPayTabs = ({ activeTab, canReadTax, onChange }: PayrollPayTabsProps) => (
  <div className="border-b border-slate-200 dark:border-slate-700">
    <nav className="-mb-px flex gap-6">
      {payrollPayTabs.filter((tab) => tab.id !== 'incometax' || canReadTax).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`border-b-2 py-4 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

export default PayrollPayTabs;
