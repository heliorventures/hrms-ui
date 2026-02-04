import { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { OLD_REGIME_DEDUCTIONS, NEW_REGIME_DEDUCTIONS } from '../../mocks/payroll';
import Card from '../../components/common/Card';
import type { TaxRegime } from '../../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PayrollTaxPage = () => {
  const { currentTenant } = useTenant();
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');

  const deductions = taxRegime === 'old' ? OLD_REGIME_DEDUCTIONS : NEW_REGIME_DEDUCTIONS;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tax</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        View available deductions under Indian taxation. Select your regime to see applicable sections and limits.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Regime</label>
          <select
            value={taxRegime}
            onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="new">New Regime</option>
            <option value="old">Old Regime</option>
          </select>
        </div>
      </div>

      <Card title={taxRegime === 'old' ? 'Old Regime – All Available Deductions (Section-wise)' : 'New Regime – Applicable Deductions'}>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {taxRegime === 'old'
            ? 'Under the old regime you can claim these deductions. Declare amounts in the Income Tax tab to reduce taxable income.'
            : 'Under the new regime, only the following deductions are available (no 80C, 80D, etc.). Standard deduction is applied automatically for salaried employees.'}
        </p>
        <div className="space-y-6">
          {deductions.map((section) => (
            <div
              key={section.section}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Section {section.section}
                </h3>
                {section.maxAmount != null && (
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    Max: {formatCurrency(section.maxAmount)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{section.name}</p>
              {section.subSections && section.subSections.length > 0 && (
                <ul className="mt-3 space-y-1 pl-4 text-sm text-gray-600 dark:text-gray-400">
                  {section.subSections.map((sub) => (
                    <li key={sub.name} className="list-disc">
                      {sub.name}
                      {sub.limit != null && (
                        <span className="ml-1 text-gray-500">(limit: {formatCurrency(sub.limit)})</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PayrollTaxPage;
