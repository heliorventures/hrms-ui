import type { TourDefinition } from '../../../guidance/tourTypes';

export const leaveTeamCalendarPageTour: TourDefinition = {
  id: 'leave-team-calendar-page',
  routePaths: ['leave/team-calendar'],
  steps: [
    {
      id: 'leave-team-calendar-navigation',
      anchor: 'leave.team-calendar-navigation',
      title: 'Navigate leave pages',
      body: 'Home opens the dashboard and Leave home returns to balances and requests.',
    },
    {
      id: 'leave-team-calendar-controls',
      anchor: 'leave.team-calendar-controls',
      title: 'Choose a calendar month',
      body: 'Move between months or select a month and year. Refresh reloads the team calendar.',
    },
    {
      id: 'leave-team-calendar-grid',
      anchor: 'leave.team-calendar-grid',
      title: 'Read the team calendar',
      body: 'The calendar displays approved leave by employee and day. Holiday shading and leave-type colors are explained in the legend.',
    },
  ],
};
