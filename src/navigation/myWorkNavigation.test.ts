import { expect, it } from 'vitest';

import { NAVIGATION_DESTINATIONS } from './navigationModel';
import { activeNavigationSection, groupNavigationDestinations } from './navigationSelectors';

it('groups personal work and keeps performance outside Workplace', () => {
  const work = groupNavigationDestinations(NAVIGATION_DESTINATIONS).find(
    (group) => group.section.key === 'myWork'
  );
  expect(work?.destinations.map((item) => item.label)).toEqual([
    'My Tasks',
    'Notifications',
    'Completed / Archive',
  ]);
  expect(NAVIGATION_DESTINATIONS.find((item) => item.path === '/performance')?.sidebar).toBe(
    'primary'
  );
  expect(NAVIGATION_DESTINATIONS.some((item) => item.path === '/workplace/performance')).toBe(
    false
  );
  expect(activeNavigationSection('/notifications')).toBe('myWork');
});
