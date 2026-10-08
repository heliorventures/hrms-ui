import type { ReactNode } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import type { FyPayrollExportKey, MonthlyPayrollExportKey } from '../hooks/usePayrollExports';
import { PAYROLL_MONTHS } from '../payrollFormatters';

import PayrollFinancialYearExports from './PayrollFinancialYearExports';

interface ExportStatus {
  exporting: boolean;
  error: string | null;
}

interface PayrollExportsSectionProps {
  month: number;
  year: number;
  fyStartYear: number;
  fyQuarter: number;
  monthlyStatus: Record<string, ExportStatus>;
  fyStatus: Partial<Record<FyPayrollExportKey, ExportStatus>>;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onFyStartYearChange: (value: number) => void;
  onFyQuarterChange: (value: number) => void;
  onMonthlyDownload: (key: MonthlyPayrollExportKey) => void;
  onFyDownload: (key: FyPayrollExportKey) => void;
}

const monthlyExportCards: {
  key: MonthlyPayrollExportKey;
  title: string;
  buttonLabel: string;
  busyLabel: string;
  description: ReactNode;
  usesSharedPeriod?: boolean;
}[] = [
  {
    key: 'tds',
    title: 'India — Monthly TDS Summary (CSV)',
    buttonLabel: 'Download CSV',
    busyLabel: 'Downloading…',
    description: (
      <>
        Stub export for statutory prep: one row per payslip in the selected payroll cycle, using
        stored <span className="font-medium">tdsAmount</span> and primary PAN when present. Requires{' '}
        <span className="font-mono text-xs">payroll:statutory_export</span> permission role.
      </>
    ),
  },
  {
    key: 'pfEsi',
    title: 'India — PF / ESI Summary (CSV)',
    buttonLabel: 'Download PF/ESI CSV',
    busyLabel: 'Downloading…',
    usesSharedPeriod: true,
    description:
      'Second statutory stub (M12): employee + UAN / ESIC identifiers and PF/ESI amounts from each payslip in the selected cycle. Same permission gate as the TDS export. Not an ECR or challan file.',
  },
  {
    key: 'form24q',
    title: 'India — Form 24Q Salary Payment Month (Stub CSV)',
    buttonLabel: 'Download Form 24Q month stub CSV',
    busyLabel: 'Downloading…',
    description: (
      <>
        Reconciliation-oriented rows per payslip: India FY of the pay month, PAN, gross as a
        notional Section&nbsp;<strong>192</strong> salary base, and <strong>TDS</strong> withheld
        from payslip. Trailing columns can list employer TAN/name when service settings exist. Not
        TRACES <strong>Form&nbsp;24Q</strong> upload or Annex&nbsp;II layout — use for internal
        checks only. Same permission gate; month/year matches the TDS section above.
      </>
    ),
  },
  {
    key: 'epfEcr',
    title: 'India — EPFO ECR Contribution Prep (Stub CSV)',
    buttonLabel: 'Download EPF ECR prep stub CSV',
    busyLabel: 'Downloading…',
    description: (
      <>
        UAN, member name, PAY month/year, EPF wage (
        <span className="font-mono text-xs">min(gross, ₹15k)</span>), employee and employer PF from
        the payslip — for reconciling before remittance. Not the official Unified EPF{' '}
        <strong>ECR</strong> file format. Same gate; month/year matches the TDS section.
      </>
    ),
  },
  {
    key: 'bank',
    title: 'Payroll — Bank Transfer List (CSV)',
    buttonLabel: 'Download bank transfer CSV',
    busyLabel: 'Downloading…',
    description: (
      <>
        One row per payslip in the selected cycle: <span className="font-medium">net salary</span>{' '}
        as the amount and the employee’s <span className="font-medium">primary bank account</span>{' '}
        when one exists. Rows without a primary account include{' '}
        <span className="font-mono text-xs">MISSING_BANK</span> in{' '}
        <span className="font-mono text-xs">bank_status</span>. Generic CSV for ops — not a specific
        bank’s upload template.
      </>
    ),
  },
  {
    key: 'neft',
    title: 'India — Bulk NEFT Credit Prep (CSV)',
    buttonLabel: 'Download bulk NEFT prep CSV',
    busyLabel: 'Downloading…',
    description:
      'Same cycle and net pay as the bank transfer list, with columns aimed at common multi-row NEFT salary uploads. Not an NPCI NACH mandate file or a bank binary template.',
  },
];

const PayrollExportsSection = ({
  month,
  year,
  fyStartYear,
  fyQuarter,
  monthlyStatus,
  fyStatus,
  onMonthChange,
  onYearChange,
  onFyStartYearChange,
  onFyQuarterChange,
  onMonthlyDownload,
  onFyDownload,
}: PayrollExportsSectionProps) => (
  <>
    {monthlyExportCards.map((card) => {
      const status = monthlyStatus[card.key] ?? { exporting: false, error: null };
      return (
        <Card key={card.key} title={card.title}>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
          <div className="flex flex-wrap items-end gap-4">
            {card.key === 'tds' && (
              <>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Month</span>
                  <select
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={month}
                    onChange={(event) => onMonthChange(Number(event.target.value))}
                  >
                    {PAYROLL_MONTHS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Year</span>
                  <input
                    type="number"
                    min={2000}
                    max={2200}
                    className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={year}
                    onChange={(event) => onYearChange(Number(event.target.value) || year)}
                  />
                </label>
              </>
            )}
            <Button
              type="button"
              onClick={() => onMonthlyDownload(card.key)}
              disabled={status.exporting}
            >
              {status.exporting ? card.busyLabel : card.buttonLabel}
            </Button>
            {card.usesSharedPeriod && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Uses month/year above with the TDS section.
              </span>
            )}
          </div>
          {status.error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{status.error}</p>
          )}
        </Card>
      );
    })}

    <PayrollFinancialYearExports
      fyStartYear={fyStartYear}
      fyQuarter={fyQuarter}
      fyStatus={fyStatus}
      onFyStartYearChange={onFyStartYearChange}
      onFyQuarterChange={onFyQuarterChange}
      onFyDownload={onFyDownload}
    />
  </>
);

export default PayrollExportsSection;
