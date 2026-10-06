// @vitest-environment jsdom

// @vitest-environment jsdom
// @vitest-environment jsdom
// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HomeQuickAccess from './HomeQuickAccess';

const authState = vi.hoisted(() => ({
  clientSession: {
    permissions: new Set<string>(),
    permissionScopes: { 'leave:read': 'SELF', 'leave:submit': 'SELF' },
    resourceScopes: {},
    employeeId: 'employee-1',
    mustChangePassword: false,
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => authState }));

afterEach(cleanup);

describe('HomeQuickAccess', () => {
  it('includes exactly one authorized leave request link inside Quick access', () => {
    authState.clientSession.permissions = new Set(['leave:read', 'leave:submit']);
    render(
      <MemoryRouter>
        <HomeQuickAccess />
      </MemoryRouter>
    );
    const links = within(screen.getByRole('navigation', { name: 'Quick access' }));
    const request = links.getByRole('link', { name: 'Request leave' });
    expect(request.getAttribute('href')).toBe('/leave?apply=1');
    expect(request.getAttribute('data-tour-anchor')).toBe('dashboard-request-leave');
    expect(screen.getAllByRole('link', { name: 'Request leave' })).toHaveLength(1);
    expect(links.queryByRole('link', { name: 'My leave' })).toBeNull();
    expect(links.queryByRole('link', { name: 'My tasks' })).toBeNull();
  });

  it('hides Request leave without submission permission and omits duplicate shortcuts', () => {
    authState.clientSession.permissions = new Set(['leave:read']);
    render(
      <MemoryRouter>
        <HomeQuickAccess />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: 'Request leave' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'My leave' })).toBeNull();
  });
});
