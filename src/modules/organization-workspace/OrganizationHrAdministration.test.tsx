// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationHrAdministration from './OrganizationHrAdministration';
import type { OrganizationScope } from './organizationTypes';

vi.mock('./OrganizationEmployeesAdmin', () => ({ default: () => <p>Employee editor</p> }));
vi.mock('./OrganizationAccountsAdmin', () => ({ default: () => <p>Account editor</p> }));
vi.mock('./OrganizationWorkflowsAdmin', () => ({ default: () => <p>Workflow editor</p> }));
vi.mock('./OrganizationSeparationsAdmin', () => ({ default: () => <p>Exit editor</p> }));
afterEach(cleanup);

function scope(capabilities: string[], installedVersion = 3): OrganizationScope {
  return {
    company: {
      membershipId: 'target',
      name: 'Target Company',
      status: 'ACTIVE',
      runtimeStatus: 'ACTIVE',
      version: 3,
      installedVersion,
      capabilities,
    },
  } as unknown as OrganizationScope;
}

it('shows only explicitly granted source HR sections, without requiring metadata administration', () => {
  render(<OrganizationHrAdministration scope={scope(['role:manage'])} />);
  expect(screen.getByText('Account editor')).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Employees' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Approval workflows' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Employee exits and clearance' })).toBeNull();
});

it('requires source-confirmed membership and does not infer account authority from employee management', () => {
  const view = render(<OrganizationHrAdministration scope={scope(['employee:manage'], 2)} />);
  expect(screen.getByText(/Source membership setup must finish/)).toBeDefined();
  expect(screen.queryByText('Employee editor')).toBeNull();
  view.rerender(<OrganizationHrAdministration scope={scope(['employee:manage'])} />);
  expect(screen.getByText('Employee editor')).toBeDefined();
  expect(screen.queryByText('Account editor')).toBeNull();
});
