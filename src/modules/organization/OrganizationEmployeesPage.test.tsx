// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import OrganizationEmployeesPage from './OrganizationEmployeesPage';

const state = vi.hoisted(() => ({ owner: 'tenant-a', client: { request: vi.fn() } }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ clientSession: {} }) }));
vi.mock('../../auth/permissionService', () => ({ authorizationStateKey: () => state.owner }));

const employee = (id: string, name: string) => ({
  employeeId: id,
  employeeCode: id,
  fullName: name,
  status: 'Active',
  employmentType: 'Full-time',
  departmentName: 'Engineering',
  designationTitle: 'Engineer',
  reportingManagerName: 'Manager',
  dateOfJoining: '2024-01-12',
});
const response = (rows: ReturnType<typeof employee>[], cursor: string | null = null) => ({
  employeeDirectoryPage: { rows, hasMore: cursor !== null, nextCursor: cursor },
});
const View = () => (
  <MemoryRouter>
    <OrganizationEmployeesPage />
  </MemoryRouter>
);

beforeEach(() => {
  state.owner = 'tenant-a';
  state.client.request.mockReset();
});
afterEach(cleanup);

it('loads every directory page and keeps search when selecting an employee', async () => {
  state.client.request
    .mockResolvedValueOnce(response([employee('maya', 'Maya Shah')], 'next'))
    .mockResolvedValueOnce(response([employee('arjun', 'Arjun Rao')]));
  render(<View />);
  await screen.findByRole('button', { name: 'Show work details for Arjun Rao (arjun)' });
  expect(state.client.request.mock.calls[1]?.[0]).toMatchObject({
    variables: { limit: 100, after: 'next' },
  });
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search employees' }), {
    target: { value: 'Engineering' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Show work details for Arjun Rao (arjun)' }));
  expect(screen.getByRole('searchbox', { name: 'Search employees' })).toHaveProperty(
    'value',
    'Engineering'
  );
  expect(screen.getByRole('region', { name: 'Work details for Arjun Rao' })).toBeTruthy();
});

it('clears previous directory and selection immediately when authorization changes', async () => {
  state.client.request.mockResolvedValueOnce(response([employee('maya', 'Maya Shah')]));
  const { rerender } = render(<View />);
  await screen.findByRole('region', { name: 'Work details for Maya Shah' });
  let finish: ((value: ReturnType<typeof response>) => void) | undefined;
  state.client.request.mockImplementationOnce(
    () =>
      new Promise<ReturnType<typeof response>>((resolve) => {
        finish = resolve;
      })
  );
  state.owner = 'tenant-b';
  rerender(<View />);
  expect(screen.queryByRole('region', { name: 'Work details for Maya Shah' })).toBeNull();
  await waitFor(() => expect(finish).toBeDefined());
  await act(async () => {
    finish?.(response([employee('arjun', 'Arjun Rao')]));
  });
  expect(await screen.findByRole('region', { name: 'Work details for Arjun Rao' })).toBeTruthy();
});

it('keeps loaded cards visible with an incomplete-data notice when a later page fails', async () => {
  state.client.request
    .mockResolvedValueOnce(response([employee('maya', 'Maya Shah')], 'next'))
    .mockRejectedValueOnce(new Error('Later page unavailable'));
  render(<View />);
  expect(await screen.findByRole('region', { name: 'Work details for Maya Shah' })).toBeTruthy();
  expect(screen.getByText(/Loaded 1 employees, but a later directory page failed/)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
});

it.each(['request failure', 'invalid cursor'])(
  'retains the complete directory and selection after a refresh %s',
  async (failure) => {
    state.client.request
      .mockResolvedValueOnce(response([employee('maya', 'Maya Shah')], 'next'))
      .mockResolvedValueOnce(response([employee('arjun', 'Arjun Rao')]));
    render(<View />);
    const selected = await screen.findByRole('button', {
      name: 'Show work details for Arjun Rao (arjun)',
    });
    fireEvent.click(selected);
    state.client.request.mockResolvedValueOnce(response([employee('maya', 'Maya Shah')], 'next'));
    if (failure === 'request failure')
      state.client.request.mockRejectedValueOnce(new Error('Later page unavailable'));
    else
      state.client.request.mockResolvedValueOnce({
        employeeDirectoryPage: { rows: [], hasMore: true, nextCursor: 'next' },
      });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await screen.findByText('Directory refresh failed');
    expect(screen.getByRole('region', { name: 'Work details for Arjun Rao' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Show work details for Maya Shah (maya)' })
    ).toBeTruthy();
    expect(screen.getByText('2 employees')).toBeTruthy();
  }
);
