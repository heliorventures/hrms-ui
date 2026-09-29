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
      body: 'The directory shows work details and reporting information. Choose View details to open the employee profile, where private sections depend on your access.',
    },
  ],
};
