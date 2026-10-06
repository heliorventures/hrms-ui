import type { TourDefinition } from '../../../guidance/tourTypes';

export const organizationEmployeesTour: TourDefinition = {
  id: 'organization-employees',
  routePaths: ['organization/employees'],
  steps: [
    {
      id: 'organization-employees-search',
      anchor: 'organization-employees-search',
      title: 'Find an employee',
      body: 'Search by name, employee code, status, employment type, department, designation, or reporting manager.',
    },
    {
      id: 'organization-employees-results',
      anchor: 'organization-employees-results',
      title: 'Open an employee profile',
      body: 'Choose an employee card to show work details and reporting information. Scroll or use the previous and next controls to browse; arrow keys move focus between cards. Choose Open profile for the selected employee, where private sections depend on your access.',
    },
  ],
};
