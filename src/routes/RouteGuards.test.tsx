// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenPair } from '../auth/authClient';
import type { ParsedClientSession } from '../auth/clientSession';
import { clearOperatorSession } from '../auth/tokenStore';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import OpsLoginPage from '../modules/ops/OpsLoginPage';

import RouteContent from './RouteContent';
import {
  OpsProtectedLayout,
  PayrollPermissionRoute,
  ProtectedLayout,
  TenantNotFoundPage,
  TenantPermissionRoute,
  TenantUnavailablePage,
} from './RouteGuards';

interface ActualAuthContextModule {
  AuthProvider: ComponentType<{ children: ReactNode }>;
  useAuth: () => unknown;
}

const state = vi.hoisted(() => ({
  auth: {} as Record<string, unknown>,
  tenant: {} as Record<string, unknown>,
  opsLayoutModuleLoads: 0,
  useRealAuth: false,
}));

vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const original = await importOriginal<ActualAuthContextModule>();
  return {
    ...original,
    useAuth: () => (state.useRealAuth ? original.useAuth() : state.auth),
  };
});
vi.mock('../config', () => ({
  getAppConfig: () => ({
    authUrl: 'https://auth.example.test',
    gatewayUrl: 'https://gateway.example.test/graphql',
  }),
}));
vi.mock('../contexts/TenantContext', () => ({ useTenant: () => state.tenant }));
vi.mock('../components/layout/AppLayout', () => ({ default: () => <Outlet /> }));
vi.mock('../modules/ops/OpsLayout', () => {
  state.opsLayoutModuleLoads += 1;
  return { default: () => <Outlet /> };
});

function session(
  permissions: readonly string[] = [],
  overrides: Partial<ParsedClientSession> = {}
): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set(permissions),
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
    ...overrides,
  };
}

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
} as const;

const operatorPair: TokenPair = {
  access: 'operator-access',
  refresh: 'operator-refresh',
  tokenType: 'Bearer',
  expiresIn: 3_600,
  email: 'operator@example.test',
  userId: 'operator-user',
  mustChangePassword: false,
};

const OperatorSessionRoutes = () => {
  const { expireOpsSession, loginOps } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loginOps('operator@example.test', 'password').then(() => {
      if (active) setSessionReady(true);
    });
    return () => {
      active = false;
    };
  }, [loginOps]);

  if (!sessionReady) return <div role="status">Establishing operator session</div>;

  return (
    <>
      <LocationProbe />
      <Routes>
        <Route path="/ops/login" element={<OpsLoginPage />} />
        <Route path="/ops" element={<OpsProtectedLayout />}>
          <Route
            path="modules"
            element={
              <button type="button" onClick={expireOpsSession}>
                Expire operator session
              </button>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

beforeEach(() => {
  localStorage.clear();
  clearOperatorSession();
  state.auth = {
    can: vi.fn(() => false),
    clientSession: session(),
    isAuthenticated: true,
    isOpsAuthenticated: true,
    tenantId: '11111111-1111-4111-8111-111111111111',
  };
  state.useRealAuth = false;
  state.tenant = {
    currentTenant: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Acme',
      companyCode: 'ACME',
    },
    resolutionStatus: 'resolved',
    canRetryTenantResolution: false,
    retryTenantResolution: vi.fn(() => false),
  };
});

afterEach(() => {
  cleanup();
  clearOperatorSession();
  vi.unstubAllGlobals();
});

describe('ProtectedLayout', () => {
  function renderProtected(path = '/dashboard') {
    render(
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe />
        <Routes>
          <Route path="/" element={<h1>Public home</h1>} />
          <Route path="/login" element={<h1>Tenant login</h1>} />
          <Route path="/profile/settings" element={<h1>Security settings</h1>} />
          <Route path="*" element={<ProtectedLayout />}>
            <Route path="*" element={<h1>Protected content</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  it('preserves the unresolved-tenant redirect', async () => {
    state.tenant = { ...state.tenant, resolutionStatus: 'resolving' };
    renderProtected();
    expect(await screen.findByRole('heading', { name: 'Public home' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/');
  });

  it.each([
    ['an unauthenticated session', { isAuthenticated: false }],
    ['a tenant-mismatched session', { tenantId: '22222222-2222-4222-8222-222222222222' }],
  ])('preserves the login redirect for %s', async (_label, override) => {
    state.auth = { ...state.auth, ...override };
    renderProtected();
    expect(await screen.findByRole('heading', { name: 'Tenant login' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/login');
  });

  it('preserves the forced-password security redirect', async () => {
    state.auth = {
      ...state.auth,
      clientSession: session([], { mustChangePassword: true }),
    };
    renderProtected();
    expect(await screen.findByRole('heading', { name: 'Security settings' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/profile/settings?tab=security');
  });

  it('renders the protected outlet for a matching authorized session', () => {
    renderProtected();
    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeTruthy();
  });
});

describe('child authorization guards', () => {
  it('renders payroll access denied without invoking the denied lazy loader', async () => {
    const loadDeniedPage = vi.fn(() =>
      Promise.resolve({ default: () => <h1>Denied payroll content</h1> })
    );
    render(
      <MemoryRouter initialEntries={['/payroll/payslips']}>
        <LocationProbe />
        <Routes>
          <Route
            path="/payroll/payslips"
            element={
              <PayrollPermissionRoute capability="route.payroll.admin">
                <RouteContent title="Payslips" load={loadDeniedPage} />
              </PayrollPermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Return to payroll' }).getAttribute('href')).toBe(
      '/payroll/pay'
    );
    expect(screen.queryByText('Denied payroll content')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/payroll/payslips');
    expect(loadDeniedPage).not.toHaveBeenCalled();
  });

  it('renders tenant access denied without invoking the denied lazy loader', async () => {
    const loadDeniedPage = vi.fn(() =>
      Promise.resolve({ default: () => <h1>Denied tenant content</h1> })
    );
    render(
      <MemoryRouter initialEntries={['/insights']}>
        <LocationProbe />
        <Routes>
          <Route
            path="/insights"
            element={
              <TenantPermissionRoute tenantPath="/insights">
                <RouteContent title="Insights" load={loadDeniedPage} />
              </TenantPermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Return to dashboard' }).getAttribute('href')).toBe(
      '/dashboard'
    );
    expect(screen.queryByText('Denied tenant content')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/insights');
    expect(loadDeniedPage).not.toHaveBeenCalled();
  });
});

describe('OpsProtectedLayout', () => {
  it('redirects an unauthenticated operator before loading the operations layout module', async () => {
    state.auth = { ...state.auth, isOpsAuthenticated: false };
    render(
      <MemoryRouter initialEntries={['/ops/tenants']}>
        <LocationProbe />
        <Routes>
          <Route path="/ops/login" element={<h1>Operator login</h1>} />
          <Route path="/ops" element={<OpsProtectedLayout />}>
            <Route path="tenants" element={<h1>Operator tenants</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Operator login' })).toBeTruthy();
    expect(screen.queryByText('Operator tenants')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/ops/login'));
    expect(state.opsLayoutModuleLoads).toBe(0);
  });

  it('opens authenticated operations independently of tenant resolution with friendly loading', async () => {
    state.tenant = { ...state.tenant, resolutionStatus: 'error' };

    render(
      <MemoryRouter initialEntries={['/ops/tenants']}>
        <Routes>
          <Route path="/ops" element={<OpsProtectedLayout />}>
            <Route path="tenants" element={<h1>Operator tenants</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Opening page' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Operator tenants' })).toBeTruthy();
  });

  it('renders and focuses the real expiry notice after protected operator redirect', async () => {
    state.useRealAuth = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(operatorPair), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          })
        )
      )
    );
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/ops/modules']}>
        <AuthProvider>
          <OperatorSessionRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Expire operator session' }));

    expect(await screen.findByRole('heading', { name: 'Operator Sign In' })).toBeTruthy();
    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Unable to sign in')).toBeTruthy();
    expect(within(alert).getByText('Your operator session expired. Sign in again.')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect(screen.getByTestId('location').textContent).toBe('/ops/login');

    const user = userEventLibrary.setup();
    const email = screen.getByLabelText<HTMLInputElement>('Email');
    const password = screen.getByLabelText<HTMLInputElement>('Password');
    await user.type(email, 'next.operator@example.test');
    await user.type(password, 'replacement credentials');
    expect(email.value).toBe('next.operator@example.test');
    expect(password.value).toBe('replacement credentials');
    expect(within(alert).getByText('Your operator session expired. Sign in again.')).toBeTruthy();
  });
});

describe('tenant resolution pages', () => {
  it('announces a terminal missing organization without offering retry', () => {
    render(
      <MemoryRouter>
        <TenantNotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert', { name: 'Organization not found' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('offers context retry only while another attempt is available', () => {
    const retryTenantResolution = vi.fn(() => true);
    state.tenant = {
      ...state.tenant,
      canRetryTenantResolution: true,
      retryTenantResolution,
    };
    render(
      <MemoryRouter>
        <TenantUnavailablePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryTenantResolution).toHaveBeenCalledTimes(1);
  });

  it('shows an exhausted next step without retry', () => {
    state.tenant = { ...state.tenant, canRetryTenantResolution: false };
    render(
      <MemoryRouter>
        <TenantUnavailablePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert', { name: 'Organization unavailable' })).toBeTruthy();
    expect(screen.getByText(/try again later/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
