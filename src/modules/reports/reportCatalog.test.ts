import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';

import { availableReports } from './reportCatalog';

const sessionBase = {
  jwtRoles: [],
  persona: 'EMPLOYEE' as const,
  mustChangePassword: false,
  resourceScopes: {},
};

describe('HR report catalogue permissions', () => {
  it('filters contextual kinds after permissions and rejects unsupported domains', () => {
    const session: ParsedClientSession = {
      ...sessionBase,
      permissions: new Set(['leave:read', 'payroll:read']),
      permissionScopes: { 'leave:read': 'ALL', 'payroll:read': 'SELF' },
    };
    expect(availableReports(session, 'leave').map((report) => report.kind)).toEqual([
      'LEAVE_REQUESTS',
      'LEAVE_BALANCES',
      'COMP_OFF_CREDITS',
    ]);
    for (const domain of ['payroll', 'expenses', '', 'unknown', 'constructor']) {
      expect(availableReports(session, domain)).toEqual([]);
    }
    expect(availableReports(session).some((report) => report.kind === 'PENDING_REQUESTS')).toBe(
      true
    );
  });
  it('shows payroll only with its own ALL read scope', () => {
    const session: ParsedClientSession = {
      ...sessionBase,
      permissions: new Set(['payroll:read', 'leave:read']),
      permissionScopes: { 'payroll:read': 'ALL', 'leave:read': 'SELF' },
    };
    expect(availableReports(session).map((report) => report.kind)).toEqual([
      'PAYROLL_REGISTER',
      'UNPAID_LEAVE',
    ]);
  });
  it('does not treat payroll management or analytics access as payroll read access', () => {
    const session: ParsedClientSession = {
      ...sessionBase,
      permissions: new Set(['payroll:manage', 'analytics:read']),
      permissionScopes: { 'payroll:manage': 'ALL', 'analytics:read': 'ALL' },
    };
    expect(availableReports(session)).toEqual([]);
  });
});
