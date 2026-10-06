import type { HelpTaskContent } from '../../../guidance/help/helpTypes';

const evidenceFields = ['Supporting file: PDF, JPG or PNG, at most 6 MiB'];
export const expenseHelpTasks: Readonly<Record<string, HelpTaskContent>> = {
  'expense-submit-claim': {
    prerequisites: [
      'Expense submission access and an active category.',
      'Prepare a readable bill or receipt.',
    ],
    steps: [
      {
        id: 'open',
        text: 'Open Expenses & Travel, select Expense Claims and choose Submit Expense.',
        screenshotId: 'claims-design',
      },
      {
        id: 'details',
        text: 'Choose the category, enter the title, amount, currency and expense date. Review the matching policy limits.',
      },
      {
        id: 'link',
        text: 'If relevant, select the travel request to associate this claim with the trip.',
      },
      {
        id: 'evidence',
        text: 'Choose a receipt file. A receipt is required for every new expense, regardless of category or policy.',
      },
      {
        id: 'submit',
        text: 'Review the values and Submit. Wait while evidence uploads and the claim saves.',
      },
    ],
    requiredFields: ['Category', 'Title', 'Amount and currency', 'Expense date', ...evidenceFields],
    afterSave:
      'The claim appears in Expense Claims with its approval status and a supporting-file action.',
    checkStatus:
      'Review claimed and approved amounts, decision status and payment reference in the claim list.',
    recovery: [
      'Correct validation errors without closing the form. A submission retry reuses the uploaded file while the same file and account remain selected.',
      'Choose another file if it exceeds the size limit or uses an unsupported format.',
      'Historical claims may show no attachment; this does not waive evidence for new claims.',
    ],
  },
  'travel-submit-request': {
    prerequisites: [
      'Travel submission access.',
      'Prepare an itinerary, estimate or other supporting evidence.',
    ],
    steps: [
      {
        id: 'open',
        text: 'Open Expenses & Travel, select Travel Requests and choose Request Travel.',
        screenshotId: 'claims-design',
      },
      {
        id: 'route',
        text: 'Enter the origin, destination, start date and end date. The start must be today or later and the end must not precede it.',
      },
      {
        id: 'details',
        text: 'Enter the purpose and non-negative estimated cost, with up to two decimal places.',
      },
      { id: 'evidence', text: 'Choose the required supporting file, review the trip and Submit.' },
    ],
    requiredFields: [
      'Origin and destination',
      'Start and end dates',
      'Purpose',
      'Estimated cost',
      ...evidenceFields,
    ],
    afterSave: 'The request appears in Travel Requests awaiting the approval decision.',
    checkStatus:
      'Review the trip dates, estimate, status and supporting file. Expense claims can be linked to this trip.',
    recovery: [
      'Correct the field error and retry with the same selected file.',
      'A change of account cancels the previous form ownership; select evidence again.',
    ],
  },
};
