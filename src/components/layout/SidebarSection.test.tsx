// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { NAVIGATION_SECTIONS } from '../../navigation/navigationModel';

import SidebarSection from './SidebarSection';

afterEach(cleanup);
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
