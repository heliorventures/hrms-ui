import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { mockDeclaredDeductionsByFy } from '../../mocks/payroll';
import Card from '../../components/common/Card';
import MaskedAmount from '../../components/common/MaskedAmount';
import Button from '../../components/common/Button';
import type { TaxRegime } from '../../types';
import { downloadPayslipPdf } from '../../utils/generatePayslipPdf';

type TabId = 'salary' | 'payslip' | 'incometax';

const tabs: { id: TabId; label: string }[] = [
  { id: 'salary', label: 'Salary' },
  { id: 'payslip', label: 'Payslip' },
  { id: 'incometax', label: 'Income Tax' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const getFinancialYears = () => {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current; y >= current - 5; y--) {
    years.push({ value: `${y}-${(y + 1).toString().slice(-2)}`, label: `FY ${y}-${(y + 1).toString().slice(-2)} (Apr ${y} - Mar ${y + 1})` });
  }
  return years;
};

const MONTHS_FY = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

/** Simplified income tax (FY 2025-26). Returns { totalTax, monthlyTds }. */
function computeTax(regime: TaxRegime, taxableAnnual: number): { totalTax: number; monthlyTds: number } {
  const taxable = Math.max(0, taxableAnnual);
  let totalTax = 0;
  if (regime === 'new') {
    // New regime: 0-3L nil, 3-7L 5%, 7-10L 10%, 10-12L 15%, 12-15L 20%, 15L+ 30%
    const bands = [
      [0, 300000, 0],
      [300000, 700000, 0.05],
      [700000, 1000000, 0.1],
      [1000000, 1200000, 0.15],
      [1200000, 1500000, 0.2],
      [1500000, Infinity, 0.3],
    ] as [number, number, number][];
    for (const [limitFrom, limitTo, rate] of bands) {
      const bandStart = limitFrom;
      const bandEnd = limitTo === Infinity ? taxable : Math.min(limitTo, taxable);
      if (taxable <= bandStart) break;
      const bandAmount = Math.max(0, bandEnd - bandStart);
      totalTax += bandAmount * rate;
    }
  } else {
    // Old regime: 0-2.5L nil, 2.5-5L 5%, 5-10L 20%, 10L+ 30%
    const bands = [
      [0, 250000, 0],
      [250000, 500000, 0.05],
      [500000, 1000000, 0.2],
      [1000000, Infinity, 0.3],
    ] as [number, number, number][];
    for (const [limitFrom, limitTo, rate] of bands) {
      const bandEnd = limitTo === Infinity ? taxable : Math.min(limitTo, taxable);
      if (taxable <= limitFrom) break;
      const bandAmount = Math.max(0, bandEnd - limitFrom);
      totalTax += bandAmount * rate;
    }
  }
  const cess = totalTax * 0.04;
  totalTax += cess;
  return { totalTax, monthlyTds: totalTax / 12 };
}

const PayrollPayPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('salary');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fy, setFy] = useState(() => {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    return m < 3 ? `${y - 1}-${String(y).slice(-2)}` : `${y}-${String(y + 1).slice(-2)}`;
  });
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');

  const { getSalaryHistory, getPayslips } = useDataStore();
  const salaryHistory = user ? getSalaryHistory(user.id, currentTenant.id) : [];
  const payslips = user ? getPayslips(user.id, currentTenant.id) : [];

  const selectedPayslip = useMemo(
    () => payslips.find((p) => p.month === selectedMonth),
    [payslips, selectedMonth]
  );

  const fyOptions = getFinancialYears();

  const currentSalary = salaryHistory[0];
  const previousSalaries = salaryHistory.slice(1);

  const declaredKey = user && currentTenant ? `${user.id}-${currentTenant.id}-${fy}` : '';
  const declaredDeductions = (mockDeclaredDeductionsByFy[declaredKey] ?? []) as { section: string; name: string; amount: number }[];
  const totalDeclaredDeduction = declaredDeductions.reduce((s, d) => s + d.amount, 0);
  const annualGross = (currentSalary?.totalMonthly ?? 0) * 12;
  const standardDeductionNew = 75000;
  const taxableOld = Math.max(0, annualGross - totalDeclaredDeduction);
  const taxableNew = Math.max(0, annualGross - standardDeductionNew);
  const taxableIncome = taxRegime === 'old' ? taxableOld : taxableNew;
  const { totalTax, monthlyTds } = computeTax(taxRegime, taxableIncome);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay</h1>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'salary' && (
        <div className="space-y-6">
          <>
              {currentSalary && (
                <Card title="Current Salary">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Valid from {formatDate(currentSalary.effectiveFrom)} to Present
                    {previousSalaries.length > 0 && (
                      <span className="block mt-0.5">(from end of previous salary to current — no end date)</span>
                    )}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentSalary.totalMonthly)} <span className="text-base font-normal text-gray-500">/ month</span>
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {currentSalary.components.map((c) => (
                      <div key={c.name} className="flex justify-between rounded bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                        <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                  {currentSalary.appraisalReason && (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{currentSalary.appraisalReason}</p>
                  )}
                </Card>
              )}
              {previousSalaries.length > 0 && (
                <Card title="Previous Salary (Appraisal History)">
                  <ul className="space-y-4">
                    {previousSalaries.map((s) => (
                      <li key={s.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Valid from {formatDate(s.effectiveFrom)} to {s.effectiveTo ? formatDate(s.effectiveTo) : '—'}
                        </p>
                        <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(s.totalMonthly)} <span className="text-sm font-normal text-gray-500">/ month</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {s.components.map((c) => (
                            <span key={c.name} className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">
                              {c.name}: {formatCurrency(c.amount)}
                            </span>
                          ))}
                        </div>
                        {s.appraisalReason && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{s.appraisalReason}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {!currentSalary && (
                <Card><p className="text-center text-gray-500 dark:text-gray-400">No salary history found.</p></Card>
              )}
          </>
        </div>
      )}

      {activeTab === 'payslip' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {payslips.map((p) => (
                <option key={p.id} value={p.month}>
                  {new Date(p.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          {selectedPayslip ? (
            <Card title={`Payslip – ${new Date(selectedPayslip.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Generated on {formatDate(selectedPayslip.generatedOn)}.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPayslipPdf(selectedPayslip)}
                >
                  Download PDF
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Earnings</h4>
                  <div className="mt-2 space-y-1">
                    {selectedPayslip.components.filter((c) => c.type === 'earning').map((c) => (
                      <div key={c.name} className="flex justify-between text-sm">
                        <span>{c.name}</span>
                        <MaskedAmount amount={c.amount} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t pt-2 text-sm font-medium">
                    <div className="flex justify-between">
                      <span>Gross Salary</span>
                      <MaskedAmount amount={selectedPayslip.grossSalary} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Deductions</h4>
                  <div className="mt-2 space-y-1">
                    {selectedPayslip.components.filter((c) => c.type === 'deduction').map((c) => (
                      <div key={c.name} className="flex justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-red-600 dark:text-red-400">-</span>
                          <MaskedAmount amount={c.amount} />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t pt-2 text-sm font-medium">
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Total Deductions</span>
                      <span className="flex items-center gap-2">
                        -
                        <MaskedAmount amount={selectedPayslip.totalDeductions} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex justify-between items-center text-lg font-bold text-green-800 dark:text-green-200">
                    <span>Net In-Hand</span>
                    <MaskedAmount amount={selectedPayslip.netSalary} />
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card><p className="text-center text-gray-500 dark:text-gray-400">No payslip for selected month.</p></Card>
          )}
        </div>
      )}

      {activeTab === 'incometax' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Financial Year</label>
              <select
                value={fy}
                onChange={(e) => setFy(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {fyOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
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

          <Card title="Annual Salary (per component)">
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Total salary for FY {fy} – components add up to annual salary, then split month-wise (Apr–Mar).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-300">Component</th>
                    <th className="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Annual Total</th>
                    {MONTHS_FY.map((m) => (
                      <th key={m} className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSalary?.components.map((c) => (
                    <tr key={c.name} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{c.name}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(c.amount * 12)}</td>
                      {MONTHS_FY.map((m) => (
                        <td key={m} className="py-2 text-right text-gray-600 dark:text-gray-400">{formatCurrency(c.amount)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2 text-gray-900 dark:text-white">Total Annual Salary</td>
                    <td className="py-2 text-right">{formatCurrency((currentSalary?.totalMonthly ?? 0) * 12)}</td>
                    {MONTHS_FY.map((m) => (
                      <td key={m} className="py-2 text-right">{formatCurrency(currentSalary?.totalMonthly ?? 0)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Declared Deductions & Taxable Income">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              How declared deductions are subtracted from actual salary; remaining taxable income and tax.
            </p>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/30">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Annual gross salary (FY {fy})</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(annualGross)}</span>
              </div>
              {taxRegime === 'old' ? (
                <>
                  {declaredDeductions.length > 0 ? (
                    <>
                      {declaredDeductions.map((d) => (
                        <div key={d.section} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Section {d.section} – {d.name}</span>
                          <span className="font-medium text-green-600 dark:text-green-400">− {formatCurrency(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-medium dark:border-gray-600">
                        <span>Total deductions (declared)</span>
                        <span className="text-green-600 dark:text-green-400">− {formatCurrency(totalDeclaredDeduction)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No deductions declared for this FY. Declare in Manage Tax or through HR.</p>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Standard deduction (salaried)</span>
                  <span className="font-medium text-green-600 dark:text-green-400">− {formatCurrency(standardDeductionNew)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-semibold dark:border-gray-600">
                <span>Taxable income (after deductions)</span>
                <span className="text-primary-600 dark:text-primary-400">{formatCurrency(taxableIncome)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total tax (incl. cess) for FY</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
            </div>
          </Card>

          <Card title="Month-wise Tax (TDS)">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Estimated TDS per month based on taxable income for the selected regime and FY.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-300">Month</th>
                    <th className="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Tax (TDS)</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS_FY.map((m) => (
                    <tr key={m} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{m}</td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(monthlyTds)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2 text-gray-900 dark:text-white">Total TDS (FY)</td>
                    <td className="py-2 text-right">{formatCurrency(totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayrollPayPage;
