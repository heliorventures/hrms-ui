// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import {
  OrganizationApprovalsDocument,
  OrganizationCapabilityCatalogDocument,
  OrganizationCompaniesDocument,
  OrganizationConfigurationDocument,
  OrganizationOperation,
  OrganizationPendingCommandsDocument,
  OrganizationResourceDocument,
} from '../../api/organization/graphql';

import type {
  OrganizationClientScope,
  OrganizationCommands,
  OrganizationWorkspace,
} from './organizationTypes';
import OrganizationWorkspaceShell from './OrganizationWorkspaceShell';

afterEach(cleanup);

const organization: OrganizationWorkspace = {
  id: 'org-a',
  name: 'Synthetic Organization',
  version: 1,
  canManage: false,
  canDelegate: false,
  canApprove: false,
  canReview: false,
  canReport: false,
  canHistory: false,
  canPayroll: false,
};
const commands: OrganizationCommands = {
  commands: [],
  submit: vi.fn().mockResolvedValue(undefined),
  retry: vi.fn().mockResolvedValue(undefined),
  check: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn().mockResolvedValue(undefined),
  retainOrganizations: vi.fn(),
  retainCompanies: vi.fn(),
  reset: vi.fn(),
  restorePending: vi.fn(),
  beginPendingRecovery: vi.fn(() => vi.fn(() => false)),
};
const accessWith = (request: unknown): OrganizationClientScope => ({
  client: { request } as GraphQLClient,
  ownerKey: 'source-user|source-company',
  sourceCompanyId: 'source-company',
  sourceCompanyName: 'Employment Company',
  sourceReady: true,
});

it('keeps payroll unavailable to metadata-only administrators', async () => {
  const request = vi.fn().mockImplementation((document: unknown) => {
    if (document === OrganizationPendingCommandsDocument)
      return Promise.resolve({
        organizationPendingCommands: {
          schemaVersion: 1,
          items: [],
          hasNextPage: false,
          endCursor: null,
          graphVersion: 1,
        },
      });
    if (document === OrganizationCompaniesDocument)
      return Promise.resolve({
        organizationCompanies: [
          {
            membershipId: 'member-a',
            tenantId: 'company-a',
            name: 'Company A',
            status: 'ACTIVE',
            version: 1,
            runtimeStatus: 'ACTIVE',
            installedVersion: 1,
            directorySyncStatus: 'COMPLETE',
            capabilities: ['organization:manage'],
          },
        ],
      });
    if (document === OrganizationCapabilityCatalogDocument)
      return Promise.resolve({ organizationCapabilityCatalog: ['organization:manage'] });
    if (document === OrganizationConfigurationDocument)
      return Promise.resolve({
        organizationConfiguration: {
          schemaVersion: 1,
          items: [],
          nextCursor: null,
          organizationVersion: 1,
        },
      });
    return Promise.reject(new Error('Unexpected synthetic operation'));
  });
  render(
    <OrganizationWorkspaceShell
      access={accessWith(request)}
      organization={{ ...organization, canManage: true }}
      commands={commands}
      refreshAccess={vi.fn()}
    />
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Administration' })).toBeDefined());
  expect(screen.queryByRole('button', { name: 'Scoped payroll' })).toBeNull();
  expect(request.mock.calls.some(([document]) => document === OrganizationResourceDocument)).toBe(
    false
  );
});

it('does not read payroll until the user selects an explicit authorized business company', async () => {
  const request = vi.fn().mockImplementation((document: unknown) => {
    if (document === OrganizationPendingCommandsDocument)
      return Promise.resolve({
        organizationPendingCommands: {
          schemaVersion: 1,
          items: [],
          hasNextPage: false,
          endCursor: null,
          graphVersion: 1,
        },
      });
    if (document === OrganizationCompaniesDocument)
      return Promise.resolve({
        organizationCompanies: [
          {
            membershipId: 'member-b',
            tenantId: 'company-b',
            name: 'Company B',
            status: 'ACTIVE',
            version: 7,
            runtimeStatus: 'ACTIVE',
            installedVersion: 7,
            directorySyncStatus: 'COMPLETE',
            capabilities: ['leave:approve', 'payroll:manage'],
          },
        ],
      });
    if (document === OrganizationApprovalsDocument)
      return Promise.resolve({
        organizationApprovals: {
          schemaVersion: 1,
          items: [],
          endCursor: null,
          hasNextPage: false,
          graphVersion: 1,
        },
      });
    if (document === OrganizationResourceDocument)
      return Promise.resolve({
        organizationResource: {
          commandId: 'read-b',
          resourceId: 'member-b',
          status: 'COMMITTED',
          resourceVersion: 7,
          result: { cycles: [], after: null, has_more: false },
        },
      });
    return Promise.reject(new Error('Unexpected synthetic operation'));
  });
  render(
    <OrganizationWorkspaceShell
      access={accessWith(request)}
      organization={{ ...organization, canApprove: true, canPayroll: true }}
      commands={commands}
      refreshAccess={vi.fn()}
    />
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Scoped payroll' })).toBeDefined());
  fireEvent.click(screen.getByRole('button', { name: 'Scoped payroll' }));
  await waitFor(() =>
    expect(
      screen.getByText('Select the explicit business target company for payroll.')
    ).toBeDefined()
  );
  expect(request.mock.calls.some(([document]) => document === OrganizationResourceDocument)).toBe(
    false
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Business target company' }), {
    target: { value: 'member-b' },
  });
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      OrganizationResourceDocument,
      expect.objectContaining({
        organizationId: 'org-a',
        membershipId: 'member-b',
        resourceId: 'member-b',
        expectedVersion: 7,
        operation: OrganizationOperation.PayrollList,
      })
    )
  );
  expect(accessWith(request).sourceCompanyId).toBe('source-company');
});
