import { expect, it } from 'vitest';

import { taskNavigationLocation } from './taskNavigation';

it('preserves unrelated filters but clears the review when changing performance tasks', () => {
  const location = taskNavigationLocation(
    '/performance?tab=setup&review=review-1&year=2026',
    '/performance?tab=process'
  );
  const params = new URL(location, 'https://navigation.local').searchParams;
  expect(params.get('year')).toBe('2026');
  expect(params.get('tab')).toBe('process');
  expect(params.has('review')).toBe(false);
});

it('clears a prior task query when returning to the default task', () => {
  expect(
    taskNavigationLocation('/workplace/assets?tab=history&search=Laptop', '/workplace/assets')
  ).toBe('/workplace/assets?search=Laptop');
});

it('opens other routes using their own context', () => {
  expect(taskNavigationLocation('/hr/leaves?status=pending', '/admin/leave-settings')).toBe(
    '/admin/leave-settings'
  );
});
