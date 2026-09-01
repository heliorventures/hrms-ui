import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { scopeForPermission } from './approvalScope';

const session: ParsedClientSession = {
  jwtRoles: ['TENANT_ADMIN'],
  permissions: new Set(['attendance:read', 'attendance:regularize']),
  resourceScopes: { attendance: 'ALL' },
  permissionScopes: {
    'attendance:read': 'ALL',
    'attendance:regularize': 'SELF',
  },
  persona: 'ADMIN',
  mustChangePassword: false,
};

describe('scopeForPermission', () => {
  it('uses the exact action scope and does not inherit the resource scope', () => {
    expect(scopeForPermission(session, 'attendance:read')).toBe('ALL');
    expect(scopeForPermission(session, 'attendance:regularize')).toBe('SELF');
  });

  it('defaults to SELF when an action scope is absent', () => {
    expect(scopeForPermission(session, 'attendance:approve')).toBe('SELF');
    expect(scopeForPermission(null, 'attendance:read')).toBe('SELF');
  });
});
