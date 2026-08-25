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
  { key: 'hr', label: 'HR', basePath: '/hr', icon: (() => null) as never, order: 1 },
  {
    key: 'admin',
    label: 'Admin',
    basePath: '/admin',
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
    section: 'hr',
    sidebar: 'section',
    order: 2,
  },
  {
    path: '/hr/attendance',
    label: 'Attendance Management',
    keywords: ['attendance', 'regularize', 'punches'],
    section: 'hr',
    sidebar: 'section',
    order: 3,
  },
  {
    path: '/admin/access',
    label: 'Roles & Permissions',
    keywords: ['rbac', 'security'],
    section: 'admin',
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
      permissionScopes: {},
      resourceScopes: {},
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    };
    const canRoute = createPermissionService(session).canRoute;

    expect(
      accessibleDestinations(NAVIGATION_DESTINATIONS, canRoute).map((destination) => destination.path)
    ).toContain('/hr/attendance');
    expect(
      accessibleDestinations(
        NAVIGATION_DESTINATIONS,
        createPermissionService({ ...session, permissions: new Set(['employee:manage']) }).canRoute
      ).map((destination) => destination.path)
    ).not.toContain('/hr/attendance');
  });

  it('places Attendance Management immediately after Leave Approvals in HR navigation', () => {
    const hrDestinations = NAVIGATION_DESTINATIONS.filter(
      (destination) => destination.section === 'hr'
    ).sort((left, right) => left.order - right.order);
    const leaveApprovalsIndex = hrDestinations.findIndex(
      (destination) => destination.path === '/hr/leaves'
    );

    expect(hrDestinations[leaveApprovalsIndex + 1]).toMatchObject({
      path: '/hr/attendance',
      label: 'Attendance Management',
    });
  });

  it('matches HR terminology without returning unrelated destinations', () => {
    expect(
      filterNavigationDestinations(destinations, 'time off', sections).map((item) => item.path)
    ).toEqual(['/hr/leaves']);
  });

  it('matches a section label when filtering destinations', () => {
    expect(
      filterNavigationDestinations(destinations, 'admin', sections).map((item) => item.path)
    ).toEqual(['/admin/access']);
  });

  it('selects the section for a nested active path', () => {
    expect(activeNavigationSection('/hr/leaves/request/123', sections)).toBe('hr');
  });

  it('groups accessible destinations in configured section order', () => {
    expect(groupNavigationDestinations(destinations, sections)).toEqual([
      { section: sections[0], destinations: [destinations[1], destinations[2]] },
      { section: sections[1], destinations: [destinations[3]] },
    ]);
  });
});
