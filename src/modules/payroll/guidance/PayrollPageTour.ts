import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollPageTour: TourDefinition = {
  id: 'payroll-processing-page',
  routePaths: ['payroll/pay'],
  steps: [
    {
      id: 'payroll-processing-sections',
      anchor: 'payroll.process.sections',
      title: 'Choose a payroll task',
      body: 'Payroll Runs prepares and reviews cycles. Monthly Adjustments holds exceptions and arrears. Payroll Setup contains company rules, recurring employee eligibility, unpaid leave and payslip display. Payslips & Exports provides finalized employee documents and authorized downloads. Configure salary and employee settings once; they carry forward until changed. Routine months are automatic, including approved unpaid leave. This tour does not calculate or change payroll.',
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
      body: 'After the tour, open Payroll Setup. Its vertical task menu separates Company Rules, Employee Eligibility, Unpaid Leave, Payslip Display and Employer Details. Employee eligibility and professional tax carry forward from their effective month; zero PT explicitly means no PT. Employee tax settings remain in Tax Administration. Use Monthly Adjustments only for period-specific exceptions. Historical unpaid usage is not charged again.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-employee-payslips',
      anchor: 'payroll.process.sections',
      title: 'View and download employee payslips',
      body: 'With company-wide payroll read access, open Payslips & Exports, then Employee Payslips. Select an employee and finalized period to view, download or print. Help beside the actions works with hover, keyboard focus or tap. Draft calculations and configuration blockers are reviewed in Payroll Runs. Unpaid-leave reports show finalized calculations, not opening balances.',
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
