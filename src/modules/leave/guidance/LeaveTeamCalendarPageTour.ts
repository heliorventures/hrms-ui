import type { TourDefinition } from '../../../guidance/tourTypes';

export const leaveTeamCalendarPageTour: TourDefinition = {
  id: 'leave-team-calendar-page',
  routePaths: ['leave/team-calendar'],
  steps: [
    {
      id: 'leave-team-calendar-navigation',
      anchor: 'leave.team-calendar-navigation',
      title: 'Leave calendar and holidays',
      body: 'Review team leave and holiday details together. Use the Leave menu to open personal requests or management tasks.',
    },
    {
      id: 'leave-team-calendar-controls',
      anchor: 'leave.team-calendar-controls',
      title: 'Choose a calendar month',
      body: 'Move between months or select a month and year. Choose the compact leave list or the monthly calendar. Refresh reloads this period.',
    },
    {
      id: 'leave-team-calendar-grid',
      anchor: 'leave.team-calendar-grid',
      title: 'Read the team calendar',
      body: 'The list shows ten requests at a time, with search, status filters and pagination. The monthly calendar shows approved leave by employee and day.',
    },
  ],
};
