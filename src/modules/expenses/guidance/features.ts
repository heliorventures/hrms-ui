import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const expenseGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['expenses'],
    anchor: 'expenses.sections',
    tabs: [
      {
        id: 'expenses',
        label: 'Expense claims',
        body: 'Submit a claim with required evidence, track status, and use the approval or payment actions your account permits.',
        isVisible: (c) =>
          Boolean(
            c.canScopedPermission?.('expense:read') ||
            (
              [
                'action.expense.submit',
                'action.expense.approve',
                'action.expense.manage',
                'action.expense.pay',
              ] as const
            ).some((p) => c.canCapability?.(p))
          ),
      },
      {
        id: 'travel',
        label: 'Travel requests',
        body: 'Request a trip with dates, route, estimated cost and supporting evidence; track the approval decision.',
        isVisible: (c) =>
          Boolean(
            c.canScopedPermission?.('travel:read') ||
            (
              ['action.travel.submit', 'action.travel.approve', 'action.travel.manage'] as const
            ).some((p) => c.canCapability?.(p))
          ),
      },
    ],
  },
];
export const expenseStepDestinations: Readonly<Record<string, StepDestination>> = {
  'expense-submit-claim': {
    tabId: 'expenses',
    keywords: ['claim expense', 'reimbursement', 'receipt', 'upload bill'],
  },
  'expense-approval-result': { tabId: 'expenses' },
  'expense-payment-result': { tabId: 'expenses' },
  'expense-category-management': { tabId: 'expenses' },
  'travel-submit-request': {
    tabId: 'travel',
    keywords: ['travel request', 'trip', 'supporting document'],
  },
  'travel-approval-result': { tabId: 'travel' },
};
