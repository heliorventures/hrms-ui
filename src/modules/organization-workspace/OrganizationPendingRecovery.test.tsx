// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationPendingRecovery from './OrganizationPendingRecovery';
import type { OrganizationScope } from './organizationTypes';

afterEach(cleanup);

const recoveryScope = (request: unknown, reconcile: unknown, refreshAccess = vi.fn()) =>
  ({
    ownerKey: 'actor|source',
    organization: { id: 'org', version: 2 },
    company: null,
    companies: [],
    commands: { restorePending: vi.fn(), beginPendingRecovery: vi.fn(() => reconcile) },
    client: { request },
    refreshAccess,
  }) as unknown as OrganizationScope;

it('refreshes source access and keeps old forms unmounted when full recovery discards obsolete authority', async () => {
  const reconcile = vi.fn(() => true);
  const refreshAccess = vi.fn();
  const scope = recoveryScope(
    vi.fn().mockResolvedValue({
      organizationPendingCommands: { schemaVersion: 1, items: [], hasNextPage: false },
    }),
    reconcile,
    refreshAccess
  );
  const view = render(
    <OrganizationPendingRecovery scope={scope}>
      <button type="button">Old decision</button>
    </OrganizationPendingRecovery>
  );
  await waitFor(() => expect(refreshAccess).toHaveBeenCalledOnce());
  expect(reconcile).toHaveBeenCalledWith([]);
  expect(screen.queryByRole('button', { name: 'Old decision' })).toBeNull();
  view.rerender(
    <OrganizationPendingRecovery scope={{ ...scope }}>
      <button type="button">Old decision</button>
    </OrganizationPendingRecovery>
  );
  expect(refreshAccess).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Old decision' })).toBeNull();
});

it('does not reconcile or refresh from a failed partial pagination result', async () => {
  const reconcile = vi.fn();
  const refreshAccess = vi.fn();
  const request = vi
    .fn()
    .mockResolvedValueOnce({
      organizationPendingCommands: {
        schemaVersion: 1,
        items: [],
        hasNextPage: true,
        endCursor: 'next',
      },
    })
    .mockRejectedValueOnce(new Error('network'));
  render(
    <OrganizationPendingRecovery scope={recoveryScope(request, reconcile, refreshAccess)}>
      <button type="button">Old decision</button>
    </OrganizationPendingRecovery>
  );
  await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
  expect(request).toHaveBeenCalledTimes(2);
  expect(reconcile).not.toHaveBeenCalled();
  expect(refreshAccess).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Old decision' })).toBeNull();
});

it('restores actor-scoped references before mounting actions after reload', async () => {
  let finish: ((value: object) => void) | undefined;
  const restorePending = vi.fn();
  const request = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const scope = {
    ownerKey: 'source-user|source-company',
    organization: { id: 'org-a', version: 1 },
    company: null,
    companies: [
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
    ],
    commands: { restorePending, beginPendingRecovery: vi.fn(() => vi.fn(() => false)) },
    client: { request },
  } as unknown as OrganizationScope;
  render(
    <OrganizationPendingRecovery scope={scope}>
      <button type="button">Approve leave</button>
    </OrganizationPendingRecovery>
  );
  expect(screen.queryByRole('button', { name: 'Approve leave' })).toBeNull();
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  await act(async () => {
    finish?.({
      organizationPendingCommands: {
        schemaVersion: 1,
        items: [
          {
            command_id: 'pending-a',
            resource_id: 'leave-a',
            membership_id: 'member-a',
            tenant_id: 'tenant-a',
            operation: 'leave_decision',
            expected_version: 3,
            status: 'SUBMITTED',
          },
        ],
        hasNextPage: false,
        endCursor: null,
        graphVersion: 1,
      },
    });
    await Promise.resolve();
  });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Approve leave' })).toBeDefined());
  expect(restorePending).toHaveBeenCalledWith('org-a', 'Company A', [
    {
      commandId: 'pending-a',
      resourceId: 'leave-a',
      membershipId: 'member-a',
      operation: 'leave_decision',
      expectedVersion: 3,
    },
  ]);
  expect(request).toHaveBeenCalledWith(expect.anything(), {
    organizationId: 'org-a',
    membershipId: null,
    after: null,
    first: 100,
  });
});
