// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';
import { PERMISSIONS } from '../../auth/permissions';

import Sidebar from './Sidebar';

const sidebarAuth = vi.hoisted(() => ({
  clientSession: null as ParsedClientSession | null,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: (permission: string) => sidebarAuth.clientSession?.permissions.has(permission) ?? false,
    clientSession: sidebarAuth.clientSession,
  }),
}));

function session(permissions: readonly string[], jwtRoles: string[] = []): ParsedClientSession {
  return {
    jwtRoles,
    permissions: new Set(permissions),
    permissionScopes: {},
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

let desktopViewport = true;
let mediaListeners = new Set<(event: MediaQueryListEvent) => void>();

function setDesktopViewport(matches: boolean) {
  desktopViewport = matches;
  const event = { matches, media: '(min-width: 1024px)' } as MediaQueryListEvent;
  mediaListeners.forEach((listener) => listener(event));
}

beforeEach(() => {
  sidebarAuth.clientSession = session(Object.values(PERMISSIONS));
  desktopViewport = true;
  mediaListeners = new Set();
  document.body.innerHTML = '<div id="root"></div>';
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) =>
      ({
        matches: desktopViewport,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          mediaListeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          mediaListeners.delete(listener),
        addListener: (listener: (event: MediaQueryListEvent) => void) =>
          mediaListeners.add(listener),
        removeListener: (listener: (event: MediaQueryListEvent) => void) =>
          mediaListeners.delete(listener),
        dispatchEvent: () => true,
      }) as MediaQueryList
    )
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

interface RenderSidebarOptions {
  mobileOpen?: boolean;
  desktopCollapsed?: boolean;
  onCloseMobile?: () => void;
  onToggleDesktop?: () => void;
}

function renderSidebar({
  mobileOpen = false,
  desktopCollapsed = false,
  onCloseMobile = vi.fn(),
  onToggleDesktop = vi.fn(),
}: RenderSidebarOptions = {}) {
  const mobileTriggerRef = createRef<HTMLButtonElement>();
  const result = render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <div data-testid="shell-background">
        <button ref={mobileTriggerRef} type="button">
          Open menu
        </button>
      </div>
      <Sidebar
        mobileOpen={mobileOpen}
        desktopCollapsed={desktopCollapsed}
        mobileTriggerRef={mobileTriggerRef}
        onCloseMobile={onCloseMobile}
        onToggleDesktop={onToggleDesktop}
      />
    </MemoryRouter>,
    { container: document.getElementById('root') ?? undefined }
  );

  return { ...result, mobileTriggerRef };
}

function StatefulSidebar({ initiallyOpen = true }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const mobileTriggerRef = createRef<HTMLButtonElement>();
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      <div data-testid="shell-background">
        <button
          ref={mobileTriggerRef}
          type="button"
          data-testid="mobile-navigation-trigger"
          onClick={() => setOpen(true)}
        >
          Open menu
        </button>
      </div>
      <Sidebar
        mobileOpen={open}
        desktopCollapsed={false}
        mobileTriggerRef={mobileTriggerRef}
        onCloseMobile={() => setOpen(false)}
        onToggleDesktop={() => undefined}
      />
    </MemoryRouter>
  );
}

function renderStatefulSidebar() {
  setDesktopViewport(false);
  return render(<StatefulSidebar />, {
    container: document.getElementById('root') ?? undefined,
  });
}

describe('Sidebar', () => {
  it('does not expose self-service routes from JWT role names', () => {
    sidebarAuth.clientSession = session([], ['HR_ADMIN']);
    renderSidebar();

    expect(screen.queryByRole('link', { name: 'Attendance' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Timesheet' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Leave' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Expenses & Travel' })).toBeNull();
  });

  it('exposes only self-service routes backed by exact permissions', () => {
    sidebarAuth.clientSession = session(['timesheet:read'], ['EMPLOYEE']);
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Timesheet' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Attendance' })).toBeNull();
  });

  it('keeps the mobile drawer closed by default while preserving desktop navigation', () => {
    renderSidebar();

    const navigation = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(navigation.className).toContain('-translate-x-full');
    expect(navigation.className).toContain('lg:translate-x-0');
    expect(screen.queryByRole('button', { name: 'Close navigation' })).toBeNull();
  });

  it('hides and inerts the closed mobile drawer while restoring the desktop landmark', async () => {
    setDesktopViewport(false);
    renderSidebar();

    const navigation = document.getElementById('app-navigation');
    expect(navigation).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Main navigation' })).toBeNull();
    expect(navigation?.getAttribute('aria-hidden')).toBe('true');
    expect(navigation?.hasAttribute('inert')).toBe(true);
    expect(navigation?.className).toContain('invisible');
    expect(navigation?.className).toContain('pointer-events-none');
    expect(navigation?.className).toContain('lg:visible');
    expect(navigation?.className).toContain('lg:pointer-events-auto');

    act(() => setDesktopViewport(true));

    await waitFor(() =>
      expect(screen.getByRole('complementary', { name: 'Main navigation' })).toBe(navigation)
    );
    expect(navigation?.hasAttribute('inert')).toBe(false);
    expect(navigation?.getAttribute('aria-hidden')).toBeNull();
  });

  it('traps Tab and Shift+Tab inside the open mobile navigation', async () => {
    renderStatefulSidebar();
    const navigation = screen.getByRole('dialog', { name: 'Main navigation' });
    const closeButton = within(navigation).getByRole('button', { name: 'Close sidebar' });
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    const focusable = Array.from(
      navigation.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])')
    );
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('isolates the shell background and owns body scroll while mobile navigation is open', async () => {
    renderStatefulSidebar();

    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'));
    expect(screen.getByTestId('shell-background').hasAttribute('inert')).toBe(true);
    expect(screen.getByTestId('shell-background').getAttribute('aria-hidden')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
    expect(screen.getByTestId('shell-background').hasAttribute('inert')).toBe(false);
    expect(screen.getByTestId('shell-background').hasAttribute('aria-hidden')).toBe(false);
  });

  it('ends mobile dialog modality when the viewport enters desktop and keeps it closed on return', async () => {
    renderStatefulSidebar();

    expect(screen.getByRole('dialog', { name: 'Main navigation' })).toBeTruthy();
    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'));
    expect(screen.getByTestId('shell-background').hasAttribute('inert')).toBe(true);

    act(() => setDesktopViewport(true));

    const navigation = await screen.findByRole('complementary', { name: 'Main navigation' });
    expect(navigation.getAttribute('aria-modal')).toBeNull();
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
    expect(screen.getByTestId('shell-background').hasAttribute('inert')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Close navigation' })).toBeNull();

    act(() => setDesktopViewport(false));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Main navigation' })).toBeNull()
    );
    expect(document.getElementById('app-navigation')?.getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    ['Escape', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['close button', () => fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }))],
    ['backdrop', () => fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))],
    ['navigation link', () => fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))],
  ])('restores focus after %s dismissal', async (_dismissal, dismiss) => {
    renderStatefulSidebar();
    const trigger = screen.getByTestId('mobile-navigation-trigger');
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Main navigation' })).toBeTruthy());

    dismiss();

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Main navigation' })).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('uses dynamic viewport, overscroll, safe-area, and shared icon-target classes on mobile', () => {
    setDesktopViewport(false);
    renderSidebar({ mobileOpen: true });
    const navigation = screen.getByRole('dialog', { name: 'Main navigation' });
    const close = within(navigation).getByRole('button', { name: 'Close sidebar' });

    expect(navigation.className).toContain('h-[100dvh]');
    expect(navigation.className).toContain('overscroll-contain');
    expect(navigation.className).toContain('safe-area-inset-top');
    expect(navigation.className).toContain('safe-area-inset-bottom');
    expect(navigation.className).toContain('safe-area-inset-left');
    expect(close.className).toContain('min-w-11');
  });

  it('exposes expandable HRMS sections with their current state', () => {
    renderSidebar();

    const organization = screen.getByRole('button', { name: 'Organization' });
    expect(organization.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(organization);

    expect(organization.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('link', { name: 'Employees' })).toBeTruthy();
  });

  it('keeps destinations discoverable by accessible name in the desktop icon rail', () => {
    renderSidebar({ desktopCollapsed: true });

    const navigation = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(navigation.className).toContain('lg:w-20');
    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard.getAttribute('title')).toBe('Dashboard');
    expect(dashboard.querySelector('span')?.className).toContain('sr-only');
  });
});
