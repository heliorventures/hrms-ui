// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationCompanyActions from './OrganizationCompanyActions';
import type { OrganizationScope } from './organizationTypes';

afterEach(cleanup);

function fixture(status: string, sourceCompanyId = 'login-company') {
  const submit = vi.fn().mockResolvedValue(undefined);
  const company = {
    membershipId: 'member-a',
    tenantId: 'target-company',
    name: 'Company A',
    status,
    version: 3,
    runtimeStatus: 'ACTIVE',
    installedVersion: 2,
    capabilities: ['organization:manage'],
    directorySyncStatus: 'COMPLETE',
  };
  const scope = {
    organization: { id: 'org-a' },
    sourceCompanyId,
    companies: [company],
    commands: { commands: [], submit },
  } as unknown as OrganizationScope;
  const row = { id: 'member-a', tenant_id: 'target-company', status, version: 3 };
  return { scope, row, submit };
}

it('installs suspended membership through the source command journal and offers explicit resume', () => {
  const { scope, row, submit } = fixture('SUSPENDED');
  render(
    <OrganizationCompanyActions
      scope={scope}
      row={row}
      organizationVersion={8}
      busy={false}
      run={vi.fn()}
    />
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Install membership state in source company' })
  );
  expect(submit).toHaveBeenCalledWith(
    'org-a',
    'Company A',
    expect.objectContaining({
      membershipId: 'member-a',
      resourceId: 'member-a',
      expectedVersion: 3,
      operation: 'install_membership',
      payload: {},
    })
  );
  expect(screen.getByRole('button', { name: 'Resume company' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Suspend company' })).toBeNull();
});

it('keeps the authenticated login company active and offers source installation recovery', () => {
  const { scope, row } = fixture('ACTIVE', 'target-company');
  render(
    <OrganizationCompanyActions
      scope={scope}
      row={row}
      organizationVersion={8}
      busy={false}
      run={vi.fn()}
    />
  );
  expect(screen.queryByRole('button', { name: 'Suspend company' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Begin company detachment' })).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Install membership state in source company' })
  ).toBeDefined();
  expect(screen.getByText(/Your login company must remain active/)).toBeDefined();
});

it('requires confirmation before beginning detachment and labels its source retirement boundary', () => {
  const { scope, row } = fixture('ACTIVE');
  const run = vi.fn().mockResolvedValue(undefined);
  render(
    <OrganizationCompanyActions
      scope={scope}
      row={row}
      organizationVersion={8}
      busy={false}
      run={run}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Begin company detachment' }));
  expect(run).not.toHaveBeenCalled();
  expect(screen.getByText(/Detachment retires source assignments/)).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm begin company detachment' }));
  expect(run).toHaveBeenCalledOnce();
});
