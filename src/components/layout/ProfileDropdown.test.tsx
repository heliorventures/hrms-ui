// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProfileDropdown from './ProfileDropdown';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  navigate: vi.fn(),
  switchRole: vi.fn(),
  toggleTheme: vi.fn(),
  auth: {
    clientSession: { employeeId: 'employee-42' } as { employeeId?: string } | null,
    role: 'employee',
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: mocks.toggleTheme }),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: mocks.auth.clientSession,
    user: { name: 'Asha Rao', email: 'asha@example.test' },
    role: mocks.auth.role,
    switchRole: mocks.switchRole,
    logout: mocks.logout,
  }),
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <ProfileDropdown />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.auth.clientSession = { employeeId: 'employee-42' };
  mocks.auth.role = 'employee';
  vi.stubEnv('VITE_ENABLE_DEV_ROLE_SWITCH', 'false');
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('ProfileDropdown', () => {
  it('uses ActionMenu semantics and preserves the employee profile route', async () => {
    renderProfile();
    const trigger = screen.getByRole('button', { name: 'User menu' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);

    const menu = screen.getByRole('menu', { name: 'User menu' });
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    const profile = screen.getByRole('menuitem', { name: 'Profile settings' });
    expect(profile.getAttribute('href')).toBe('/organization/employees/employee-42');
    await waitFor(() => expect(document.activeElement).toBe(profile));

    fireEvent.keyDown(profile, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('falls back to profile settings when no employee is linked', () => {
    mocks.auth.clientSession = null;
    renderProfile();
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));

    expect(screen.getByRole('menuitem', { name: 'Profile settings' }).getAttribute('href')).toBe(
      '/profile/settings'
    );
  });

  it('preserves theme and logout actions including replace navigation', async () => {
    mocks.logout.mockResolvedValue(undefined);
    renderProfile();
    const trigger = screen.getByRole('button', { name: 'User menu' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Theme: Dark mode' }));
    expect(mocks.toggleTheme).toHaveBeenCalledOnce();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Log out' }));

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
    expect(mocks.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('shows the role switch only behind the DEV flag and preserves its behavior', () => {
    const first = renderProfile();
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.queryByRole('menuitem', { name: 'Dev: switch to Admin' })).toBeNull();
    first.unmount();

    vi.stubEnv('VITE_ENABLE_DEV_ROLE_SWITCH', 'true');
    renderProfile();
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Dev: switch to Admin' }));

    expect(mocks.switchRole).toHaveBeenCalledWith('admin');
  });
});
