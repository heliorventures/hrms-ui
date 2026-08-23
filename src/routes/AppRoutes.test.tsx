// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResolvedTenant } from '../auth/authClient';
import type { ParsedClientSession } from '../auth/clientSession';
import { TenantProvider, type useTenant } from '../contexts/TenantContext';
import AppRoutes from './AppRoutes';
import { TENANT_APP_ROUTES } from './appRouteConfig';
import { OPS_CHILD_ROUTES } from './opsRouteConfig';
import type { RoutePage } from './routeTypes';

const state = vi.hoisted(() => ({
  appConfig: {
    authUrl: 'https://auth.example.test',
    devTenantSlug: 'acme' as string | undefined,
    gatewayUrl: 'https://gateway.example.test/graphql',
  },
  auth: {} as Record<string, unknown>,
  tenant: {} as Record<string, unknown>,
  useRealTenant: false,
}));

vi.mock('../config', () => ({ getAppConfig: () => state.appConfig }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('../contexts/TenantContext', async () => {
  const actual = await vi.importActual<{
    TenantProvider: typeof TenantProvider;
    useTenant: typeof useTenant;
  }>('../contexts/TenantContext');
  return {
    ...actual,
    useTenant: () => (state.useRealTenant ? actual.useTenant() : state.tenant),
  };
});
vi.mock('../components/layout/AppLayout', () => ({ default: () => <Outlet /> }));
vi.mock('../modules/ops/OpsLayout', () => ({ default: () => <Outlet /> }));
vi.mock('../modules/auth/LoginPage', () => ({ default: () => <h1>Tenant sign in</h1> }));
vi.mock('../modules/auth/ForgotPasswordPage', () => ({ default: () => <h1>Reset password</h1> }));
vi.mock('../modules/public/MarketingPage', () => ({ default: () => <h1>Marketing home</h1> }));
vi.mock('../modules/ops/OpsLoginPage', () => ({ default: () => <h1>Operator sign in</h1> }));

const originalLoads = new Map<RoutePage, RoutePage['load']>();

function session(permissions: readonly string[] = []): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set(permissions),
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

function replaceLoader(routes: readonly unknown[], path: string, load: RoutePage['load']) {
  const route = routes.find((candidate) => (candidate as { path?: string }).path === path) as
    | RoutePage
    | undefined;
  if (!route || route.kind !== 'page') throw new Error(`Missing page route: ${path}`);
  if (!originalLoads.has(route)) originalLoads.set(route, route.load);
  route.load = load;
  return load;
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

const TenantNavigationProbe = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/t/beta/login')}>
      Open Beta
    </button>
  );
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    statusText: 'OK',
  });
}

function deferred<T>() {
  let resolve = (_value: T): void => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function resolvedTenant(slug: string, name: string): ResolvedTenant {
  return {
    id:
      slug === 'acme'
        ? '11111111-1111-4111-8111-111111111111'
        : '22222222-2222-4222-8222-222222222222',
    name,
    status: 'ACTIVE',
    subdomain: slug,
  };
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>
  );
}

beforeEach(() => {
  state.appConfig = {
    authUrl: 'https://auth.example.test',
    devTenantSlug: 'acme',
    gatewayUrl: 'https://gateway.example.test/graphql',
  };
  state.useRealTenant = false;
  state.auth = {
    can: vi.fn(() => false),
    clientSession: session(),
    isAuthenticated: true,
    isOpsAuthenticated: true,
    tenantId: '11111111-1111-4111-8111-111111111111',
  };
  state.tenant = {
    currentTenant: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Acme',
      companyCode: 'ACME',
    },
    resolutionError: null,
    resolutionStatus: 'resolved',
    tenantSlug: 'acme',
    canRetryTenantResolution: false,
    retryTenantResolution: vi.fn(() => false),
  };
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  for (const [route, load] of originalLoads) route.load = load;
  originalLoads.clear();
});

describe('AppRoutes operations selection', () => {
  it.each(['marketing', 'resolving', 'not-found', 'error'] as const)(
    'renders protected operations routes while tenant resolution is %s',
    async (resolutionStatus) => {
      state.tenant = { ...state.tenant, resolutionStatus };
      const load = vi.fn(async () => ({ default: () => <h1>Tenant operations</h1> }));
      replaceLoader(OPS_CHILD_ROUTES, 'tenants', load);

      renderApp('/ops/tenants');

      expect(
        await screen.findByRole('heading', { name: 'Tenant operations' }, { timeout: 5_000 })
      ).toBeTruthy();
      expect(load).toHaveBeenCalledTimes(1);
    }
  );

  it.each(['marketing', 'resolving', 'not-found', 'error'] as const)(
    'renders operations login while tenant resolution is %s',
    async (resolutionStatus) => {
      state.auth = { ...state.auth, isOpsAuthenticated: false };
      state.tenant = { ...state.tenant, resolutionStatus };

      renderApp('/ops/login');

      expect(await screen.findByRole('heading', { name: 'Operator sign in' })).toBeTruthy();
    }
  );

  it('does not invoke an operations page importer before OpsProtectedLayout authorizes it', async () => {
    state.auth = { ...state.auth, isOpsAuthenticated: false };
    const deniedLoad = vi.fn(async () => ({ default: () => <h1>Denied operations</h1> }));
    replaceLoader(OPS_CHILD_ROUTES, 'tenants', deniedLoad);

    renderApp('/ops/tenants');

    expect(await screen.findByRole('heading', { name: 'Operator sign in' })).toBeTruthy();
    expect(deniedLoad).not.toHaveBeenCalled();
    expect(screen.getByTestId('location').textContent).toBe('/ops/login');
  });

  it('renders an explicit operations not-found state', async () => {
    document.title = 'Tenants | Helior HRMS';
    renderApp('/ops/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Return to tenants' }).getAttribute('href')).toBe(
      '/ops/tenants'
    );
    await waitFor(() => expect(document.title).toBe('Page not found | Helior HRMS'));
  });
});

describe('AppRoutes tenant selection and authorization', () => {
  it('canonicalizes a tenant-prefixed path only after tenant resolution', async () => {
    const load = vi.fn(async () => ({ default: () => <h1>Leave route</h1> }));
    replaceLoader(TENANT_APP_ROUTES, 'leave', load);

    renderApp('/t/acme/leave');

    expect(await screen.findByRole('heading', { name: 'Leave route' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/leave');
  });

  it('does not canonicalize tenant-prefixed paths while resolution is pending', () => {
    state.tenant = { ...state.tenant, resolutionStatus: 'resolving' };
    renderApp('/t/acme/leave');
    expect(screen.getByRole('heading', { name: 'Opening page' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/t/acme/leave');
  });

  it('renders access denied without invoking a tenant-denied importer', async () => {
    const deniedLoad = vi.fn(async () => ({ default: () => <h1>Denied insights</h1> }));
    replaceLoader(TENANT_APP_ROUTES, 'insights', deniedLoad);

    renderApp('/insights');

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeTruthy();
    expect(deniedLoad).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Return to dashboard' }).getAttribute('href')).toBe(
      '/dashboard'
    );
    expect(screen.getByTestId('location').textContent).toBe('/insights');
  });

  it('renders access denied without invoking a payroll-denied importer', async () => {
    const deniedLoad = vi.fn(async () => ({ default: () => <h1>Denied payroll</h1> }));
    replaceLoader(TENANT_APP_ROUTES, 'payroll/payslips', deniedLoad);

    renderApp('/payroll/payslips');

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeTruthy();
    expect(deniedLoad).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Return to payroll' }).getAttribute('href')).toBe(
      '/payroll/pay'
    );
    expect(screen.getByTestId('location').textContent).toBe('/payroll/payslips');
  });

  it('renders an explicit tenant not-found state without dashboard redirect', async () => {
    document.title = 'Dashboard | Helior HRMS';
    renderApp('/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Return to dashboard' }).getAttribute('href')).toBe(
      '/dashboard'
    );
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/does-not-exist'));
    expect(document.title).toBe('Page not found | Helior HRMS');
  });

  it('renders terminal organization not-found guidance without retry', async () => {
    state.tenant = { ...state.tenant, resolutionStatus: 'not-found' };
    document.title = 'Previous page | Helior HRMS';

    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Organization not found' })).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    await waitFor(() => expect(document.title).toBe('Organization not found | Helior HRMS'));
  });

  it('renders transient organization failure with retry while budget remains', async () => {
    const retryTenantResolution = vi.fn(() => true);
    state.tenant = {
      ...state.tenant,
      resolutionStatus: 'error',
      canRetryTenantResolution: true,
      retryTenantResolution,
    };

    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Organization unavailable' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryTenantResolution).toHaveBeenCalledTimes(1);
  });

  it('removes retry and gives a later next step when the attempt budget is exhausted', async () => {
    state.tenant = {
      ...state.tenant,
      resolutionStatus: 'error',
      canRetryTenantResolution: false,
    };

    renderApp('/dashboard');

    expect(await screen.findByText(/try again later/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});

describe('AppRoutes same-provider tenant navigation', () => {
  it('owns the new path slug before canonicalizing a second tenant-prefixed route', async () => {
    state.useRealTenant = true;
    state.auth = {
      can: vi.fn(() => false),
      clientSession: null,
      isAuthenticated: false,
      isOpsAuthenticated: false,
      tenantId: null,
    };
    const betaRequest = deferred<Response>();
    const fetchMock = vi.fn((input: RequestInfo | URL): Promise<Response> => {
      const requestUrl = String(input);
      if (requestUrl.endsWith('/acme')) {
        return Promise.resolve(jsonResponse(resolvedTenant('acme', 'Acme Health')));
      }
      if (requestUrl.endsWith('/beta')) return betaRequest.promise;
      return Promise.reject(new Error(`Unexpected tenant request: ${requestUrl}`));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/t/acme/login']}>
        <TenantProvider>
          <AppRoutes />
          <LocationProbe />
          <TenantNavigationProbe />
        </TenantProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Tenant sign in' })).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/login');

    fireEvent.click(screen.getByRole('button', { name: 'Open Beta' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/beta'))).toBe(true)
    );
    expect(screen.getByTestId('location').textContent).toBe('/t/beta/login');
    expect(screen.getByRole('heading', { name: 'Opening page' })).toBeTruthy();

    await act(async () => {
      betaRequest.resolve(jsonResponse(resolvedTenant('beta', 'Beta Health')));
      await betaRequest.promise;
    });

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/login'));
    expect(screen.getByRole('heading', { name: 'Tenant sign in' })).toBeTruthy();
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      'https://auth.example.test/auth/client/tenants/acme',
      'https://auth.example.test/auth/client/tenants/beta',
    ]);
  });
});
