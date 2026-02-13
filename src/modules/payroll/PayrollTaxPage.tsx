import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import {
  OLD_REGIME_DEDUCTIONS,
  NEW_REGIME_DEDUCTIONS,
} from '../../mocks/payroll';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import type { TaxRegime, DeclaredDeduction } from '../../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getFinancialYears = () => {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current; y >= current - 5; y--) {
    years.push({
      value: `${y}-${(y + 1).toString().slice(-2)}`,
      label: `FY ${y}-${(y + 1).toString().slice(-2)} (Apr ${y} - Mar ${y + 1})`,
    });
  }
  return years;
};

const PayrollTaxPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { getDeclaredDeductions, setDeclaredDeductions } = useDataStore();

  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [fy, setFy] = useState(() => {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    return m < 3 ? `${y - 1}-${String(y).slice(-2)}` : `${y}-${String(y + 1).slice(-2)}`;
  });

  const existingDeclarations =
    user && currentTenant
      ? getDeclaredDeductions(user.id, currentTenant.id, fy)
      : [];

  const [declared, setDeclared] = useState<DeclaredDeduction[]>([]);

  useEffect(() => {
    setDeclared([...existingDeclarations]);
  }, [fy, taxRegime]);

  const getAmountForSection = (section: string) =>
    declared.find((d) => d.section === section)?.amount ?? 0;

  const getUploadStatusForSection = (section: string) =>
    declared.find((d) => d.section === section)?.documentUploaded ?? false;

  const handleAmountChange = (section: string, name: string, amount: number) => {
    setDeclared((prev) => {
      const existing = prev.find((d) => d.section === section);
      const rest = prev.filter((d) => d.section !== section);
      if (amount <= 0) {
        return rest;
      }
      return [
        ...rest,
        {
          section,
          name,
          amount,
          documentUploaded: existing?.documentUploaded ?? false,
        },
      ];
    });
  };

  const handleUploadClick = (section: string) => {
    setDeclared((prev) => {
      const existing = prev.find((d) => d.section === section);
      if (!existing) return prev;
      return prev.map((d) =>
        d.section === section ? { ...d, documentUploaded: true } : d
      );
    });
  };

  const handleSave = () => {
    if (!user || !currentTenant) return;
    setDeclaredDeductions(user.id, currentTenant.id, fy, declared);
    alert('Tax declarations saved successfully!');
  };

  const fyOptions = getFinancialYears();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Manage Tax
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {taxRegime === 'old'
          ? 'Declare your tax-deductible investments and upload supporting documents. These will be used for tax calculation under the Old Regime.'
          : 'Under the New Regime, only standard deduction applies. No additional declarations needed.'}
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Financial Year
          </label>
          <select
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {fyOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Regime
          </label>
          <select
            value={taxRegime}
            onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="new">New Regime</option>
            <option value="old">Old Regime</option>
          </select>
        </div>
      </div>

      {taxRegime === 'old' ? (
        <>
          <Card title="Declare Tax Deductions (Old Regime)">
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Enter the amount you have invested/paid for each section. Upload
              supporting documents (e.g. premium receipt, investment proof) for
              verification.
            </p>
            <div className="space-y-6">
              {OLD_REGIME_DEDUCTIONS.filter(
                (s) => s.section !== '10(14)' && s.maxAmount != null
              ).map((section) => (
                <div
                  key={section.section}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Section {section.section}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {section.name}
                      </p>
                      {section.maxAmount != null && (
                        <p className="mt-1 text-xs text-gray-500">
                          Max: {formatCurrency(section.maxAmount)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-32">
                        <Input
                          label="Amount (₹)"
                          type="number"
                          min={0}
                          max={section.maxAmount ?? undefined}
                          value={
                            getAmountForSection(section.section) || ''
                          }
                          onChange={(e) => {
                            const v = parseFloat(e.target.value) || 0;
                            handleAmountChange(
                              section.section,
                              section.name,
                              v
                            );
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="block text-xs font-medium text-gray-500">
                          Document
                        </label>
                        {getUploadStatusForSection(section.section) ? (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            ✓ Uploaded
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUploadClick(section.section)
                            }
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={handleSave}>Save Declarations</Button>
            </div>
          </Card>

          <Card title="Available Deductions Reference">
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Sections without a max limit have no cap. Declare in the form
              above.
            </p>
            <div className="space-y-4">
              {OLD_REGIME_DEDUCTIONS.map((section) => (
                <div
                  key={section.section}
                  className="rounded border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Section {section.section} – {section.name}
                    </span>
                    {section.maxAmount != null && (
                      <span className="text-gray-500">
                        Max: {formatCurrency(section.maxAmount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card title="New Regime – Applicable Deductions">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Under the new regime, only the following deductions are available.
            Standard deduction (₹75,000) is applied automatically for salaried
            employees. No declaration required.
          </p>
          <div className="space-y-4">
            {NEW_REGIME_DEDUCTIONS.map((section) => (
              <div
                key={section.section}
                className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {section.section}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {section.name}
                </p>
                {section.maxAmount != null && (
                  <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                    Max: {formatCurrency(section.maxAmount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PayrollTaxPage;
