// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { OrganizationResourceDocument } from '../../api/organization/graphql';

import OrganizationPayrollReview from './OrganizationPayrollReview';
import type { OrganizationCompany, OrganizationScope } from './organizationTypes';

vi.mock('./OrganizationReviewedPayroll', () => ({
  default: () => <p>Confirmed source payroll draft</p>,
}));
afterEach(cleanup);

it('reads one source payroll cycle through PayrollDetail with its resource version instead of the membership collection contract', async () => {
  const company: OrganizationCompany = {
    membershipId: 'target-membership',
    tenantId: 'target-tenant',
    name: 'Target company',
    version: 19,
    status: 'ACTIVE',
    capabilities: ['payroll:manage'],
    runtimeStatus: 'ACTIVE',
    installedVersion: 19,
    directorySyncStatus: 'COMPLETE',
  };
  const cycle = { id: 'selected-cycle', version: 7 };
  const response = {
    organizationResource: {
      commandId: 'source-read',
      resourceId: cycle.id,
      resourceVersion: 7,
      status: 'COMMITTED',
      result: {
        cycle: { id: cycle.id },
        draft: {
          cycle_id: cycle.id,
          revision: 3,
          fingerprint: 'protected-source-fingerprint',
          can_finalize: true,
          employees: [],
        },
      },
    },
  };
  const request = vi.fn().mockResolvedValue(response);
  const scope = {
    ownerKey: 'source-session',
    organization: { id: 'organization', version: 2 },
    company,
    companies: [company],
    commands: { commands: [] },
    client: { request } as unknown as GraphQLClient,
    refreshAccess: vi.fn(),
  } as unknown as OrganizationScope;
  render(
    <OrganizationPayrollReview scope={scope} company={company} cycle={cycle} onClose={vi.fn()} />
  );
  await waitFor(() => expect(screen.getByText('Confirmed source payroll draft')).toBeDefined());
  expect(request).toHaveBeenCalledWith(OrganizationResourceDocument, {
    organizationId: 'organization',
    membershipId: company.membershipId,
    operation: 'PAYROLL_DETAIL',
    resourceId: cycle.id,
    expectedVersion: 7,
    payload: { cycle_id: cycle.id, first: 1 },
  });
});
