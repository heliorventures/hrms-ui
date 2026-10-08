import type { TourDefinition } from '../../../guidance/tourTypes';

export const leaveHolidaysPageTour: TourDefinition = {
  id: 'leave-holidays-page',
  routePaths: ['leave/holidays'],
  steps: [
    {
      id: 'leave-holidays-navigation',
      anchor: 'leave.team-calendar-navigation',
      title: 'Leave calendar and holidays',
      body: 'Team leave and holiday details share this workspace. Use the Leave menu for personal requests and management tasks.',
    },
    {
      id: 'leave-holidays-year',
      anchor: 'leave.holidays-year',
      title: 'Choose a holiday year',
      body: 'Select a month and year. Holiday details show the company calendar and category when available.',
    },
    {
      id: 'leave-holidays-list',
      anchor: 'leave.holidays-list',
      title: 'Review company holidays',
      body: 'Read holiday details for the selected month alongside team leave. The calendar and category describe each company holiday.',
    },
  ],
};
