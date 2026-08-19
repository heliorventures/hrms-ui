// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Sidebar from './Sidebar';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ can: () => true, clientSession: null }),
}));

vi.mock('../../auth/navAccess', () => ({
  canAccessTenantPath: () => true,
}));

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
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
      <button ref={mobileTriggerRef} type="button">
        Open menu
      </button>
      <Sidebar
        mobileOpen={mobileOpen}
        desktopCollapsed={desktopCollapsed}
        mobileTriggerRef={mobileTriggerRef}
        onCloseMobile={onCloseMobile}
        onToggleDesktop={onToggleDesktop}
      />
    </MemoryRouter>
  );

  return { ...result, mobileTriggerRef };
}

describe('Sidebar', () => {
  it('keeps the mobile drawer closed by default while preserving desktop navigation', () => {
    renderSidebar();

    const navigation = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(navigation.className).toContain('-translate-x-full');
    expect(navigation.className).toContain('lg:translate-x-0');
    expect(screen.queryByRole('button', { name: 'Close navigation' })).toBeNull();
  });

  it('closes the mobile drawer with Escape and restores focus to its trigger', async () => {
    const onCloseMobile = vi.fn();
    const { mobileTriggerRef } = renderSidebar({ mobileOpen: true, onCloseMobile });

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseMobile).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(mobileTriggerRef.current);
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

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard.getAttribute('title')).toBe('Dashboard');
    expect(dashboard.querySelector('span')?.className).toContain('sr-only');
  });
});
