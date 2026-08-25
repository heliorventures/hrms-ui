import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

function serviceWith(permissions: string[], jwtRoles: string[] = []) {
  const session: ParsedClientSession = {
    jwtRoles,
    permissions: new Set(permissions),
    resourceScopes: {},
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
