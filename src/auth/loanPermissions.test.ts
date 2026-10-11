import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

const session = (permission: string, scope: string): ParsedClientSession => ({
  employeeId: 'employee-one',
  jwtRoles: [],
  persona: 'EMPLOYEE',
  mustChangePassword: false,
  permissions: new Set([permission]),
  permissionScopes: { [permission]: scope },
  resourceScopes: {},
});

describe('Loans navigation authority', () => {
  it('allows linked SELF readers to see only the My loans route', () => {
    const access = createPermissionService(session('loan:read', 'SELF'));
    expect(access.canRoute('/loans/my')).toBe(true);
    expect(access.canRoute('/loans/admin')).toBe(false);
    expect(access.canRoute('/loans/policies')).toBe(false);
  });
  it('uses exact scoped loan permissions rather than Payroll or HR role names', () => {
    expect(createPermissionService(session('loan:read', 'ALL')).canRoute('/loans/admin')).toBe(
      true
    );
    expect(createPermissionService(session('loan:policy', 'ALL')).canRoute('/loans/policies')).toBe(
      true
    );
    expect(
      createPermissionService(session('loan:policy', 'SELF')).canRoute('/loans/policies')
    ).toBe(false);
    expect(createPermissionService(session('payroll:manage', 'ALL')).canRoute('/loans/admin')).toBe(
      false
    );
    expect(createPermissionService(null).canRoute('/loans/my')).toBe(false);
  });
});
