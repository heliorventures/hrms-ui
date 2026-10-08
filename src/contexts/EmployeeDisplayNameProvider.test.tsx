// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import EmployeeDisplayNameProvider from './EmployeeDisplayNameProvider';
import { useEmployeeDisplayName } from './employeeDisplayNameContext';

const state = vi.hoisted(() => ({ tenant: 'one', userId: 'user-1', request: vi.fn() }));
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: { id: state.userId, name: 'login.name' },
    tenantId: state.tenant,
    isAuthenticated: true,
  }),
}));
vi.mock('./TenantContext', () => ({ useTenant: () => ({ currentTenant: { id: state.tenant } }) }));
vi.mock('../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
const Name = () => <p>{useEmployeeDisplayName()}</p>;
afterEach(() => {
  cleanup();
  state.tenant = 'one';
  state.userId = 'user-1';
  vi.clearAllMocks();
});

it('uses the employee first and last name instead of parsing the login name', async () => {
  state.request.mockResolvedValue({ myEmployee: { firstName: ' Aniket ', lastName: ' Dhobada ' } });
  render(
    <EmployeeDisplayNameProvider>
      <Name />
    </EmployeeDisplayNameProvider>
  );
  expect(await screen.findByText('Aniket Dhobada')).toBeTruthy();
});

it('never displays a previous tenant name or accepts its late response', async () => {
  let resolveOld!: (value: unknown) => void;
  state.request
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        })
    )
    .mockResolvedValue({ myEmployee: { firstName: 'Other', lastName: 'Employee' } });
  const view = render(
    <EmployeeDisplayNameProvider>
      <Name />
    </EmployeeDisplayNameProvider>
  );
  state.tenant = 'two';
  state.userId = 'user-2';
  view.rerender(
    <EmployeeDisplayNameProvider>
      <Name />
    </EmployeeDisplayNameProvider>
  );
  expect(await screen.findByText('Other Employee')).toBeTruthy();
  await act(async () => resolveOld({ myEmployee: { firstName: 'Old', lastName: 'Employee' } }));
  expect(screen.queryByText('Old Employee')).toBeNull();
});

it('keeps the account fallback when the employee lookup fails', async () => {
  state.request.mockRejectedValue(new Error('Unavailable'));
  render(
    <EmployeeDisplayNameProvider>
      <Name />
    </EmployeeDisplayNameProvider>
  );
  await waitFor(() => expect(state.request).toHaveBeenCalled());
  expect(screen.getByText('login.name')).toBeTruthy();
});
