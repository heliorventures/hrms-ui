// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import OpsLayout from './OpsLayout';

const authState = vi.hoisted(() => ({
  logoutOps: vi.fn<[], Promise<void>>(),
  opsUser: { email: 'operator@example.com' },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

const NAVIGATION_ITEMS = [
  ['Tenants', '/ops/tenants'],
  ['Modules & subscriptions', '/ops/modules'],
  ['Billing', '/ops/billing'],
  ['Operator users', '/ops/operators'],
  ['Feature flags', '/ops/feature-flags'],
] as const;

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

function renderLayout(initialEntry = '/ops/tenants') {
  document.body.innerHTML = '<div id="root"></div>';
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <LocationProbe />
      <Routes>
        <Route path="/ops" element={<OpsLayout />}>
          <Route path="*" element={<h1>Operator workspace</h1>} />
        </Route>
        <Route path="/ops/login" element={<h1>Operator login</h1>} />
        <Route path="/dashboard" element={<h1>Employee dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
    { container: document.getElementById('root') ?? undefined }
  );
}

beforeEach(() => {
  authState.logoutOps.mockReset();
  authState.logoutOps.mockResolvedValue(undefined);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('OpsLayout', () => {
  it('provides a focus-visible skip link and a labelled programmatic main target', () => {
    renderLayout();

    const skipLink = screen.getByRole('link', { name: 'Skip to operator content' });
    const main = screen.getByRole('main', { name: 'Operator content' });

    expect(skipLink.getAttribute('href')).toBe('#ops-main-content');
    expect(skipLink.className).toContain('focus:');
    expect(main.id).toBe('ops-main-content');
    expect(main.tabIndex).toBe(-1);
  });

  it('opens the shared left Drawer and restores menu-trigger focus after Escape and close', async () => {
    const user = userEventLibrary.setup();
    renderLayout();
    const trigger = screen.getByRole('button', { name: 'Open operator navigation' });

    await user.click(trigger);
    let drawer = screen.getByRole('dialog', { name: 'Operator navigation' });
    expect(drawer.className).toContain('left-0');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    drawer = screen.getByRole('dialog', { name: 'Operator navigation' });
    await user.click(within(drawer).getByRole('button', { name: 'Close modal' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('closes mobile navigation when a route is selected', async () => {
    const user = userEventLibrary.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: 'Open operator navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Operator navigation' });
    await user.click(within(drawer).getByRole('link', { name: 'Modules & subscriptions' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByTestId('location').textContent).toBe('/ops/modules');
  });

  it('keeps the full desktop navigation model and active route state', () => {
    renderLayout('/ops/billing');
    const desktopNavigation = screen.getByRole('navigation', {
      name: 'Desktop operator navigation',
    });

    for (const [label, path] of NAVIGATION_ITEMS) {
      expect(
        within(desktopNavigation).getByRole('link', { name: label }).getAttribute('href')
      ).toBe(path);
    }
    expect(
      within(desktopNavigation).getByRole('link', { name: 'Billing' }).getAttribute('aria-current')
    ).toBe('page');
  });

  it('uses dynamic viewport, safe-area, and responsive content layout tokens', () => {
    renderLayout();
    const shell = document.getElementById('ops-shell');
    const desktopNavigation = screen.getByRole('navigation', {
      name: 'Desktop operator navigation',
    });
    const main = screen.getByRole('main', { name: 'Operator content' });

    expect(shell?.className).toContain('min-h-[100dvh]');
    expect(shell?.className).not.toContain('min-h-screen');
    expect(desktopNavigation.closest('aside')?.className).toContain('hidden');
    expect(desktopNavigation.closest('aside')?.className).toContain('md:flex');
    expect(main.className).toContain('min-w-0');
    expect(main.className).toContain('p-4');
    expect(main.className).toContain('md:p-6');
    expect(main.className).toContain('safe-area-inset-bottom');
    expect(main.className).toContain('safe-area-inset-left');
    expect(main.className).toContain('safe-area-inset-right');
  });

  it('signs out with the keyboard and replaces the route with operator login', async () => {
    const user = userEventLibrary.setup();
    renderLayout();
    const signOut = screen.getByRole('button', { name: 'Sign out' });

    signOut.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(authState.logoutOps).toHaveBeenCalledOnce());
    expect(await screen.findByRole('heading', { name: 'Operator login' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/ops/login');
  });
});
