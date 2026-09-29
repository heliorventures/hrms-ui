import type { TourDefinition } from '../../../guidance/tourTypes';

export const orgChartTour: TourDefinition = {
  id: 'organization-org-chart',
  routePaths: ['organization/org-chart'],
  steps: [
    {
      id: 'organization-chart-controls',
      anchor: 'organization-chart-controls',
      title: 'Search and arrange the chart',
      body: 'Find employees by name, code, department, or designation. Expand all or collapse reporting branches, and use zoom controls to adjust the chart size.',
    },
    {
      id: 'organization-chart-tree',
      anchor: 'organization-chart-tree',
      title: 'Follow reporting relationships',
      body: 'Select an employee name to open their profile. Branch controls show or hide direct reports; reporting data warnings identify missing manager references or cycles for HR follow-up.',
    },
  ],
};
