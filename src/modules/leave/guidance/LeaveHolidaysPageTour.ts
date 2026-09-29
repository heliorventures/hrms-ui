import type { TourDefinition } from '../../../guidance/tourTypes';

export const leaveHolidaysPageTour: TourDefinition = {
  id: 'leave-holidays-page',
  routePaths: ['leave/holidays'],
  steps: [
    {
      id: 'leave-holidays-navigation',
      anchor: 'leave.holidays-navigation',
      title: 'Navigate leave pages',
      body: 'Home opens the dashboard and Leave home returns to balances and requests.',
    },
    {
      id: 'leave-holidays-year',
      anchor: 'leave.holidays-year',
      title: 'Choose a holiday year',
      body: 'Select a year to filter the company holiday list. The list is read-only and shows the calendar and holiday type when available.',
    },
    {
      id: 'leave-holidays-list',
      anchor: 'leave.holidays-list',
      title: 'Review company holidays',
      body: 'This list contains company holidays returned for the selected year. Use Leave home to return to your leave balances and requests.',
    },
  ],
};
