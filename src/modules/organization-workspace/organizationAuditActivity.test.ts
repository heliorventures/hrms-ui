import { expect, it } from 'vitest';

import { auditActivityBounds, readAuditActivityPage } from './organizationAuditActivityModel';

const row = {
  id: 'event-a',
  event_type: 'relationship.manager_changed',
  source_tenant_id: 'tenant-a',
  actor_principal_id: 'principal-a',
  aggregate_id: 'assignment-a',
  aggregate_version: '9007199254740993',
  configuration_version: '7',
  occurred_at: '2026-10-19T00:00:00Z',
  payload: { private: 'not permitted' },
  source_user_id: 'local-account',
};
const envelope = {
  schema_version: 1,
  status: 'OBSERVED_ACTIVITY',
  coverage: 'NOT_ATTESTED',
  items: [row],
  has_next_page: false,
  end_cursor: null,
};

it('preserves exact version strings and exposes only permitted configuration activity fields', () => {
  const page = readAuditActivityPage(envelope, [{ tenantId: 'tenant-a', name: 'Company A' }]);
  expect(page.items[0].aggregate_version).toBe('9007199254740993');
  expect(page.items[0].company_name).toBe('Company A');
  expect(page.items[0]).not.toHaveProperty('payload');
  expect(page.items[0]).not.toHaveProperty('source_user_id');
});

it('rejects changed coverage contracts, unsupported document versions and incomplete pagination', () => {
  expect(() => readAuditActivityPage({ ...envelope, coverage: 'COMPLETE' }, [])).toThrow(
    'coverage'
  );
  expect(() => readAuditActivityPage({ ...envelope, schema_version: 2 }, [])).toThrow('version');
  expect(() => readAuditActivityPage({ ...envelope, has_next_page: true }, [])).toThrow('cursor');
});

it('bounds configuration activity to at most 31 UTC days', () => {
  expect(auditActivityBounds({ from: '2026-10-01', to: '2026-10-31' }).to).toBe(
    '2026-10-31T23:59:59.999Z'
  );
  expect(() => auditActivityBounds({ from: '2026-10-01', to: '2026-11-01' })).toThrow('31');
  expect(() => auditActivityBounds({ from: '2026-10-20', to: '2026-10-01' })).toThrow('31');
});
