import type { TourDefinition } from '../../../guidance/tourTypes';

export const timesheetPageTour: TourDefinition = {
  id: 'timesheet-page',
  routePaths: ['timesheet'],
  steps: [
    {
      id: 'timesheet-period',
      anchor: 'timesheet.period-view',
      title: 'Choose a date range',
      body: 'Switch between weekly, monthly, and custom date views. Previous, Today / This Period, and Next move through the selected range; the calendar and totals follow it.',
    },
    {
      id: 'timesheet-entries',
      anchor: 'timesheet.entries',
      title: 'Review work entries',
      body: 'The calendar groups entries by date and shows hours in the selected period. Editable drafts can be opened for review.',
    },
    {
      id: 'timesheet-export',
      anchor: 'timesheet.export',
      title: 'Export the current view',
      body: 'Export CSV downloads the visible entries with their dates, hours, project, task, notes, and status.',
    },
    {
      id: 'timesheet-entry-dialog',
      anchor: 'timesheet.add-entry',
      title: 'Understand an entry form',
      body: 'An entry needs a work date and hours; project, task, and notes provide context. The editable date range and approval locks still apply. This tour does not add or edit an entry.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.write') ?? false,
    },
    {
      id: 'timesheet-submit-week',
      anchor: 'timesheet.submit-week',
      title: 'Understand weekly approval',
      body: 'Submitting a week sends its entries into the approval workflow after the configured hour and edit-window checks pass. This tour does not submit the week.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.write') ?? false,
    },
    {
      id: 'timesheet-delete-confirmation',
      anchor: 'timesheet.entries',
      title: 'Understand entry removal',
      body: 'Eligible entries offer a Delete action followed by a confirmation prompt. Confirming removes that entry from the timesheet. This tour does not delete an entry.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.write') ?? false,
    },
  ],
};
