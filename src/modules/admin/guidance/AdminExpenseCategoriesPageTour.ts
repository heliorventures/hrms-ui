import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminExpenseCategoriesPageTour: TourDefinition = {
  id: 'admin-expense-categories-page',
  routePaths: ['admin/expense-categories'],
  steps: [
    {
      id: 'expense-categories-tabs',
      anchor: 'expense-categories.tabs',
      title: 'Choose categories or policies',
      body: 'The Expense Categories tab maintains category names, fixed codes, and optional per-claim limits. Add opens a category form; edit and delete act on a row, with deletion confirmed before the category is removed.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.expenseCategories')),
    },
    {
      id: 'expense-policy-matching',
      anchor: 'expense-categories.tabs',
      title: 'Set expense policy matching',
      body: 'Expense Policies selects a category and matches employees by department, designation, role, or all employees. Add and edit open a policy form with scope and limits; deleting a policy removes that match. This tour does not open or save either form.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.expense.manage')),
    },
  ],
};
