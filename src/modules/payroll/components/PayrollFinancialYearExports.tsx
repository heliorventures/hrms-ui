import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import type { FyPayrollExportKey } from '../hooks/usePayrollExports';

interface Props {
  fyStartYear: number;
  fyQuarter: number;
  fyStatus: Partial<Record<FyPayrollExportKey, { exporting: boolean; error: string | null }>>;
  onFyStartYearChange: (value: number) => void;
  onFyQuarterChange: (value: number) => void;
  onFyDownload: (key: FyPayrollExportKey) => void;
}

const PayrollFinancialYearExports = ({
  fyStartYear,
  fyQuarter,
  fyStatus,
  onFyStartYearChange,
  onFyQuarterChange,
  onFyDownload,
}: Props) => (
  <Card title="India FY — Employee Payroll Totals (CSV)">
    <PageInformation title="Export period">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Reconciles finalized payslips, imported source months and current-employer opening history
        for April through March, without counting a month twice. Evidence columns identify each
        source; unknown deductions remain blank. Projections are excluded and recorded TDS does not
        prove tax remittance. Quarterly totals require opening history split by quarter.
        Form&nbsp;16 Part&nbsp;B is a preparation file, not a certificate.
      </p>
    </PageInformation>
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600 dark:text-gray-400">India FY start year</span>
        <input
          type="number"
          min={2000}
          max={2199}
          className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={fyStartYear}
          onChange={(event) => onFyStartYearChange(Number(event.target.value) || fyStartYear)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600 dark:text-gray-400">FY quarter</span>
        <select
          className="min-w-[12rem] rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={fyQuarter}
          onChange={(event) => onFyQuarterChange(Number(event.target.value) || 1)}
        >
          <option value={1}>Q1 Apr-Jun</option>
          <option value={2}>Q2 Jul-Sep</option>
          <option value={3}>Q3 Oct-Dec</option>
          <option value={4}>Q4 Jan-Mar</option>
        </select>
      </label>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        e.g. 2025 for FY 2025-26 (Apr 2025-Mar 2026).
      </span>
      <Button
        type="button"
        onClick={() => onFyDownload('fyTotals')}
        disabled={fyStatus.fyTotals?.exporting}
      >
        {fyStatus.fyTotals?.exporting ? 'Downloading…' : 'Download FY totals CSV'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onFyDownload('fyQuarterTotals')}
        disabled={fyStatus.fyQuarterTotals?.exporting}
      >
        {fyStatus.fyQuarterTotals?.exporting ? 'Downloading…' : 'Download FY quarter totals CSV'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onFyDownload('form16')}
        disabled={fyStatus.form16?.exporting}
      >
        {fyStatus.form16?.exporting ? 'Downloading…' : 'Form 16 Part B prep (FY stub) CSV'}
      </Button>
    </div>
    {fyStatus.fyTotals?.error && (
      <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fyStatus.fyTotals.error}</p>
    )}
    {fyStatus.fyQuarterTotals?.error && (
      <p className="mt-3 text-sm text-red-600 dark:text-red-400">
        {fyStatus.fyQuarterTotals.error}
      </p>
    )}
    {fyStatus.form16?.error && (
      <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fyStatus.form16.error}</p>
    )}
  </Card>
);

export default PayrollFinancialYearExports;
