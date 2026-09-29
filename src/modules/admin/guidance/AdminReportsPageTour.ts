import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const REPORT_READ_PERMISSIONS = [
  'attendance:read',
  'employee:read',
  'expense:read',
  'leave:read',
  'payroll:read',
  'timesheet:read',
  'travel:read',
] as const;

const canReadCompanyReport = (canScopedPermission: TourContext['canScopedPermission']) =>
  Boolean(
    canScopedPermission &&
    REPORT_READ_PERMISSIONS.some((permission) => canScopedPermission(permission, ['ALL']))
  );

export const adminReportsPageTour: TourDefinition = {
  id: 'admin-reports-page',
  routePaths: ['admin/reports'],
  steps: [
    {
      id: 'admin-reports-filters',
      anchor: 'admin.reports.filters',
      title: 'Choose a report and its filters',
      body: 'The report list includes only company reports available to your account. Choose a date range, and for tabular reports enter an employee name or code and select Apply. The daily attendance report has its own employee search.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.reports')) &&
        canReadCompanyReport(canScopedPermission),
    },
    {
      id: 'admin-reports-output',
      anchor: 'admin.reports.output',
      title: 'Review results and exports',
      body: 'Review the matching report rows and page through results. For tabular reports, use Refresh to reload the current view or Download CSV to request the complete matching report. The daily attendance report provides its own CSV export. This tour does not trigger report queries or export data.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.reports')) &&
        canReadCompanyReport(canScopedPermission),
    },
  ],
};
