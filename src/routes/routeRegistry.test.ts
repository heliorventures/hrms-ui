import { describe, expect, it } from 'vitest';

import { TENANT_APP_ROUTES } from './appRouteConfig';
import { OPS_CHILD_ROUTES } from './opsRouteConfig';

function routeInventory(routes: readonly Record<string, unknown>[]) {
  return routes.map((route) => {
    if (route.kind === 'redirect') {
      return {
        kind: route.kind,
        ...(route.index ? { index: true } : { path: route.path }),
        to: route.to,
        ...(route.tenantPath ? { tenantPath: route.tenantPath } : {}),
        ...(route.payrollCapability ? { payrollCapability: route.payrollCapability } : {}),
      };
    }

    return {
      kind: route.kind,
      path: route.path,
      title: route.title,
      ...(route.tenantPath ? { tenantPath: route.tenantPath } : {}),
      ...(route.payrollCapability ? { payrollCapability: route.payrollCapability } : {}),
    };
  });
}

describe('route registries', () => {
  it('preserves the complete tenant route inventory as page and redirect descriptors', () => {
    expect(routeInventory(TENANT_APP_ROUTES as unknown as Record<string, unknown>[])).toEqual([
      { kind: 'redirect', index: true, to: '/dashboard' },
      { kind: 'page', path: 'dashboard', title: 'Dashboard', tenantPath: '/dashboard' },
      { kind: 'page', path: 'insights', title: 'Insights', tenantPath: '/insights' },
      { kind: 'page', path: 'attendance', title: 'Attendance', tenantPath: '/attendance' },
      { kind: 'page', path: 'timesheet', title: 'Timesheet', tenantPath: '/timesheet' },
      {
        kind: 'page',
        path: 'leave/holidays',
        title: 'Company holidays',
        tenantPath: '/leave/holidays',
      },
      {
        kind: 'page',
        path: 'leave/team-calendar',
        title: 'Team leave calendar',
        tenantPath: '/leave/team-calendar',
      },
      { kind: 'page', path: 'leave', title: 'Leave', tenantPath: '/leave' },
      { kind: 'redirect', path: 'payroll', to: '/payroll/pay' },
      {
        kind: 'page',
        path: 'payroll/payslips',
        title: 'Payroll processing',
        payrollCapability: 'route.payroll.admin',
      },
      {
        kind: 'page',
        path: 'payroll/pay',
        title: 'Pay',
        payrollCapability: 'route.payroll.self',
      },
      {
        kind: 'page',
        path: 'payroll/tax',
        title: 'Tax administration',
        payrollCapability: 'route.payroll.tax',
      },
      {
        kind: 'page',
        path: 'payroll/compensation',
        title: 'Compensation setup',
        payrollCapability: 'route.payroll.compensation',
      },
      { kind: 'page', path: 'expenses', title: 'Expenses', tenantPath: '/expenses' },
      {
        kind: 'page',
        path: 'notifications',
        title: 'Notifications',
        tenantPath: '/notifications',
      },
      {
        kind: 'page',
        path: 'profile/settings',
        title: 'Profile and settings',
        tenantPath: '/profile/settings',
      },
      {
        kind: 'page',
        path: 'organization/employees',
        title: 'Organization people',
        tenantPath: '/organization/employees',
      },
      {
        kind: 'page',
        path: 'organization/employees/:employeeId',
        title: 'Employee details',
        tenantPath: '/organization/employees',
      },
      {
        kind: 'page',
        path: 'organization/org-chart',
        title: 'Organization chart',
        tenantPath: '/organization/org-chart',
      },
      {
        kind: 'page',
        path: 'organization/documents',
        title: 'Organization documents',
        tenantPath: '/organization/documents',
      },
      {
        kind: 'page',
        path: 'organization/profile-reviews',
        title: 'Profile reviews',
        tenantPath: '/organization/profile-reviews',
      },
      {
        kind: 'page',
        path: 'workplace/benefits',
        title: 'Benefits',
        tenantPath: '/workplace/benefits',
      },
      {
        kind: 'page',
        path: 'workplace/recruitment',
        title: 'Recruitment',
        tenantPath: '/workplace/recruitment',
      },
      {
        kind: 'page',
        path: 'workplace/onboarding',
        title: 'Onboarding and exit',
        tenantPath: '/workplace/onboarding',
      },
      {
        kind: 'page',
        path: 'workplace/performance',
        title: 'Performance',
        tenantPath: '/workplace/performance',
      },
      {
        kind: 'page',
        path: 'workplace/succession',
        title: 'Succession planning',
        tenantPath: '/workplace/succession',
      },
      {
        kind: 'page',
        path: 'workplace/compensation',
        title: 'Compensation',
        tenantPath: '/workplace/compensation',
      },
      {
        kind: 'page',
        path: 'workplace/learning',
        title: 'Learning',
        tenantPath: '/workplace/learning',
      },
      {
        kind: 'page',
        path: 'workplace/assets',
        title: 'Assets',
        tenantPath: '/workplace/assets',
      },
      {
        kind: 'page',
        path: 'workplace/grievance',
        title: 'Grievance and speak up',
        tenantPath: '/workplace/grievance',
      },
      {
        kind: 'page',
        path: 'workplace/workflows',
        title: 'Workflows',
        tenantPath: '/workplace/workflows',
      },
      { kind: 'page', path: 'hr', title: 'HR workbench', tenantPath: '/hr' },
      { kind: 'page', path: 'hr/people', title: 'HR people', tenantPath: '/hr/people' },
      {
        kind: 'page',
        path: 'hr/leaves',
        title: 'Leave approvals',
        tenantPath: '/hr/leaves',
      },
      {
        kind: 'page',
        path: 'hr/attendance',
        title: 'Attendance management',
        tenantPath: '/hr/attendance',
      },
      {
        kind: 'page',
        path: 'hr/timesheets',
        title: 'Timesheet approvals',
        tenantPath: '/hr/timesheets',
      },
      {
        kind: 'page',
        path: 'hr/timesheet-assignments',
        title: 'Timesheet project access',
        tenantPath: '/hr/timesheet-assignments',
      },
      {
        kind: 'redirect',
        path: 'hr/leave-settings',
        to: '/admin/leave-settings',
        tenantPath: '/admin/leave-settings',
      },
      {
        kind: 'redirect',
        path: 'hr/access',
        to: '/admin/access',
        tenantPath: '/admin/access',
      },
      {
        kind: 'page',
        path: 'admin/leave-settings',
        title: 'Leave settings',
        tenantPath: '/admin/leave-settings',
      },
      {
        kind: 'page',
        path: 'admin/expense-categories',
        title: 'Expense categories',
        tenantPath: '/admin/expense-categories',
      },
      {
        kind: 'page',
        path: 'admin/notifications',
        title: 'Notification administration',
        tenantPath: '/admin/notifications',
      },
      {
        kind: 'page',
        path: 'admin/employees',
        title: 'Employee administration',
        tenantPath: '/admin/employees',
      },
      {
        kind: 'page',
        path: 'admin/attendance-policy',
        title: 'Attendance policy',
        tenantPath: '/admin/attendance-policy',
      },
      {
        kind: 'page',
        path: 'admin/timesheet-settings',
        title: 'Timesheet settings',
        tenantPath: '/admin/timesheet-settings',
      },
      {
        kind: 'page',
        path: 'admin/reports',
        title: 'Reports',
        tenantPath: '/admin/reports',
      },
      {
        kind: 'page',
        path: 'admin/access',
        title: 'Roles and permissions',
        tenantPath: '/admin/access',
      },
      {
        kind: 'page',
        path: 'admin/settings',
        title: 'Administration settings',
        tenantPath: '/admin/settings',
      },
      {
        kind: 'page',
        path: 'admin/module-health',
        title: 'Module health',
        tenantPath: '/admin/module-health',
      },
    ]);
  });

  it('preserves the complete operations route inventory', () => {
    expect(routeInventory(OPS_CHILD_ROUTES as unknown as Record<string, unknown>[])).toEqual([
      { kind: 'redirect', index: true, to: '/ops/tenants' },
      { kind: 'page', path: 'tenants', title: 'Tenants' },
      { kind: 'page', path: 'modules', title: 'Modules and subscriptions' },
      { kind: 'page', path: 'billing', title: 'Billing' },
      { kind: 'page', path: 'operators', title: 'Operator users' },
      { kind: 'page', path: 'feature-flags', title: 'Feature flags' },
    ]);
  });

  it('keeps imports behind page loaders and redirects loader-free', () => {
    for (const route of [...TENANT_APP_ROUTES, ...OPS_CHILD_ROUTES] as unknown as Record<
      string,
      unknown
    >[]) {
      expect('element' in route).toBe(false);
      if (route.kind === 'page') {
        expect(route.load).toEqual(expect.any(Function));
      } else {
        expect('load' in route).toBe(false);
      }
    }
  });
});
