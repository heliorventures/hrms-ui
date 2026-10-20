import { expect, it } from 'vitest';

import { readHistoryArchive } from './organizationArchiveModel';
import type { OrganizationCompany } from './organizationTypes';

const company: OrganizationCompany = {
  membershipId: 'membership',
  tenantId: 'tenant',
  name: 'Authorized company',
  status: 'ACTIVE',
  version: 2,
  capabilities: ['history:read', 'history:export'],
  runtimeStatus: 'ACTIVE',
  installedVersion: 2,
  directorySyncStatus: 'READY',
};
const archive = () => ({
  schema_version: 1,
  manifest: {
    id: 'archive',
    organization_id: 'organization',
    membership_id: company.membershipId,
    source_tenant_id: company.tenantId,
    membership_version: 1,
    row_count: 1,
  },
  items: [{ id: 'event', source_tenant_id: company.tenantId, event_type: 'employee.updated' }],
});

it('accepts a retained archive bound to its original membership version and current authorized company', () => {
  expect(readHistoryArchive(archive(), 'organization', company, 'archive').items).toHaveLength(1);
});

it('rejects mismatched archive identity, organization, tenant and row counts', () => {
  expect(() => readHistoryArchive(archive(), 'other-organization', company, 'archive')).toThrow(
    'authorized source'
  );
  expect(() => readHistoryArchive(archive(), 'organization', company, 'other-archive')).toThrow(
    'authorized source'
  );
  const wrongTenant = archive();
  wrongTenant.items[0].source_tenant_id = 'other-tenant';
  expect(() => readHistoryArchive(wrongTenant, 'organization', company, 'archive')).toThrow(
    'manifest'
  );
  const wrongCount = archive();
  wrongCount.manifest.row_count = 2;
  expect(() => readHistoryArchive(wrongCount, 'organization', company, 'archive')).toThrow(
    'manifest'
  );
});
