import type { TourDefinition } from '../../../guidance/tourTypes';

export const hrHomePageTour: TourDefinition = {
  id: 'hr-home-page',
  routePaths: ['hr'],
  steps: [
    {
      id: 'hr-workbench-links',
      anchor: 'hr.workbench-links',
      title: 'Open the HR workbench pages',
      body: 'Use these links to open the people directory, leave approvals, attendance management, timesheet approvals, and project access. The cards show only destinations available to your account.',
    },
  ],
};
