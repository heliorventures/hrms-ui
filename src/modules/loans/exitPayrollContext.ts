import { array, number, object, text } from './financeJson';

export interface ExitPayrollCycle {
  id: string;
  year: number;
  month: number;
}
export interface ExitPayrollPayslip extends ExitPayrollCycle {
  cycleId: string;
  amount: string;
}
export interface ExitPayrollContext {
  draftCycles: ExitPayrollCycle[];
  recentIssuedPayslips: ExitPayrollPayslip[];
}
const cycle = (raw: unknown): ExitPayrollCycle => {
  const row = object(raw);
  return { id: text(row.id), year: number(row.year), month: number(row.month) };
};
export function exitPayrollContext(raw: unknown): ExitPayrollContext {
  const row = object(raw);
  return {
    draftCycles: array(row.draftCycles).map(cycle),
    recentIssuedPayslips: array(row.recentIssuedPayslips).map((raw) => {
      const slip = object(raw);
      return { ...cycle(raw), cycleId: text(slip.cycleId), amount: text(slip.amount) };
    }),
  };
}
export const payrollPeriod = (cycle: ExitPayrollCycle) =>
  `${cycle.year}-${String(cycle.month).padStart(2, '0')}`;
