import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

function serviceWith(permissions: string[], jwtRoles: string[] = []) {
  const session: ParsedClientSession = {
    jwtRoles,
    permissions: new Set(permissions),
    resourceScopes: {},
    permissionScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };

  return createPermissionService(session);
}

describe('HR attendance management route permission', () => {
  it('allows the route with attendance:regularize', () => {
    expect(serviceWith(['attendance:regularize']).canRoute('/hr/attendance')).toBe(true);
  });

  it('does not allow an HR_ADMIN role without attendance:regularize', () => {
    expect(serviceWith([], ['HR_ADMIN']).canRoute('/hr/attendance')).toBe(false);
  });

  it('does not allow employee:manage without attendance:regularize', () => {
    expect(serviceWith(['employee:manage']).canRoute('/hr/attendance')).toBe(false);
  });

  it('does not allow an unauthenticated session', () => {
    expect(createPermissionService(null).canRoute('/hr/attendance')).toBe(false);
  });
});

describe('runtime authorization uses permissions instead of role names', () => {
  it('denies expense approval to an HR_ADMIN role without expense:approve', () => {
    expect(serviceWith([], ['HR_ADMIN']).canCapability('action.expense.approve')).toBe(false);
  });

  it('allows expense approval with expense:approve', () => {
    expect(serviceWith(['expense:approve']).canCapability('action.expense.approve')).toBe(true);
  });

  it('requires attendance:read for attendance reports', () => {
    expect(serviceWith(['attendance:read']).canRoute('/admin/reports')).toBe(true);
    expect(serviceWith(['employee:write']).canRoute('/admin/reports')).toBe(false);
    expect(serviceWith(['payroll:statutory_export']).canRoute('/admin/reports')).toBe(false);
  });
});
