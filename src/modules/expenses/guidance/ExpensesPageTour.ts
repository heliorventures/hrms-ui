import type { TourDefinition } from '../../../guidance/tourTypes';

export const expensesPageTour: TourDefinition = {
  id: 'expenses-page',
  routePaths: ['expenses'],
  steps: [
    {
      id: 'expenses-sections',
      anchor: 'expenses.sections',
      title: 'Choose expense or travel requests',
      body: 'Expense Claims lists submitted claims and their workflow and payment status. Travel Requests lists trip requests and their approval status. Each section is shown only when your access allows it.',
    },
    {
      id: 'expense-submit-claim',
      anchor: 'expenses.submit-expense',
      title: 'Submit an expense claim',
      body: 'Submit Expense opens a form for category, title, amount, currency, expense date, and receipt. A linked travel request is optional; some categories require a receipt. Submission creates a claim for review. This tour does not submit a claim.',
      isVisible: ({ canCapability }) => canCapability?.('action.expense.submit') ?? false,
    },
    {
      id: 'travel-submit-request',
      anchor: 'expenses.sections',
      title: 'Request business travel',
      body: 'On Travel Requests, Request travel opens a form to record trip details for approval. Submitting creates a travel request in the configured workflow. This tour does not open or submit the form.',
      isVisible: ({ canCapability }) => canCapability?.('action.travel.submit') ?? false,
    },
    {
      id: 'expense-approval-result',
      anchor: 'expenses.claim-actions',
      title: 'Review expense approval results',
      body: 'For claims assigned to your approval scope, Approve opens a dialog with the claimed amount and an editable reimbursable amount. The approved amount cannot exceed the claim; a lower amount records a partial approval. If more approvers remain, the claim stays pending for the next step. Reject opens a reason form and records the rejection. This tour does not approve, reject, or change a claim.',
      isVisible: ({ canCapability }) => canCapability?.('action.expense.approve') ?? false,
    },
    {
      id: 'travel-approval-result',
      anchor: 'expenses.sections',
      title: 'Review travel approval results',
      body: 'On Travel Requests, assigned approvers can approve a request or reject it with a reason. Approval may remain pending when another workflow approver must act. The request status updates after the workflow action; this tour does not approve or reject it.',
      isVisible: ({ canCapability }) => canCapability?.('action.travel.approve') ?? false,
    },
    {
      id: 'expense-payment-result',
      anchor: 'expenses.claim-actions',
      title: 'Record an expense payment',
      body: 'When an approved claim is ready for payment, Mark paid asks for a payment reference and then updates the payment status. A reference is required. This tour does not mark a claim as paid.',
      isVisible: ({ canCapability }) => canCapability?.('action.expense.pay') ?? false,
    },
    {
      id: 'expense-category-management',
      anchor: 'expenses.category-settings',
      title: 'Configure expense categories',
      body: 'Configure categories opens the expense category administration page, where authorized users maintain categories and their claim rules.',
      isVisible: ({ canCapability }) => canCapability?.('action.expense.manage') ?? false,
    },
  ],
};
