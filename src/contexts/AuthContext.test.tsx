// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenPair } from '../auth/authClient';
import {
  getClientAccessToken,
  getClientRefreshToken,
  getOperatorAccessToken,
  getOperatorRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
  setOperatorAccessToken,
} from '../auth/tokenStore';

import { AuthProvider, useAuth } from './AuthContext';

const authClient = vi.hoisted(() => ({
  loginClient: vi.fn<[string, string, string], Promise<TokenPair>>(),
  loginOps: vi.fn<[string, string], Promise<TokenPair>>(),
  logoutClient: vi.fn<[string], Promise<void>>(),
  logoutOps: vi.fn<[string], Promise<void>>(),
  refreshClient: vi.fn<[string], Promise<TokenPair>>(),
  refreshOps: vi.fn<[string], Promise<TokenPair>>(),
}));

interface OriginalAuthClient {
  AuthError: new (status: number, code: string, message: string) => Error;
}

vi.mock('../auth/authClient', async (importOriginal) => {
  const original = await importOriginal<OriginalAuthClient>();
  return { ...original, ...authClient };
});

vi.mock('./TenantContext', () => ({
  useTenant: () => ({
    currentTenant: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Acme Health',
      companyCode: 'ACME',
    },
    resolutionStatus: 'resolved',
  }),
}));

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const TENANT_ERROR = 'We could not sign you in. Try again.';

function accessToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

function tokenPair(overrides: Partial<TokenPair>): TokenPair {
  return {
    access: 'access-token',
    refresh: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3_600,
    email: 'person@example.test',
    userId: 'user-1',
    mustChangePassword: false,
    ...overrides,
  };
}

const tenantPair = tokenPair({
  access: accessToken({
    roles: ['HR_ADMIN', 'PAYROLL_VIEWER'],
    permissions: ['dashboard:view', 'payroll:view'],
    resource_scopes: { department: 'finance', region: 'west' },
    employee_id: 'employee-42',
    must_change_password: true,
  }),
  refresh: 'tenant-refresh',
  tenantId: TENANT_ID,
  username: 'employee-1',
  userId: 'tenant-user',
});

const operatorPair = tokenPair({
  access: 'operator-access',
  refresh: 'operator-refresh',
  email: 'operator@example.test',
  userId: 'operator-user',
});

type AuthState = ReturnType<typeof useAuth>;

let latestAuth: AuthState | null = null;

const AuthProbe = () => {
  const auth = useAuth();
  latestAuth = auth;
  return (
    <>
      <output data-testid="tenant-user">{auth.user?.id ?? ''}</output>
      <output data-testid="operator-user">{auth.opsUser?.id ?? ''}</output>
      <output data-testid="tenant-id">{auth.tenantId ?? ''}</output>
      <output data-testid="tenant-error">{auth.error ?? ''}</output>
      <output data-testid="operator-error">{auth.opsError ?? ''}</output>
      <button type="button" onClick={auth.expireOpsSession}>
        Expire operator
      </button>
    </>
  );
};

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

function currentAuth(): AuthState {
  if (!latestAuth) throw new Error('AuthProvider has not rendered');
  return latestAuth;
}

function tenantStateSnapshot() {
  const auth = currentAuth();
  const session = auth.clientSession;
  return {
    user: auth.user,
    clientSession: session
      ? {
          ...session,
          permissions: [...session.permissions].sort(),
          permissionScopes: { ...session.permissionScopes },
          resourceScopes: { ...session.resourceScopes },
        }
      : null,
    tenantId: auth.tenantId,
    accessToken: getClientAccessToken(),
    refreshToken: getClientRefreshToken(TENANT_ID),
    error: auth.error,
  };
}

async function seedBothSessionsAndTenantError(): Promise<void> {
  authClient.loginClient.mockResolvedValueOnce(tenantPair);
  authClient.loginClient.mockRejectedValueOnce(new Error('raw tenant failure'));
  authClient.loginOps.mockResolvedValueOnce(operatorPair);

  await act(async () => currentAuth().login(' employee-1 ', 'password'));
  await expect(currentAuth().login('employee-1', 'wrong-password')).rejects.toThrow(
    'raw tenant failure'
  );
  await act(async () => currentAuth().loginOps(' operator@example.test ', 'password'));
}

beforeEach(() => {
  localStorage.clear();
  setClientAccessToken(null);
  setOperatorAccessToken(null);
  latestAuth = null;
  Object.values(authClient).forEach((mock) => mock.mockReset());
  authClient.logoutClient.mockResolvedValue(undefined);
  authClient.logoutOps.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe('operator session expiry isolation', () => {
  it('restores the tenant session from the tenant-keyed refresh token after browser refresh', async () => {
    setClientRefreshToken(TENANT_ID, `${TENANT_ID}.stored-refresh`);
    authClient.refreshClient.mockResolvedValueOnce({
      ...tenantPair,
      refresh: `${TENANT_ID}.rotated-refresh`,
    });

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId('tenant-user').textContent).toBe('tenant-user'));
    expect(authClient.refreshClient).toHaveBeenCalledWith(`${TENANT_ID}.stored-refresh`);
    expect(getClientRefreshToken(TENANT_ID)).toBe(`${TENANT_ID}.rotated-refresh`);
  });

  it('expires only operator state and remains safe when responses repeat', async () => {
    renderAuthProvider();
    await seedBothSessionsAndTenantError();
    const clientSessionBefore = currentAuth().clientSession;
    const tenantUserBefore = currentAuth().user;
    const tenantStateBefore = tenantStateSnapshot();

    expect(tenantStateBefore.clientSession).toStrictEqual({
      jwtRoles: ['HR_ADMIN', 'PAYROLL_VIEWER'],
      permissions: ['dashboard:view', 'payroll:view'],
      permissionScopes: {},
      resourceScopes: { department: 'finance', region: 'west' },
      employeeId: 'employee-42',
      persona: 'HR',
      mustChangePassword: true,
      expiresAtMs: undefined,
    });
    expect(tenantStateBefore.error).toBe(TENANT_ERROR);

    expect(typeof currentAuth().expireOpsSession).toBe('function');
    fireEvent.click(screen.getByRole('button', { name: 'Expire operator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expire operator' }));

    expect(screen.getByTestId('operator-user').textContent).toBe('');
    expect(screen.getByTestId('operator-error').textContent).toBe(
      'Your operator session expired. Sign in again.'
    );
    expect(getOperatorAccessToken()).toBeNull();
    expect(getOperatorRefreshToken()).toBeNull();
    expect(authClient.logoutOps).not.toHaveBeenCalled();

    expect(currentAuth().clientSession).toBe(clientSessionBefore);
    expect(currentAuth().user).toBe(tenantUserBefore);
    expect(tenantStateSnapshot()).toStrictEqual(tenantStateBefore);
  });

  it('clears an expiry error after successful operator login', async () => {
    renderAuthProvider();
    authClient.loginOps.mockResolvedValue(operatorPair);

    expect(typeof currentAuth().expireOpsSession).toBe('function');
    act(() => currentAuth().expireOpsSession());
    expect(screen.getByTestId('operator-error').textContent).not.toBe('');

    await act(async () => currentAuth().loginOps('operator@example.test', 'password'));

    expect(screen.getByTestId('operator-user').textContent).toBe('operator-user');
    expect(screen.getByTestId('operator-error').textContent).toBe('');
  });

  it('keeps explicit operator logout revocation and error clearing semantics', async () => {
    renderAuthProvider();
    authClient.loginOps.mockResolvedValueOnce(operatorPair);
    await act(async () => currentAuth().loginOps('operator@example.test', 'password'));

    act(() => currentAuth().expireOpsSession());
    expect(screen.getByTestId('operator-error').textContent).toBe(
      'Your operator session expired. Sign in again.'
    );
    setOperatorAccessToken(operatorPair.access);
    localStorage.setItem('kabipay.ops.refresh', operatorPair.refresh);

    await act(async () => currentAuth().logoutOps());

    expect(authClient.logoutOps).toHaveBeenCalledOnce();
    expect(authClient.logoutOps).toHaveBeenCalledWith('operator-refresh');
    await waitFor(() => expect(screen.getByTestId('operator-user').textContent).toBe(''));
    expect(screen.getByTestId('operator-error').textContent).toBe('');
    expect(getOperatorAccessToken()).toBeNull();
    expect(getOperatorRefreshToken()).toBeNull();
  });
});
