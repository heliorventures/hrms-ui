import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminEmployeesPageTour: TourDefinition = {
  id: 'admin-employees-page',
  routePaths: ['hr/people', 'admin/employees'],
  steps: [
    {
      id: 'employees-list',
      anchor: 'employees.list',
      title: 'Review the employee directory',
      body: 'The list shows employee IDs, names, reporting managers, linked usernames, organization assignments, joining dates, and status. Values come from the current directory data.',
    },
    {
      id: 'employees-add-dialog',
      anchor: 'employees.add-trigger',
      title: 'Understand employee creation',
      body: 'Add Employee opens a form for a new employee and their organization assignments. Employee code and date of joining are fixed after creation. This tour does not create an employee.',
      isVisible: ({ canCapability }) =>
        (canCapability?.('route.hr.people') ?? false) ||
        (canCapability?.('route.admin.employees') ?? false),
    },
    {
      id: 'employees-edit-dialog',
      anchor: 'employees.edit-trigger',
      title: 'Understand employee updates',
      body: 'Edit opens the selected employee record so authorized directory users can update its editable details and assignments. This tour does not save employee changes.',
      isVisible: ({ canCapability }) =>
        (canCapability?.('route.hr.people') ?? false) ||
        (canCapability?.('route.admin.employees') ?? false),
    },
  ],
};
