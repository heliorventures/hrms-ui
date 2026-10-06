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
      id: 'claim-expense-report',
      anchor: 'admin.reports.filters',
      title: 'Claim expense reports',
      body: 'Choose Expenses & Travel and Expense Claims. Apply date, employee, approval and payment status, category, department and location filters. Row results and CSV use the same applied filters. Approved amounts remain blank until decided; location and organization labels describe current assignments. Narrow the filters if export exceeds 10,000 rows.',
      destination: { path: '/admin/reports?domain=expenses&report=EXPENSE_CLAIMS' },
      isVisible: ({ canScopedPermission }) =>
        canScopedPermission?.('expense:read', ['ALL']) ?? false,
    },
    {
      id: 'travel-request-report',
      anchor: 'admin.reports.filters',
      title: 'Travel request reports',
      body: 'Choose Expenses & Travel and Travel Requests. The date range includes trips overlapping the selected dates. Apply employee, approval status, department, location or origin/destination filters, then review the results or export CSV. The export uses the applied filter snapshot.',
      destination: { path: '/admin/reports?domain=expenses&report=TRAVEL_REQUESTS' },
      isVisible: ({ canScopedPermission }) =>
        canScopedPermission?.('travel:read', ['ALL']) ?? false,
    },
    {
      id: 'admin-reports-filters',
      anchor: 'admin.reports.filters',
      title: 'Choose a report and its filters',
      body: 'The report list includes company reports allowed by your own domain read permissions with ALL scope. Choose an inclusive date range and apply an employee name or code search. Expense claims can also filter department, location, category, approval, and payment status. Travel requests can filter department, location, approval, and origin or destination, and include trips overlapping the period. Apply report filters saves the filter selection; Clear filters resets it. Organization labels reflect current assignments.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.reports')) &&
        canReadCompanyReport(canScopedPermission),
    },
    {
      id: 'admin-reports-output',
      anchor: 'admin.reports.output',
      title: 'Review results and exports',
      body: 'Review the matching rows and use Previous or Next for more results. Refresh reloads the applied filter. Download CSV exports the same filter across all pages. Expense and travel exports above 10,000 records ask you to narrow the filters. Claimed and approved amounts are separate; a blank approved amount means approval has not recorded one. The daily attendance report has its own CSV export.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.reports')) &&
        canReadCompanyReport(canScopedPermission),
    },
  ],
};
