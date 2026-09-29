import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollPageTour: TourDefinition = {
  id: 'payroll-processing-page',
  routePaths: ['payroll/pay'],
  steps: [
    {
      id: 'payroll-processing-sections',
      anchor: 'payroll.process.sections',
      title: 'Review payroll sections',
      body: 'Payroll Runs creates and processes draft cycles. Arrears, Employer & Statutory Details, Unpaid Leave Rules, and Salary Components provide the related payroll setup and review areas.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-run-cycle',
      anchor: 'payroll.cycles',
      title: 'Create or run a payroll cycle',
      body: 'Create Draft Cycle records a month and year for payroll processing. Run pay creates missing payslips and processes the selected draft cycle. Both actions change payroll records; this tour does not run them.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-export-options',
      anchor: 'payroll.process.sections',
      title: 'Download payroll exports',
      body: 'Payroll Exports provides monthly statutory files and India financial-year totals, including optional quarter totals and a Form 16 Part B preparation file. Choose the export period before downloading.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.export') ?? false,
    },
  ],
};
