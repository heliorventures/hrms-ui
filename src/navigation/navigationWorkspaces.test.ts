import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from '../auth/clientSession';
import { createPermissionService } from '../auth/permissionService';

import { hasDestinationPermission } from './navigationAuthorization';
import { NAVIGATION_DESTINATIONS } from './navigationModel';
import {
  accessibleDestinations,
  activeNavigationDestination,
  groupNavigationDestinations,
} from './navigationSelectors';

const visibleFor = (permission: string, scope: string) => {
  const session: ParsedClientSession = {
    jwtRoles: [],
    permissions: new Set([permission]),
    permissionScopes: { [permission]: scope },
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
  const permissions = createPermissionService(session);
  return accessibleDestinations(NAVIGATION_DESTINATIONS, permissions.canRoute).filter(
    (destination) => hasDestinationPermission(destination, permissions)
  );
};

describe('approved navigation workspaces', () => {
  it('limits every module to four destinations and retains every underlying task', () => {
    const groups = groupNavigationDestinations(NAVIGATION_DESTINATIONS);
    for (const group of groups) {
      expect(group.destinations.length, group.section.label).toBeLessThanOrEqual(4);
      const tasks = group.destinations.flatMap((workspace) => workspace.members ?? [workspace]);
      const expected = NAVIGATION_DESTINATIONS.filter(
        (task) => task.section === group.section.key && task.sidebar === 'section'
      );
      expect(tasks.map((task) => task.path).sort()).toEqual(
        expected.map((task) => task.path).sort()
      );
    }
  });

  it.each([
    ['performance:self', 'SELF', 'my'],
    ['performance:evaluate', 'TEAM', 'team'],
    ['performance:manage', 'ALL', 'setup'],
  ])('filters performance tasks for %s', (permission, scope, tab) => {
    const visible = visibleFor(permission, scope);
    const groups = groupNavigationDestinations(visible).find(
      (group) => group.section.key === 'performance'
    );
    expect(groups?.destinations).toHaveLength(1);
    expect(activeNavigationDestination('/performance', visible)?.path).toBe(
      `/performance?tab=${tab}`
    );
    if (permission !== 'performance:manage')
      expect(
        groups?.destinations
          .flatMap((item) => item.members ?? [])
          .some((item) => item.path.includes('setup'))
      ).toBe(false);
  });

  it('keeps assigned assets reachable without exposing inventory or category management', () => {
    const visible = visibleFor('assets:self', 'SELF');
    const paths = visible.filter((item) => item.section === 'assets').map((item) => item.path);
    expect(paths).toEqual(['/workplace/assets?tab=assignments', '/workplace/assets?tab=history']);
    expect(activeNavigationDestination('/workplace/assets', visible)?.path).toBe(
      '/workplace/assets?tab=assignments'
    );
  });

  it('keeps leave approval rules in Leave, including old Settings links', () => {
    expect(
      activeNavigationDestination('/workplace/workflows?workspace=settings&domain=leave')?.section
    ).toBe('leave');
    expect(
      NAVIGATION_DESTINATIONS.filter((item) => item.section === 'settings').some((item) =>
        item.path.startsWith('/workplace/workflows')
      )
    ).toBe(false);
  });
});
