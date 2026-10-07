// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { NAVIGATION_SECTIONS } from '../../navigation/navigationModel';

import SidebarSection from './SidebarSection';

afterEach(cleanup);
it('marks the owning module as current when opening a former Settings approval link', () => {
  const sections = NAVIGATION_SECTIONS.filter((item) => ['leave', 'settings'].includes(item.key));
  render(
    <MemoryRouter initialEntries={['/workplace/workflows?workspace=settings&domain=leave']}>
      {sections.map((section) => (
        <SidebarSection
          key={section.key}
          section={section}
          destinations={[
            {
              path: section.key === 'leave' ? '/leave' : '/admin/settings',
              label: 'Open',
              keywords: [],
              order: 1,
            },
          ]}
          flyout
          onNavigate={vi.fn()}
        />
      ))}
    </MemoryRouter>
  );
  expect(screen.getByRole('link', { name: 'Leave' }).getAttribute('aria-current')).toBe('true');
  expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBeNull();
});

it('opens a desktop submenu on hover and closes with Escape', async () => {
  const user = userEvent.setup();
  const section = NAVIGATION_SECTIONS.find((item) => item.key === 'people');
  if (!section) throw new Error('People navigation is missing');
  render(
    <MemoryRouter>
      <SidebarSection
        section={section}
        destinations={[
          { path: '/organization/employees', label: 'Employees', keywords: [], order: 1 },
        ]}
        flyout
        onNavigate={vi.fn()}
      />{' '}
    </MemoryRouter>
  );
  const trigger = screen.getByRole('link', { name: 'People' });
  expect(screen.queryByRole('link', { name: 'Employees' })).toBeNull();
  trigger.focus();
  await user.keyboard('{ArrowRight}');
  const link = screen.getByRole('link', { name: 'Employees' });
  expect(link.closest('[data-popover-panel]')?.parentElement).toBe(document.body);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('link', { name: 'Employees' })).toBeNull());
  expect(document.activeElement).toBe(trigger);
});
