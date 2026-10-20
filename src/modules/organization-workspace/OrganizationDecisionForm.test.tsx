// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationDecisionForm from './OrganizationDecisionForm';
import type { OrganizationScope } from './organizationTypes';

vi.mock('./organizationResource', () => ({ resourcePending: () => false }));
afterEach(cleanup);

const reference = {
  resourceId: 'leave-a',
  membershipId: 'membership-b',
  tenantId: 'tenant-b',
  companyName: 'Company B',
  employeeId: 'employee-b',
  employeeName: 'Employee B',
  kind: 'leave_request',
  version: 7,
};
const scopeFor = (target: string, submit = vi.fn().mockResolvedValue(undefined)) =>
  ({
    organization: { id: 'org-a' },
    company: { membershipId: target },
    companies: [{ membershipId: 'membership-b', capabilities: ['leave:approve'] }],
    commands: { commands: [], submit },
  }) as unknown as OrganizationScope;

it('requires the source company to be explicitly selected before approving', () => {
  render(
    <OrganizationDecisionForm
      scope={scopeFor('membership-a')}
      reference={reference}
      record={{ expected_workflow_step_id: 'step-source' }}
      version={7}
    />
  );
  expect(
    screen.getByRole('button', { name: 'Approve in Company B' }).hasAttribute('disabled')
  ).toBe(true);
  expect(screen.getByText(/Select Company B as the business target/)).toBeDefined();
});

it('sends the current source version and workflow step with a stable command identity', () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  render(
    <OrganizationDecisionForm
      scope={scopeFor('membership-b', submit)}
      reference={reference}
      record={{ expected_workflow_step_id: 'step-source' }}
      version={13}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Approve in Company B' }));
  expect(submit).toHaveBeenCalledWith(
    'org-a',
    'Company B',
    expect.objectContaining({
      membershipId: 'membership-b',
      resourceId: 'leave-a',
      expectedVersion: 13,
      payload: { decision: 'approve', expected_workflow_step_id: 'step-source' },
    })
  );
});
