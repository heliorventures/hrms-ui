import type { TourDefinition } from '../../../guidance/tourTypes';

export const hrAttendanceManagementPageTour: TourDefinition = {
  id: 'hr-attendance-management-page',
  routePaths: ['hr/attendance'],
  steps: [
    {
      id: 'hr-attendance-filters',
      anchor: 'hr-attendance.filters',
      title: 'Filter attendance records',
      body: 'Choose a start and end date and search by employee name or code. The date range must be valid before it is applied.',
    },
    {
      id: 'hr-attendance-refresh',
      anchor: 'hr-attendance.refresh',
      title: 'Refresh the current attendance view',
      body: 'Refresh reloads records for the selected date range and employee filter.',
    },
    {
      id: 'hr-attendance-records',
      anchor: 'hr-attendance.records',
      title: 'Review attendance and regularization status',
      body: 'Records include employee, work date, punch times, duration, source, attendance status, and any regularization status. Page controls move through matching records.',
    },
    {
      id: 'hr-attendance-add-segment',
      anchor: 'hr-attendance.add-segment-trigger',
      title: 'Understand an attendance entry',
      body: 'Add segment opens a form for a work date, punch-in and punch-out dates and times, and a required 5 to 500 character reason for the audit record. Saving updates attendance. This tour does not add a segment.',
      isVisible: ({ canCapability }) => canCapability?.('action.attendance.regularize') ?? false,
    },
    {
      id: 'hr-attendance-adjust-segment',
      anchor: 'hr-attendance.adjust-trigger',
      title: 'Understand an attendance correction',
      body: 'Adjust opens the selected employee and date in the correction form. The work date is fixed for an existing segment; punch dates and times, the attendance window, and a required reason are checked before saving. A saved correction is recorded in the audit trail. This tour does not regularize attendance.',
      isVisible: ({ canCapability }) => canCapability?.('action.attendance.regularize') ?? false,
    },
  ],
};
