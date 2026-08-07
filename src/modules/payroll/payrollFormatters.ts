import { indiaFyAnchorYear } from './utils/indiaFy';
import type { PayrollCycleRow, PayslipIndiaFyTotals, PayslipRow } from './payrollTypes';

export const PAYROLL_MONTHS = Array.from({ length: 12 }, (_, index) => {
  const value = index + 1;
  return {
    value,
    label: new Date(2000, index, 1).toLocaleString('en-IN', { month: 'long' }),
  };
});

export function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmountString(value?: string | null) {
  if (value == null || value === '') return '—';
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? formatInr(numberValue) : value;
}

export function formatPayrollPeriod(row: PayrollCycleRow) {
  return new Date(row.year, row.month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatPayrollPaymentDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '—';
}

export function defaultCycleName() {
  const today = new Date();
  return `${today.toLocaleString('en-IN', { month: 'long' })} ${today.getFullYear()} payroll`;
}

export function isMissingDbRelation(message: string) {
  return /does not exist|relation "([^"]+)"|relation '([^']+)'/i.test(message);
}

export function isMissingPayrollCoreTable(message: string) {
  if (!isMissingDbRelation(message)) return false;
  return /salary_component|payslip|payroll_cycle|payslip_component|payroll_compliance_setting/i.test(
    message
  );
}

export function isMissingPayrollCoreError(err: unknown) {
  if (err instanceof Error) return isMissingPayrollCoreTable(err.message);
  if (typeof err === 'string') return isMissingPayrollCoreTable(err);
  return false;
}

export function buildPayslipIndiaFyTotals(
  payslips: PayslipRow[] | null | undefined,
  cycleById: Map<string, PayrollCycleRow>,
  fiscalYear?: number | null
): PayslipIndiaFyTotals | null {
  if (!fiscalYear) return null;
  let gross = 0;
  let tds = 0;
  let slipCount = 0;
  for (const slip of payslips ?? []) {
    const cycle = cycleById.get(slip.payrollCycleId);
    if (!cycle) continue;
    if (indiaFyAnchorYear(cycle.month, cycle.year) !== fiscalYear) continue;
    const grossValue = Number(slip.grossSalary);
    const tdsValue = slip.tdsAmount != null ? Number(slip.tdsAmount) : 0;
    gross += Number.isFinite(grossValue) ? grossValue : 0;
    tds += Number.isFinite(tdsValue) ? tdsValue : 0;
    slipCount += 1;
  }
  return { fyAnchor: fiscalYear, gross, tds, slipCount };
}
