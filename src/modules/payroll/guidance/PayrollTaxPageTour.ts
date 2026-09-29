import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollTaxPageTour: TourDefinition = {
  id: 'payroll-tax-admin-page',
  routePaths: ['payroll/tax'],
  steps: [
    {
      id: 'payroll-tax-sections',
      anchor: 'payroll.tax.sections',
      title: 'Choose a tax administration section',
      body: 'Tax Versions maintains active tax configurations. Income Tax Slabs and Deduction Sections define calculation inputs. Tax Computations is a read-only results view. Submit Declaration is available only to users with tax submission access.',
      isVisible: ({ canCapability }) => canCapability?.('action.tax.manage') ?? false,
    },
    {
      id: 'payroll-tax-configuration',
      anchor: 'payroll.tax.configuration',
      title: 'Manage tax versions',
      body: 'Review the listed tax configurations and use the form to create or update country, fiscal year, regime, and active status. Saving a version changes the tax configuration used by the tenant.',
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
