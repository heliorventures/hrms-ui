import { describe, expect, it } from 'vitest';

import type { NavigationDestination, NavigationSection } from './navigationModel';
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
    path: '/admin/access',
    label: 'Roles & Permissions',
    keywords: ['rbac', 'security'],
    section: 'admin',
    sidebar: 'section',
    order: 3,
  },
];

describe('navigation selectors', () => {
  it('excludes destinations the session cannot access', () => {
    expect(
      accessibleDestinations(destinations, (path) => path !== '/admin/access').map(
        (item) => item.path
      )
    ).toEqual(['/dashboard', '/hr/leaves']);
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
      { section: sections[0], destinations: [destinations[1]] },
      { section: sections[1], destinations: [destinations[2]] },
    ]);
  });
});
