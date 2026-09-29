import type { TourDefinition } from '../../../guidance/tourTypes';

export const payrollCompensationPageTour: TourDefinition = {
  id: 'payroll-compensation-page',
  routePaths: ['payroll/compensation'],
  steps: [
    {
      id: 'payroll-compensation-sections',
      anchor: 'payroll.compensation.sections',
      title: 'Set up salary components and structures',
      body: 'Salary Components defines the earning and deduction items. Salary Structures groups components into a reusable pay structure. Assign Employee Salary links a structure and annual CTC to an employee.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-compensation-components',
      anchor: 'payroll.compensation.components',
      title: 'Review salary components',
      body: 'The components section lists the tenant salary items used by structures. Add or update a component there before including it in a salary structure.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
    {
      id: 'payroll-compensation-assign',
      anchor: 'payroll.compensation.sections',
      title: 'Assign a salary structure',
      body: 'In Assign Employee Salary, choose an employee and structure, set annual CTC and the effective date, then preview the breakup before saving. Saving changes that employee’s salary assignment; this tour does not save it.',
      isVisible: ({ canCapability }) => canCapability?.('action.payroll.manage') ?? false,
    },
  ],
};
