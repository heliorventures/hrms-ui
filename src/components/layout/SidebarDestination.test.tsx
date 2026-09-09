// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';

import { NAVIGATION_DESTINATIONS } from '../../navigation/navigationModel';

import SidebarDestination from './SidebarDestination';

afterEach(cleanup);

it('marks only the selected calendar, not the personal Leave overview', () => {
  render(
    <MemoryRouter initialEntries={['/leave/holidays']}>
      {NAVIGATION_DESTINATIONS.filter(
        (item) => item.path === '/leave' || item.path === '/leave/holidays'
      ).map((destination) => (
        <SidebarDestination
          key={destination.path}
          destination={destination}
          onNavigate={() => undefined}
        />
      ))}
    </MemoryRouter>
  );
  expect(screen.getByRole('link', { name: 'My Leave' }).getAttribute('aria-current')).toBeNull();
  expect(screen.getByRole('link', { name: 'Company Holidays' }).getAttribute('aria-current')).toBe(
    'page'
  );
});

it('marks only the domain report and keeps extra report selection parameters', () => {
  render(
    <MemoryRouter initialEntries={['/admin/reports?domain=leave&report=LEAVE_BALANCES']}>
      {NAVIGATION_DESTINATIONS.filter((item) => item.path.startsWith('/admin/reports')).map(
        (destination) => (
          <SidebarDestination
            key={destination.path}
            destination={destination}
            onNavigate={() => undefined}
          />
        )
      )}
    </MemoryRouter>
  );
  const selected = screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page');
  expect(selected.map((link) => link.getAttribute('href'))).toEqual([
    '/admin/reports?domain=leave',
  ]);
});
