import type { HelpTaskContent } from '../../../guidance/help/helpTypes';

const reportCommon = {
  prerequisites: ['Company-wide read access in the report own domain.'],
  requiredFields: ['Report', 'Inclusive start and end date'],
  afterSave:
    'Applying filters refreshes read-only report rows. CSV uses the same applied filters across all pages.',
  checkStatus:
    'Check the total row count, Previous/Next pages and CSV filter period. Organization labels describe current assignments.',
  recovery: [
    'Narrow the period or filters if more than 10,000 rows match the export.',
    'If a named option is missing, search its name; only your company options are available.',
    'Reload a failed request after checking the inline error.',
  ],
};
export const reportAndCategoryHelpTasks: Readonly<Record<string, HelpTaskContent>> = {
  'expense-category-create': {
    prerequisites: ['Expense management access.'],
    steps: [
      {
        id: 'open',
        text: 'Open Expense Categories & Policies, select Categories and choose Add.',
        screenshotId: 'expense-settings-design',
      },
      {
        id: 'fields',
        text: 'Enter Display Name and a unique Code. Optionally enter Max Amount Per Claim in the company currency.',
      },
      {
        id: 'save',
        text: 'Save and check the category row. Edit can change the name and limit, while the code remains fixed.',
      },
      {
        id: 'policy',
        text: 'Use the category policy action to create the employee applicability and approval rules. Every new claim requires a receipt.',
      },
    ],
    requiredFields: ['Display Name', 'Code'],
    afterSave: 'The category becomes available in expense submission.',
    checkStatus: 'Review its row, limit and matching policy.',
    recovery: [
      'Correct duplicate codes or invalid decimal limits.',
      'Create a new category if a different code is required. Review the confirmation before deleting a category.',
    ],
  },
  'claim-expense-report': {
    ...reportCommon,
    steps: [
      { id: 'open', text: 'Open Reports, choose Expenses & Travel, then Expense Claims.' },
      {
        id: 'period',
        text: 'Set the inclusive expense date range. Enter an employee name or code and Apply when needed.',
      },
      {
        id: 'filter',
        text: 'Find and choose Department, Location or Expense category; choose Approval status and Payment status. Select Apply report filters.',
      },
      {
        id: 'review',
        text: 'Inspect claimed amount, approved amount, approval and payment status. A blank approved amount means no approval amount has been recorded.',
      },
      {
        id: 'export',
        text: 'Use Previous/Next to review more rows, Refresh to reload the applied selection, and Download CSV for all matching rows. Clear filters resets the extra filter selection.',
      },
    ],
  },
  'travel-request-report': {
    ...reportCommon,
    steps: [
      { id: 'open', text: 'Open Reports, choose Expenses & Travel, then Travel Requests.' },
      {
        id: 'period',
        text: 'Set the date range. A trip is included if it overlaps the selected period, including either boundary.',
      },
      {
        id: 'filter',
        text: 'Apply an employee name/code search, Department, Location, Approval status or Origin or destination. Select Apply report filters.',
      },
      {
        id: 'review',
        text: 'Review trip dates, route, purpose, estimated cost and approval status. Use Previous/Next or Refresh as needed.',
      },
      {
        id: 'export',
        text: 'Download CSV exports all matching rows using the applied selection. Clear filters resets the extra selection.',
      },
    ],
  },
};
