import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from '../auth/clientSession';
import { createPermissionService } from '../auth/permissionService';

import {
  NAVIGATION_DESTINATIONS,
  type NavigationDestination,
  type NavigationSection,
} from './navigationModel';
import {
  accessibleDestinations,
  activeNavigationSection,
  filterNavigationDestinations,
  groupNavigationDestinations,
} from './navigationSelectors';

const sections: NavigationSection[] = [
  { key: 'leave', label: 'Leave', icon: (() => null) as never, order: 1 },
  {
    key: 'settings',
    label: 'Settings',
    icon: (() => null) as never,
    order: 2,
  },
];

const destinations: NavigationDestination[] = [
  { path: '/dashboard', label: 'Dashboard', keywords: ['home'], order: 1 },
  {
    path: '/hr/leaves',
    label: 'Leave Approvals',
    keywords: ['pending', 'time off'],
    section: 'leave',
    sidebar: 'section',
    order: 2,
  },
  {
    path: '/hr/attendance',
    label: 'Attendance Management',
    keywords: ['attendance', 'regularize', 'punches'],
    section: 'leave',
    sidebar: 'section',
    order: 3,
  },
  {
    path: '/admin/access',
    label: 'Roles & Permissions',
    keywords: ['rbac', 'security'],
    section: 'settings',
    sidebar: 'section',
    order: 4,
  },
];

describe('navigation selectors', () => {
  it('excludes destinations the session cannot access', () => {
    expect(
      accessibleDestinations(destinations, (path) => path !== '/admin/access').map(
        (item) => item.path
      )
    ).toEqual(['/dashboard', '/hr/leaves', '/hr/attendance']);
  });

  it('shows Attendance Management only for the exact route permission', () => {
    const session: ParsedClientSession = {
      jwtRoles: [],
      permissions: new Set(['attendance:regularize']),
      permissionScopes: { 'attendance:regularize': 'TEAM' },
      resourceScopes: {},
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    };
    const { canRoute } = createPermissionService(session);

    expect(
      accessibleDestinations(NAVIGATION_DESTINATIONS, canRoute).map(
        (destination) => destination.path
      )
    ).toContain('/hr/attendance');
    expect(
      accessibleDestinations(
        NAVIGATION_DESTINATIONS,
        createPermissionService({ ...session, permissions: new Set(['employee:manage']) }).canRoute
      ).map((destination) => destination.path)
    ).not.toContain('/hr/attendance');
  });

  it('labels employee pay and company payroll routes by their actual authority', () => {
    const labelsByPath = new Map(
      NAVIGATION_DESTINATIONS.map((destination) => [destination.path, destination.label])
    );

    expect(labelsByPath.get('/payroll/payslips')).toBe('Payslips & Tax');
    expect(labelsByPath.get('/payroll/pay')).toBe('Payroll Processing');
    expect(labelsByPath.get('/payroll/tax')).toBe('Tax Settings');
  });

  it('matches HR terminology without returning unrelated destinations', () => {
    expect(
      filterNavigationDestinations(destinations, 'time off', sections).map((item) => item.path)
    ).toEqual(['/hr/leaves']);
  });

  it('matches a section label when filtering destinations', () => {
    expect(
      filterNavigationDestinations(destinations, 'settings', sections).map((item) => item.path)
    ).toEqual(['/admin/access']);
  });

  it('selects the section for a nested active path', () => {
    expect(activeNavigationSection('/hr/leaves/request/123', destinations)).toBe('leave');
  });

  it('groups accessible destinations in configured section order', () => {
    expect(groupNavigationDestinations(destinations, sections)).toEqual([
      { section: sections[0], destinations: [destinations[1], destinations[2]] },
      { section: sections[1], destinations: [destinations[3]] },
    ]);
  });
});
