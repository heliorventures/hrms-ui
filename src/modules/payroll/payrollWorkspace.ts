export type PayrollWorkspaceId = 'runs' | 'adjustments' | 'setup' | 'documents';
export interface PayrollWorkspaceTask {
  id: string;
  label: string;
  workspace: PayrollWorkspaceId;
}
export const PAYROLL_WORKSPACES = [
  { id: 'runs', label: 'Payroll Runs' },
  { id: 'adjustments', label: 'Monthly Adjustments' },
  { id: 'setup', label: 'Payroll Setup' },
  { id: 'documents', label: 'Payslips & Exports' },
] as const;
export function payrollWorkspaceTasks(
  readAllPayslips: boolean,
  exportPayroll: boolean
): PayrollWorkspaceTask[] {
  return [
    { id: 'runs', label: 'Payroll Runs', workspace: 'runs' },
    { id: 'monthly-inputs', label: 'Monthly Exceptions', workspace: 'adjustments' },
    { id: 'arrears', label: 'Arrears', workspace: 'adjustments' },
    { id: 'contribution-rules', label: 'Company Rules', workspace: 'setup' },
    { id: 'employee-settings', label: 'Employee Eligibility', workspace: 'setup' },
    { id: 'unpaid-leave', label: 'Unpaid Leave', workspace: 'setup' },
    { id: 'components', label: 'Payslip Display', workspace: 'setup' },
    { id: 'compliance', label: 'Employer Details', workspace: 'setup' },
    ...(readAllPayslips
      ? [{ id: 'payslips', label: 'Employee Payslips', workspace: 'documents' as const }]
      : []),
    ...(exportPayroll
      ? [{ id: 'exports', label: 'Payroll Exports', workspace: 'documents' as const }]
      : []),
  ];
}
