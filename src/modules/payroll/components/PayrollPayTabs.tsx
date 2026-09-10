import { TAB_LIST_CLASS, tabClassName } from '../../../components/common/tabStyles';
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
  <nav className={TAB_LIST_CLASS} aria-label="Payslips and tax sections">
    {payrollPayTabs
      .filter((tab) => tab.id !== 'incometax' || canReadTax)
      .map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={tabClassName(activeTab === tab.id)}
        >
          {tab.label}
        </button>
      ))}
  </nav>
);

export default PayrollPayTabs;
