import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollPageTour: TourDefinition = {
  id: 'payroll-processing-page',
  routePaths: ['payroll/pay'],
  steps: [
    {
      id: 'payroll-processing-sections',
      anchor: 'payroll.process.sections',
      title: 'Review payroll sections',
      body: 'Configure effective salary, company Contribution Rules, Employee Settings and employee tax settings once. Calculate draft prepares routine months automatically, including approved unpaid leave. Use Monthly Inputs only for exceptions such as incentives, advances or reasoned overrides. Missing configuration appears in the employee review; September imported source amounts stay unchanged.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-run-cycle',
      anchor: 'payroll.cycles',
      title: 'Calculate, review and lock a payroll cycle',
      body: 'Calculate draft can be repeated while the cycle stays editable. Expand included arrears to check each amount and reason; drafts do not consume them. Review employees and acknowledge provisional tax when history is incomplete. Finalize & Lock creates payslips, applies arrears once and prevents recalculation. This tour does not calculate or finalize payroll.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-effective-settings',
      anchor: 'payroll.process.sections',
      title: 'Review effective contribution and unpaid leave rules',
      body: 'Employee Settings records PF and ESI eligibility from an effective month and carries it forward. Unpaid Leave Rules shows the company divisor effective in the selected month. Historical unpaid usage is not charged again. Recalculate an editable draft after configuration changes.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-employee-payslips',
      anchor: 'payroll.process.sections',
      title: 'View and download employee payslips',
      body: 'With company-wide payroll read access, open Employee Payslips and select an employee and finalized period to view or download the PDF. Draft calculations are reviewed in Payroll Runs. Unpaid-leave reports show finalized payroll calculations, not opening leave balances.',
      isVisible: ({ canScopedPermission }) =>
        canScopedPermission?.('payroll:read', ['ALL']) ?? false,
    },
    {
      id: 'payroll-export-options',
      anchor: 'payroll.process.sections',
      title: 'Download payroll exports',
      body: 'Annual and quarterly exports reconcile finalized payslips, imported source months and current-employer opening history. They exclude projections, leave unknown deductions blank and do not confirm tax remittance. Opening history spanning quarters needs a period breakdown. Choose the export period before downloading.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.export') ?? false,
    },
  ],
};
