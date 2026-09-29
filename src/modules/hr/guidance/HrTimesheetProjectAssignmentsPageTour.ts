import type { TourDefinition } from '../../../guidance/tourTypes';

export const hrTimesheetProjectAssignmentsPageTour: TourDefinition = {
  id: 'hr-timesheet-project-assignments-page',
  routePaths: ['hr/timesheet-assignments'],
  steps: [
    {
      id: 'hr-timesheet-project-assignment-editor',
      anchor: 'hr-timesheet-assignments.editor',
      title: 'Choose an employee and allowed projects',
      body: 'Select an employee, then choose the catalog projects they may use on timesheets. An empty selection means every active catalog project is allowed. Save Assignments stores the selection for that employee; this tour does not save changes.',
      isVisible: ({ canCapability }) => canCapability?.('action.timesheet.manage') ?? false,
    },
  ],
};
