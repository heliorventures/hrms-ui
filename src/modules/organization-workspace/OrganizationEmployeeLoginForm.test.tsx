// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationEmployeeLoginForm from './OrganizationEmployeeLoginForm';
import type { OrganizationScope } from './organizationTypes';

vi.mock('./useOrganizationSourceList', () => ({
  useOrganizationSourceList: () => ({
    loading: false,
    error: null,
    refresh: vi.fn(),
    data: {
      record: { available_roles: [{ role_id: 'source-role', name: 'Source employee role' }] },
    },
  }),
}));
afterEach(cleanup);

it('creates a new linked login using the selected employee and source version, with explicitly selected source roles', async () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  const saved = vi.fn();
  const scope = {
    organization: { id: 'organization' },
    company: { membershipId: 'target-company', name: 'Target Company' },
    commands: { commands: [], submit },
  } as unknown as OrganizationScope;
  render(
    <OrganizationEmployeeLoginForm
      scope={scope}
      employeeId="selected-employee"
      version={17}
      onSaved={saved}
    />
  );
  expect(
    screen.getByRole('button', { name: 'Create and link employee login' }).hasAttribute('disabled')
  ).toBe(true);
  fireEvent.click(screen.getByLabelText('Source employee role'));
  fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'employee-login' } });
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'employee@example.test' } });
  fireEvent.change(screen.getByLabelText(/Initial password/), {
    target: { value: 'synthetic-initial-secret' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create and link employee login' }));
  await waitFor(() =>
    expect(submit).toHaveBeenCalledWith(
      'organization',
      'Target Company',
      expect.objectContaining({
        membershipId: 'target-company',
        resourceId: 'selected-employee',
        expectedVersion: 17,
        operation: 'employee_login_provision',
        payload: {
          username: 'employee-login',
          email: 'employee@example.test',
          initial_password: 'synthetic-initial-secret',
          role_ids: ['source-role'],
        },
      })
    )
  );
  expect(screen.getByLabelText<HTMLInputElement>(/Initial password/).value).toBe('');
  expect(saved).toHaveBeenCalledOnce();
});
