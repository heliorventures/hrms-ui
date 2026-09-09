// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { NAVIGATION_SECTIONS } from '../../navigation/navigationModel';

import SidebarSection from './SidebarSection';

afterEach(cleanup);
const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const setup = (flyout = true) => {
  const section = NAVIGATION_SECTIONS.find((item) => item.key === 'people');
  if (!section) throw new Error('Missing People section');
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <button type="button">Outside</button>
      <SidebarSection
        section={section}
        destinations={[
          { path: '/organization/employees', label: 'Employee Directory', keywords: [], order: 1 },
          { path: '/organization/chart', label: 'Org Chart', keywords: [], order: 2 },
        ]}
        flyout={flyout}
        onNavigate={vi.fn()}
      />
      <Location />
    </MemoryRouter>
  );
};

it('opens on hover without moving keyboard focus, and main click opens the first destination', async () => {
  const user = userEvent.setup();
  setup();
  screen.getByRole('button', { name: 'Outside' }).focus();
  const trigger = screen.getByRole('link', { name: 'People' });
  await user.hover(trigger);
  expect(await screen.findByRole('link', { name: 'Org Chart' })).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.getAllByText('People')).toHaveLength(1);
  await user.click(trigger);
  expect(screen.getByTestId('location').textContent).toBe('/organization/employees');
});

it('supports keyboard opening, Escape dismissal, and focus restoration', async () => {
  setup();
  const trigger = screen.getByRole('link', { name: 'People' });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'ArrowRight' });
  const first = await screen.findByRole('link', { name: 'Employee Directory' });
  await waitFor(() => expect(document.activeElement).toBe(first));
  fireEvent.keyDown(first, { key: 'Escape' });
  expect(screen.queryByRole('link', { name: 'Org Chart' })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('keeps touch submenus visible without requiring hover or a disclosure click', () => {
  setup(false);
  expect(screen.getByRole('link', { name: 'Org Chart' })).toBeTruthy();
});

it('dismisses hover content with Escape while retaining focus outside navigation', async () => {
  const user = userEvent.setup();
  setup();
  const outside = screen.getByRole('button', { name: 'Outside' });
  outside.focus();
  await user.hover(screen.getByRole('link', { name: 'People' }));
  expect(screen.getByRole('link', { name: 'Org Chart' })).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('link', { name: 'Org Chart' })).toBeNull();
  expect(document.activeElement).toBe(outside);
});
