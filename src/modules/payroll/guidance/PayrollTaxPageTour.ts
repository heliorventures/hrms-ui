import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollTaxPageTour: TourDefinition = {
  id: 'payroll-tax-admin-page',
  routePaths: ['payroll/tax'],
  steps: [
    {
      id: 'payroll-tax-sections',
      anchor: 'payroll.tax.sections',
      title: 'Choose a tax administration section',
      body: 'Employee Tax & History sets each employee’s annual regime and withholding method with effective dates. A percentage override needs a component basis and HR reason. Record earlier earnings and TDS only when supplied; a blank deduction is unknown, not zero. Previous finalized payslips remain unchanged.',
      isVisible: ({ canCapability }) => canCapability?.('action.tax.manage') ?? false,
    },
    {
      id: 'payroll-tax-configuration',
      anchor: 'payroll.tax.configuration',
      title: 'Manage tax versions',
      body: 'Tax Versions and Income Tax Slabs maintain the declaration catalog. Annual projections display the specific published calculation version they use. Editing this catalog does not replace that calculation version. Use Employee Tax & History for effective employee settings.',
      isVisible: ({ canCapability }) => canCapability?.('action.tax.manage') ?? false,
    },
    {
      id: 'payroll-tax-submit-declaration',
      anchor: 'payroll.tax.sections',
      title: 'Submit an estimated declaration',
      body: 'The Submit Declaration section records an India fiscal year, optional tax regime, estimated gross income, and estimated deductions against the active tax configuration. Saving stores the employee declaration; this tour does not submit it.',
      isVisible: ({ canCapability }) =>
        (canCapability?.('action.tax.manage') ?? false) &&
        (canCapability?.('action.tax.submit') ?? false),
    },
  ],
};
