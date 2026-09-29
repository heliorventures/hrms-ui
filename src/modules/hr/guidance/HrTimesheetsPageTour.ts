import type { TourDefinition } from '../../../guidance/tourTypes';

export const hrTimesheetsPageTour: TourDefinition = {
  id: 'hr-timesheets-page',
  routePaths: ['hr/timesheets'],
  steps: [
    {
      id: 'hr-timesheets-queue',
      anchor: 'hr-timesheets.filters',
      title: 'Review submitted timesheets',
      body: 'The queue shows the employee, week start, status, and pending workflow stage. A pending request may be waiting on another approver or may be your own submission.',
    },
    {
      id: 'hr-timesheets-filters',
      anchor: 'hr-timesheets.filters',
      title: 'Choose which submissions to review',
      body: 'Pending shows submissions waiting for a decision. All Statuses includes completed and rejected submissions as well.',
    },
    {
      id: 'hr-timesheets-details-dialog',
      anchor: 'hr-timesheets.preview-trigger',
      title: 'Review timesheet details',
      body: 'View opens timesheet details with the week, total hours, and submitted dates, hours, project codes, notes, and entry status. Pending submissions also show their usual Approve and Reject controls to authorized reviewers. This tour does not open the dialog or decide a submission.',
    },
    {
      id: 'hr-timesheets-approval',
      anchor: 'hr-timesheets.approve-trigger',
      title: 'Understand timesheet approval',
      body: 'Authorized reviewers can inspect a submission and approve it. If more workflow steps remain, the batch stays pending for the next approver; otherwise it is approved. This tour does not approve a timesheet.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.approve') ?? false,
    },
    {
      id: 'hr-timesheets-rejection',
      anchor: 'hr-timesheets.reject-trigger',
      title: 'Understand timesheet rejection',
      body: 'Reject opens a confirmation form. A trimmed rejection reason is recorded when supplied, and the submission is marked rejected. This tour does not reject a timesheet.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.approve') ?? false,
    },
  ],
};
