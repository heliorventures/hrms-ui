import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';

import { availableReports } from './reportCatalog';

const session = (permission: string, scope: string) =>
  ({
    permissions: new Set([permission]),
    permissionScopes: { [permission]: scope },
  }) as unknown as ParsedClientSession;

describe('expense and travel report authority', () => {
  it('shows claims only for expense ALL readers', () => {
    const reports = availableReports(session('expense:read', 'ALL'));
    expect(reports.map((report) => report.kind)).toContain('EXPENSE_CLAIMS');
    expect(reports.map((report) => report.kind)).not.toContain('TRAVEL_REQUESTS');
  });
  it('shows travel only for travel ALL readers', () => {
    const reports = availableReports(session('travel:read', 'ALL'));
    expect(reports.map((report) => report.kind)).toContain('TRAVEL_REQUESTS');
    expect(reports.map((report) => report.kind)).not.toContain('EXPENSE_CLAIMS');
  });
  it('does not grant company reports to self readers or approvers', () => {
    for (const permission of ['expense:read', 'travel:read', 'expense:approve', 'travel:approve']) {
      const kinds = availableReports(session(permission, 'SELF')).map((report) => report.kind);
      expect(kinds).not.toContain('EXPENSE_CLAIMS');
      expect(kinds).not.toContain('TRAVEL_REQUESTS');
    }
  });
});
