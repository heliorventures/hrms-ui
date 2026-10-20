import { afterEach, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';
import { canAccessTenantPath } from '../../auth/navAccess';

const session: ParsedClientSession = {
  jwtRoles: [],
  permissions: new Set(),
  permissionScopes: {},
  resourceScopes: {},
  persona: 'EMPLOYEE',
  mustChangePassword: false,
};

afterEach(() => vi.unstubAllEnvs());

it('exposes the opt-in entry to an authenticated source account without inventing tenant business permissions', () => {
  vi.stubEnv('VITE_ORGANIZATION_ENABLED', 'true');
  expect(
    canAccessTenantPath('/organization-workspace', { can: () => false, clientSession: session })
  ).toBe(true);
  expect(
    canAccessTenantPath('/organization-workspace', { can: () => true, clientSession: null })
  ).toBe(false);
  expect(canAccessTenantPath('/payroll/pay', { can: () => false, clientSession: session })).toBe(
    false
  );
});

it('hides the organization entry unless explicitly enabled', () => {
  vi.stubEnv('VITE_ORGANIZATION_ENABLED', 'false');
  expect(
    canAccessTenantPath('/organization-workspace', { can: () => true, clientSession: session })
  ).toBe(false);
});
