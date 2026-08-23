import Card from '../../../components/common/Card';
import PayslipDocument from './PayslipDocument';
import { formatPayrollPeriod } from '../payrollFormatters';
import type {
  PayrollComplianceSettingRow,
  PayrollCycleRow,
  PayslipPeriodOption,
  PayslipRow,
} from '../payrollTypes';

interface PayrollPayslipTabProps {
  activePayslip: PayslipRow | null;
  cycleById: Map<string, PayrollCycleRow>;
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
  selectedCycleId: string | null;
  tenantId?: string;
  tenantName: string;
  onSelectedCycleChange: (cycleId: string | null) => void;
}

const PayrollPayslipTab = ({
  activePayslip,
  cycleById,
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
  selectedCycleId,
  tenantId,
  tenantName,
  onSelectedCycleChange,
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

    {!payslipsLoading && !payslipError && payslips && payslips.length > 0 && (
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
              value={selectedCycleId ?? ''}
              onChange={(event) => onSelectedCycleChange(event.target.value || null)}
            >
              {payslipPeriodOptions.map((option) => (
                <option key={option.cycleId} value={option.cycleId}>
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
              cycleById.get(activePayslip.payrollCycleId)
                ? formatPayrollPeriod(cycleById.get(activePayslip.payrollCycleId)!)
                : '—'
            }
            labelForLine={labelForLine}
            slip={activePayslip}
          />
        )}
      </>
    )}

    {!payslipsLoading && !payslipError && payslips && payslips.length === 0 && (
      <Card>
        <p className="text-sm text-slate-500">No Payslips For Your Account Yet.</p>
      </Card>
    )}
  </div>
);

export default PayrollPayslipTab;
