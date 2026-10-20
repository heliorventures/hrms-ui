import { expect, it } from 'vitest';

import {
  companyHistoryRows,
  companyProgressRows,
  formatReportedHours,
  historyDateBounds,
  progressIsPartial,
} from './organizationReportingModel';

it('shows missing company data as unavailable and preserves an explicit reported zero', () => {
  const companies = [
    { membershipId: 'a', name: 'Company A' },
    { membershipId: 'b', name: 'Company B' },
  ];
  const rows = companyProgressRows(companies, {
    schema_version: 1,
    partial: true,
    companies: [
      {
        membership_id: 'a',
        logged_seconds: 0,
        approved_seconds: 3600,
        freshness: { state: 'CURRENT' },
      },
    ],
  });
  expect(rows[0].logged).toBe('0.00');
  expect(rows[0].approved).toBe('1.00');
  expect(rows[1].logged).toBe('Unavailable');
  expect(rows[1].freshness).toEqual({ state: 'MISSING' });
  expect(formatReportedHours(null)).toBe('Unavailable');
  expect(formatReportedHours(-4)).toBe('Unavailable');
  expect(formatReportedHours('3600')).toBe('1.00');
  expect(formatReportedHours('9007199254740993')).toBe('2501999792983.61');
  expect(formatReportedHours(Number('9007199254740993'))).toBe('Unavailable');
});

it('rejects unsupported report schema versions', () => {
  expect(() => companyProgressRows([], { schema_version: 7, companies: [] })).toThrow(
    'Unsupported organization data version'
  );
});

it('requires every history row to match the current authorized company selection', () => {
  const companies = [{ tenantId: 'tenant-a', name: 'Company A' }];
  expect(
    companyHistoryRows(companies, 1, [{ id: 'event-a', source_tenant_id: 'tenant-a' }])
  ).toEqual([{ id: 'event-a', source_tenant_id: 'tenant-a', company_name: 'Company A' }]);
  expect(() =>
    companyHistoryRows(companies, 1, [{ id: 'event-b', source_tenant_id: 'tenant-b' }])
  ).toThrow('authorized source company');
});

it('uses the source READY freshness contract when determining report completeness', () => {
  expect(progressIsPartial(false, [{ freshness: { state: 'READY' } }])).toBe(false);
  expect(progressIsPartial(false, [{ freshness: { state: 'STALE' } }])).toBe(true);
  expect(progressIsPartial(true, [{ freshness: { state: 'READY' } }])).toBe(true);
});

it('bounds an inclusive UTC history date at the final millisecond of that date', () => {
  expect(historyDateBounds({ from: '2026-10-01', to: '2026-10-19' })).toEqual({
    from: '2026-10-01T00:00:00.000Z',
    to: '2026-10-19T23:59:59.999Z',
  });
});
