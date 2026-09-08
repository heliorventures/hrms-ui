import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

const session = (permission: string, scope: string): ParsedClientSession => ({
  jwtRoles: ['HR'],
  persona: 'HR',
  mustChangePassword: false,
  permissions: new Set([permission]),
  permissionScopes: { [permission]: scope },
  resourceScopes: {},
});

describe('pre-joining route authorization', () => {
  it.each(['prejoining:manage', 'prejoining:review'])(
    'requires exact ALL scope for %s',
    (permission) => {
      expect(
        createPermissionService(session(permission, 'ALL')).canRoute('/workplace/prejoining')
      ).toBe(true);
      expect(
        createPermissionService(session(permission, 'TEAM')).canRoute('/workplace/prejoining')
      ).toBe(false);
      expect(
        createPermissionService(session(permission, 'SELF')).canRoute('/workplace/prejoining')
      ).toBe(false);
    }
  );
  it('does not infer candidate-document access from HR role or employee/onboarding access', () => {
    for (const permission of ['employee:read', 'employee:manage', 'onboarding:manage']) {
      expect(
        createPermissionService(session(permission, 'ALL')).canRoute('/workplace/prejoining')
      ).toBe(false);
    }
    expect(createPermissionService(null).canRoute('/workplace/prejoining')).toBe(false);
  });
});
