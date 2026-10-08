import type { TourDefinition } from '../../../guidance/tourTypes';

export const attendancePageTour: TourDefinition = {
  id: 'attendance-page',
  routePaths: ['attendance'],
  steps: [
    {
      id: 'attendance-period',
      anchor: 'attendance.month-controls',
      title: 'Choose an attendance month',
      body: 'Change the month or year to review attendance records for that period. Refresh reloads the current view.',
    },
    {
      id: 'attendance-summary',
      anchor: 'attendance.month-summary',
      title: 'Read the monthly summary',
      body: 'The summary counts completed workdays and time separately from incomplete punch segments.',
    },
    {
      id: 'attendance-records',
      anchor: 'attendance.records',
      title: 'Review attendance records',
      body: 'Each row shows punch times, completed duration, status, and available adjustment actions.',
    },
    {
      id: 'attendance-adjustment',
      anchor: 'attendance.adjust-trigger',
      title: 'Understand a missed punch adjustment',
      body: 'This opens the attendance adjustment form. It requires a work date and punch in and out dates and times. Self-service limits can apply; authorized regularizers can follow the policy shown in the form. This tour does not save an adjustment.',
      isVisible: ({ canCapability }) => canCapability?.('action.attendance.punch') ?? false,
    },
  ],
};
