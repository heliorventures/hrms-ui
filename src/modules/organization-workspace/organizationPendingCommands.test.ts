import { expect, it, vi } from 'vitest';

import { loadPendingCommands } from './organizationPendingCommands';

const companies = [
  {
    membershipId: 'member-a',
    tenantId: 'tenant-a',
    name: 'Company A',
    status: 'ACTIVE',
    version: 1,
    runtimeStatus: 'ACTIVE',
    installedVersion: 1,
    directorySyncStatus: 'COMPLETE',
    capabilities: ['leave:approve'],
  },
];
const row = {
  command_id: 'command-a',
  resource_id: 'leave-a',
  membership_id: 'member-a',
  tenant_id: 'tenant-a',
  operation: 'leave_decision',
  status: 'SUBMITTED',
  expected_version: 3,
  payload: { private: 'must not recover' },
};
const page = (items: unknown[], hasNextPage = false, endCursor: string | null = null) => ({
  schemaVersion: 1,
  items,
  hasNextPage,
  endCursor,
});

it('fully pages backend references and discards any payload from the response', async () => {
  const load = vi
    .fn()
    .mockResolvedValueOnce(page([row], true, 'command-a'))
    .mockResolvedValueOnce(page([{ ...row, command_id: 'command-b' }]));
  const result = await loadPendingCommands(companies, load);
  expect(load.mock.calls).toEqual([[null], ['command-a']]);
  expect(result).toHaveLength(2);
  expect(result[0].references[0]).not.toHaveProperty('payload');
  expect(JSON.stringify(result)).not.toContain('must not recover');
});

it('refuses pending references for a different source company or revoked capability', async () => {
  await expect(
    loadPendingCommands(companies, () => Promise.resolve(page([{ ...row, tenant_id: 'other' }])))
  ).rejects.toThrow('authority changed');
  await expect(
    loadPendingCommands([{ ...companies[0], capabilities: [] }], () => Promise.resolve(page([row])))
  ).rejects.toThrow('authority changed');
});

it('fails closed for terminal commands, invalid versions and repeated pagination cursors', async () => {
  await expect(
    loadPendingCommands(companies, () => Promise.resolve(page([{ ...row, status: 'COMMITTED' }])))
  ).rejects.toThrow('authority changed');
  await expect(
    loadPendingCommands(companies, () => Promise.resolve(page([{ ...row, expected_version: 0 }])))
  ).rejects.toThrow('version is unavailable');
  await expect(
    loadPendingCommands(companies, () => Promise.resolve(page([], true, 'same')))
  ).rejects.toThrow('pagination is unavailable');
});
