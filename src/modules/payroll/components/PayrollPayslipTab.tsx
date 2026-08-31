import Card from '../../../components/common/Card';
import PayslipDocument from './PayslipDocument';
import type {
  PayrollComplianceSettingRow,
  PayslipPeriodOption,
  PayslipRow,
} from '../payrollTypes';

interface PayrollPayslipTabProps {
  activePayslip: PayslipRow | null;
  employeeCode: string;
  employeeName: string;
  labelForLine: (line: { salaryComponentId: string; componentType?: string | null }) => string;
  payslipBranding: PayrollComplianceSettingRow;
  payslipError: string | null;
  payslipLogoReadUrl: string | null;
  payslipMigrationRequired: boolean;
  payslipPeriodOptions: PayslipPeriodOption[];
  payslips: PayslipRow[] | null;
  payslipsLoading: boolean;
  selectedPeriodKey: string | null;
  tenantId?: string;
  tenantName: string;
  onSelectedPeriodChange: (periodKey: string | null) => void;
}

const PayrollPayslipTab = ({
  activePayslip,
  employeeCode,
  employeeName,
  labelForLine,
  payslipBranding,
  payslipError,
  payslipLogoReadUrl,
  payslipMigrationRequired,
  payslipPeriodOptions,
  payslips,
  payslipsLoading,
  selectedPeriodKey,
  tenantId,
  tenantName,
  onSelectedPeriodChange,
}: PayrollPayslipTabProps) => (
  <div className="space-y-4">
    {payslipsLoading && <p className="text-sm text-slate-500">Loading Payslips...</p>}

    {payslipError && !payslipsLoading && payslipMigrationRequired && (
      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">{payslipError}</p>
        <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
          Run tenant migrations (same as for Salary tab) so{' '}
          <span className="font-mono">payslip</span> exists.
        </p>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
          Active tenant: <span className="font-mono">{tenantId}</span>
        </p>
      </Card>
    )}

    {payslipError && !payslipsLoading && !payslipMigrationRequired && (
      <p className="text-sm text-amber-800 dark:text-amber-200">{payslipError}</p>
    )}

    {!payslipsLoading && !payslipError && payslips && payslipPeriodOptions.length > 0 && (
      <>
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
              htmlFor="payslip-period"
            >
              Pay period
            </label>
            <select
              id="payslip-period"
              className="max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={selectedPeriodKey ?? ''}
              onChange={(event) => onSelectedPeriodChange(event.target.value || null)}
            >
              {payslipPeriodOptions.map((option) => (
                <option key={option.periodKey} value={option.periodKey}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activePayslip && (
          <PayslipDocument
            tenantName={tenantName}
            companyHeaderName={payslipBranding?.payslipHeaderTitle}
            payslipLogoReadUrl={payslipLogoReadUrl}
            employeeName={employeeName}
            employeeCode={employeeCode}
            periodLabel={
              payslipPeriodOptions.find(
                (option) => option.payslip?.id === activePayslip.id
              )?.label ?? 'Payslip'
            }
            labelForLine={labelForLine}
            slip={activePayslip}
          />
        )}

        {!activePayslip && selectedPeriodKey && (
          <Card>
            <p className="text-sm text-slate-500">
              No payslip is available for{' '}
              {payslipPeriodOptions.find((option) => option.periodKey === selectedPeriodKey)
                ?.label ?? 'the selected period'}{' '}
              yet.
            </p>
          </Card>
        )}
      </>
    )}
  </div>
);

export default PayrollPayslipTab;
