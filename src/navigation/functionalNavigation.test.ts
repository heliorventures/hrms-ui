import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from '../auth/clientSession';
import { createPermissionService } from '../auth/permissionService';
import { availableReports } from '../modules/reports/reportCatalog';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { NAVIGATION_DESTINATIONS } from './navigationModel';
import {
  accessibleDestinations,
  activeNavigationSection,
  filterNavigationDestinations,
  groupNavigationDestinations,
} from './navigationSelectors';

function session(permission: string, scope: string): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set([permission]),
    permissionScopes: { [permission]: scope },
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

describe('functional navigation', () => {
  it('limits contextual report links to permitted domain reports at company scope', () => {
    const visible = (scope: string) => {
      const clientSession = session('leave:read', scope);
      return accessibleDestinations(
        NAVIGATION_DESTINATIONS,
        createPermissionService(clientSession).canRoute,
        (domain) => availableReports(clientSession, domain).length > 0
      )
        .filter((item) => item.reportDomain)
        .map((item) => item.path);
    };
    expect(visible('ALL')).toEqual(['/admin/reports?domain=leave']);
    expect(visible('SELF')).toEqual([]);
  });

  it('registers a real route and a canonical permission path for every menu destination', () => {
    const routes = new Set(
      TENANT_APP_ROUTES.flatMap((route) => (route.path ? [`/${route.path}`] : []))
    );
    for (const destination of NAVIGATION_DESTINATIONS) {
      expect(routes.has(destination.path.split('?')[0]), destination.path).toBe(true);
      expect(
        routes.has(destination.accessPath ?? destination.path.split('?')[0]),
        destination.path
      ).toBe(true);
    }
  });

  it('keeps approvals reachable without permission to open the personal overview', () => {
    const visible = accessibleDestinations(
      NAVIGATION_DESTINATIONS,
      createPermissionService(session('leave:approve', 'TEAM')).canRoute
    );
    const leave = groupNavigationDestinations(visible).find(
      (group) => group.section.key === 'leave'
    );
    expect(leave?.destinations.map((item) => item.path)).toEqual(['/hr/leaves']);
  });

  it.each([
    ['/hr/leaves', 'leave'],
    ['/admin/leave-settings', 'leave'],
    ['/hr/attendance', 'attendance'],
    ['/hr/timesheets', 'timesheets'],
    ['/organization/employees/123', 'people'],
    ['/hr/people', 'people'],
    ['/admin/reports?domain=leave&report=LEAVE_BALANCES', 'leave'],
    ['/admin/reports?domain=payroll', 'payroll'],
    ['/admin/reports', 'reports'],
    ['/workplace/workflows?domain=timesheets', 'timesheets'],
    ['/workplace/workflows?domain=expenses', 'expenses'],
    ['/workplace/workflows', 'leave'],
  ])('derives the functional parent for %s', (url, section) => {
    expect(activeNavigationSection(url)).toBe(section);
  });

  it('uses exact workflow access for contextual URLs and never grants editing to approvers', () => {
    const manager = accessibleDestinations(
      NAVIGATION_DESTINATIONS,
      createPermissionService(session('workflow:manage', 'ALL')).canRoute
    );
    expect(
      manager
        .filter((item) => item.path.startsWith('/workplace/workflows'))
        .map((item) => item.path)
    ).toEqual([
      '/workplace/workflows?domain=timesheets',
      '/workplace/workflows?domain=leave',
      '/workplace/workflows?domain=expenses',
    ]);
    const approver = accessibleDestinations(
      NAVIGATION_DESTINATIONS,
      createPermissionService(session('leave:approve', 'ALL')).canRoute
    );
    expect(approver.some((item) => item.path.startsWith('/workplace/workflows'))).toBe(false);
  });

  it('offers one employee-management search result while keeping the directory distinct', () => {
    const results = filterNavigationDestinations(NAVIGATION_DESTINATIONS, 'employees');
    expect(
      results
        .filter((item) => ['/hr/people', '/admin/employees'].includes(item.path))
        .map((item) => item.path)
    ).toEqual(['/admin/employees']);
    expect(results.some((item) => item.path === '/organization/employees')).toBe(true);
  });

  it('puts both calendars in Leave sidebar navigation', () => {
    const leave = groupNavigationDestinations(NAVIGATION_DESTINATIONS).find(
      (group) => group.section.key === 'leave'
    );
    expect(leave?.destinations.map((item) => item.path)).toEqual(
      expect.arrayContaining([
        '/leave',
        '/hr/leaves',
        '/leave/holidays',
        '/leave/team-calendar',
        '/admin/leave-settings',
      ])
    );
  });
});
