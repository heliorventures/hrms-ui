import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const payrollGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['payroll/payslips'],
    anchor: 'payroll.pay.sections',
    tabs: [
      {
        id: 'salary',
        label: 'Salary',
        body: 'Review the current salary breakup and annual employer cost.',
        isVisible: (c) => c.canScopedPermission?.('payroll:read') ?? false,
      },
      {
        id: 'payslip',
        label: 'Payslip',
        body: 'Choose a finalized pay period, inspect earnings and deductions, then download your payslip.',
        isVisible: (c) => c.canScopedPermission?.('payroll:read') ?? false,
      },
      {
        id: 'incometax',
        label: 'Income tax',
        body: 'Choose a financial year to inspect tax calculations and permitted declarations.',
        isVisible: (c) => c.canScopedPermission?.('tax:read') ?? false,
      },
    ],
  },
  {
    routePaths: ['payroll/compensation'],
    anchor: 'payroll.compensation.sections',
    tabs: [
      {
        id: 'components',
        label: 'Salary components',
        body: 'Review earning, deduction and employer contribution definitions.',
      },
      {
        id: 'structures',
        label: 'Salary structures',
        body: 'Group configured components into reusable salary structures.',
      },
      {
        id: 'assignments',
        label: 'Employee salary assignment',
        body: 'Select employee, structure, annual CTC and effective date. Preview before saving.',
      },
    ],
  },
  {
    routePaths: ['payroll/tax'],
    anchor: 'payroll.tax.sections',
    tabs: [
      {
        id: 'employee-settings',
        label: 'Employee tax and history',
        body: 'Set effective employee tax settings and record supplied earlier earnings and TDS.',
        isVisible: (c) => c.canCapability?.('action.tax.manage') ?? false,
      },
      {
        id: 'configuration',
        label: 'Tax versions',
        body: 'Inspect and maintain versioned declaration configuration.',
      },
      {
        id: 'slabs',
        label: 'Income tax slabs',
        body: 'Review slab bounds, rates and tax version.',
      },
      {
        id: 'deductions',
        label: 'Deduction sections',
        body: 'Maintain allowed deduction sections.',
        isVisible: (c) => c.canCapability?.('action.tax.manage') ?? false,
      },
      {
        id: 'computations',
        label: 'Tax computations',
        body: 'Inspect calculations for the selected employee and year.',
      },
      {
        id: 'declaration',
        label: 'Tax declaration',
        body: 'Provide the fiscal year and estimated income or deductions before saving.',
        isVisible: (c) => c.canCapability?.('action.tax.submit') ?? false,
      },
    ],
  },
];
export const payrollStepDestinations: Readonly<Record<string, StepDestination>> = {
  'payroll-pay-salary-preview': { tabId: 'salary' },
  'payroll-pay-payslip-period': { tabId: 'payslip' },
  'payroll-pay-income-tax': { tabId: 'incometax' },
  'payroll-pay-tax-declaration': { tabId: 'incometax' },
  'payroll-compensation-components': { tabId: 'components' },
  'payroll-compensation-assign': { tabId: 'assignments' },
  'payroll-tax-configuration': { tabId: 'configuration' },
  'payroll-tax-submit-declaration': { tabId: 'declaration' },
};
