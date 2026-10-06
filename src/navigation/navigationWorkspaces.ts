import type { NavigationDestination, NavigationSectionKey } from './navigationModel';

interface WorkspaceDefinition {
  label: string;
  paths: readonly string[];
}

const reports = (domain: string) => `/admin/reports?domain=${domain}`;
const rules = (domain: string) => `/workplace/workflows?domain=${domain}`;

/** Existing tasks remain searchable and deep-linkable; only parent menus are grouped. */
const WORKSPACES: Partial<Record<NavigationSectionKey, readonly WorkspaceDefinition[]>> = {
  myWork: [
    { label: 'My tasks', paths: ['/my-work/tasks'] },
    { label: 'Notifications', paths: ['/notifications'] },
    { label: 'Archive', paths: ['/my-work/completed'] },
  ],
  people: [
    {
      label: 'Employees',
      paths: ['/organization/employees', '/admin/employees', '/organization/profile-reviews'],
    },
    { label: 'Organization', paths: ['/organization/org-chart', '/organization/documents'] },
    { label: 'Reports', paths: [reports('people')] },
  ],
  attendance: [
    { label: 'My attendance', paths: ['/attendance'] },
    { label: 'Team attendance', paths: ['/hr/attendance', reports('attendance')] },
    { label: 'Policy', paths: ['/admin/attendance-policy'] },
  ],
  timesheets: [
    { label: 'My timesheets', paths: ['/timesheet'] },
    {
      label: 'Team',
      paths: ['/hr/timesheets', '/hr/timesheet-assignments', reports('timesheets')],
    },
    { label: 'Settings', paths: ['/admin/timesheet-settings', rules('timesheets')] },
  ],
  leave: [
    { label: 'My leave', paths: ['/leave'] },
    { label: 'Calendar & holidays', paths: ['/leave/team-calendar', '/leave/holidays'] },
    {
      label: 'Manage leave',
      paths: ['/hr/leaves', '/admin/leave-settings', reports('leave'), rules('leave')],
    },
  ],
  expenses: [
    { label: 'Claims & travel', paths: ['/expenses'] },
    { label: 'Policies', paths: ['/admin/expense-categories', rules('expenses')] },
  ],
  payroll: [
    { label: 'My pay', paths: ['/payroll/payslips'] },
    { label: 'Payroll', paths: ['/payroll/pay', reports('payroll')] },
    { label: 'Salary & tax', paths: ['/payroll/compensation', '/payroll/tax'] },
    { label: 'Benefits & reviews', paths: ['/workplace/benefits', '/workplace/compensation'] },
  ],
  performance: [
    { label: 'My reviews', paths: ['/performance?tab=my'] },
    { label: 'Team reviews', paths: ['/performance?tab=team'] },
    {
      label: 'Manage cycles',
      paths: ['setup', 'process', 'review', 'administration'].map(
        (tab) => `/performance?tab=${tab}`
      ),
    },
  ],
  assets: [
    { label: 'Inventory', paths: ['/workplace/assets'] },
    { label: 'Assignments', paths: ['/workplace/assets?tab=assignments'] },
    {
      label: 'History & settings',
      paths: ['/workplace/assets?tab=history', '/workplace/assets?tab=categories'],
    },
  ],
  settings: [
    { label: 'Access', paths: ['/admin/access'] },
    {
      label: 'Workflows & administration',
      paths: ['/workplace/workflows?workspace=settings&domain=leave', '/admin/settings'],
    },
    { label: 'Service health', paths: ['/admin/module-health'] },
  ],
};

export function workspaceDestinations(
  section: NavigationSectionKey,
  tasks: NavigationDestination[]
): NavigationDestination[] {
  const definitions = WORKSPACES[section];
  if (!definitions) return tasks.map((task) => ({ ...task, members: [task] }));
  const grouped = definitions.flatMap((definition) => {
    const members = definition.paths.flatMap((path) => tasks.filter((task) => task.path === path));
    const first = members[0];
    if (!first) return [];
    return [{ ...first, label: definition.label, members }];
  });
  const mappedPaths = new Set(grouped.flatMap((item) => item.members.map((member) => member.path)));
  return [
    ...grouped,
    ...tasks
      .filter((task) => !mappedPaths.has(task.path))
      .map((task) => ({ ...task, members: [task] })),
  ];
}
