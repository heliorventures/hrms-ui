import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollPayPageTour: TourDefinition = {
  id: 'payroll-payslips-page',
  routePaths: ['payroll/payslips'],
  steps: [
    {
      id: 'payroll-pay-sections',
      anchor: 'payroll.pay.sections',
      title: 'Choose a pay section',
      body: 'Salary shows your current salary breakdown. Payslip lets you choose a pay period and view its payslip. Income Tax appears when your role can read tax details.',
    },
    {
      id: 'payroll-pay-salary-preview',
      anchor: 'payroll.pay.sections',
      title: 'Review your salary breakdown',
      body: 'After the tour, select Salary to see recurring earnings and annual CTC based on regular salary. Employer PF appears separately as Other, with the combined annual total below. Employer PF is excluded from payslip earnings and salary income tax. Monthly deductions and settlement amounts are shown on the payslip. Contact HR if the structure needs correction.',
    },
    {
      id: 'payroll-pay-payslip-period',
      anchor: 'payroll.pay.sections',
      title: 'Choose a payslip period',
      body: 'Open Payslip after the tour to review finalized earnings, deductions, LWP and net salary. A salary advance reduces the remaining payable amount, not earned salary. HR controls company-wide component visibility. A period without a finalized payslip is not available yet.',
    },
    {
      id: 'payroll-pay-income-tax',
      anchor: 'payroll.pay.sections',
      title: 'Review income tax details',
      body: 'Income Tax shows an April–March projection from your joining date, monthly salary components and slab details. Imported actuals and finalized payroll are distinguished from estimates. Earlier TDS stays Not provided until HR supplies it. Recorded deductions do not confirm government remittance. Contact HR about actual liability. Select this section after closing the tour.',
      isVisible: ({ canScopedPermission }) =>
        canScopedPermission?.('tax:read', ['SELF', 'TEAM', 'DEPARTMENT', 'ALL']) ?? false,
    },
    {
      id: 'payroll-pay-tax-declaration',
      anchor: 'payroll.pay.sections',
      title: 'Submit a tax declaration or proof',
      body: 'With tax submission access, choose a financial year in Income Tax, then open Declarations and proofs. Your assigned regime and financial year are shared with the projection. Save estimated gross income and deductions, or submit a deduction section, declared and actual amounts and proof file. HR changes your assigned regime; declaration estimates do not change payroll calculations. This tour does not submit records.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        (canScopedPermission?.('tax:read', ['SELF', 'TEAM', 'DEPARTMENT', 'ALL']) ?? false) &&
        (canCapability?.('action.tax.submit') ?? false),
    },
  ],
};
