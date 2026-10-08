// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppRoutes from './AppRoutes';

const state = vi.hoisted(() => ({ authenticated: false, resolution: 'marketing' }));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: state.authenticated,
    isOpsAuthenticated: false,
    tenantId: 'other-tenant',
  }),
}));
vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => ({
    currentTenant: { id: 'tenant-a' },
    resolutionStatus: state.resolution,
    tenantSlug: null,
  }),
}));
vi.mock('./RouteContent', () => ({ default: ({ title }: { title: string }) => <h1>{title}</h1> }));
afterEach(cleanup);

describe('anonymous invitation routing', () => {
  it.each(['marketing', 'resolving', 'not-found', 'error', 'resolved'])(
    'opens only the private form while normal tenant resolution is %s',
    (resolution) => {
      state.resolution = resolution;
      state.authenticated = false;
      render(
        <MemoryRouter initialEntries={['/prejoining#token=opaque-invitation']}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: 'Pre-joining form' })).toBeTruthy();
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.queryByText('Sign in')).toBeNull();
    }
  );
  it('does not redirect the invitation to a previously signed-in employee account', () => {
    state.authenticated = true;
    state.resolution = 'resolved';
    render(
      <MemoryRouter initialEntries={['/prejoining#token=opaque-invitation']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Pre-joining form' })).toBeTruthy();
    expect(screen.queryByText('Dashboard')).toBeNull();
  });
});
