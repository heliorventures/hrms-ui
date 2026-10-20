import type { GraphQLClient } from 'graphql-request';
import { expect, it, vi } from 'vitest';

import {
  OrganizationOperation,
  OrganizationResourceDocument,
} from '../../api/organization/graphql';

import { organizationCommandTransport, readOrganizationResource } from './organizationApi';

it('revalidates authorization when the source company rejects a protected read after authority changed', async () => {
  const outcome = {
    commandId: 'read-a',
    resourceId: 'leave-a',
    resourceVersion: 7,
    status: 'REJECTED',
    result: { code: 'AUTHORITY_CHANGED' },
  };
  const request = vi.fn().mockResolvedValue({ organizationResource: outcome });
  const refresh = vi.fn();
  const variables = {
    organizationId: 'org-a',
    membershipId: 'member-a',
    operation: OrganizationOperation.LeaveDetail,
    resourceId: 'leave-a',
    expectedVersion: 7,
  };
  expect(
    await readOrganizationResource({ request } as unknown as GraphQLClient, variables, refresh)
  ).toEqual(outcome);
  expect(request).toHaveBeenCalledWith(OrganizationResourceDocument, variables);
  expect(refresh).toHaveBeenCalledOnce();
});

it.each(['CANCELLED_NOT_EXECUTED', 'AWAITING_CONFIRMATION'])(
  'uses source cancellation and refreshes workflow access only after confirmed non-execution: %s',
  async (status) => {
    const outcome = {
      commandId: 'original-command',
      resourceId: 'leave-a',
      resourceVersion: 7,
      status,
      result: {},
    };
    const request = vi.fn().mockResolvedValue({ cancelPendingOrganizationCommand: outcome });
    const refresh = vi.fn();
    const transport = organizationCommandTransport(
      { request } as unknown as GraphQLClient,
      refresh
    );
    expect(await transport.cancel('original-command')).toEqual(outcome);
    expect(request).toHaveBeenCalledWith(expect.anything(), { commandId: 'original-command' });
    expect(refresh).toHaveBeenCalledTimes(status === 'CANCELLED_NOT_EXECUTED' ? 1 : 0);
  }
);
