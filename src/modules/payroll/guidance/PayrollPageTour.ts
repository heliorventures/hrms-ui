import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollPageTour: TourDefinition = {
  id: 'payroll-processing-page',
  routePaths: ['payroll/pay'],
  steps: [
    {
      id: 'payroll-processing-sections',
      anchor: 'payroll.process.sections',
      title: 'Review payroll sections',
      body: 'Review Monthly Inputs and Contribution Rules before calculating a draft. Salary Components controls company payslip visibility. Advances settle salary already paid; they do not reduce earned salary.',
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
      id: 'payroll-export-options',
      anchor: 'payroll.process.sections',
      title: 'Download payroll exports',
      body: 'Annual and quarterly exports reconcile finalized payslips, imported source months and current-employer opening history. They exclude projections, leave unknown deductions blank and do not confirm tax remittance. Opening history spanning quarters needs a period breakdown. Choose the export period before downloading.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.export') ?? false,
    },
  ],
};
