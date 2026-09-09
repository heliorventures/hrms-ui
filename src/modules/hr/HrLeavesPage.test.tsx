// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import HrLeavesPage from './HrLeavesPage';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  api: { request: vi.fn() },
  clear: vi.fn(),
  show: vi.fn(),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.api }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => true,
    clientSession: {
      employeeId: 'manager',
      permissions: new Set(['leave:read', 'leave:approve']),
      permissionScopes: { 'leave:read': 'ALL', 'leave:approve': 'ALL' },
      resourceScopes: {},
    },
  }),
}));
vi.mock('../../hooks/useFlashToast', () => ({
  useFlashToast: () => ({ show: state.show, clear: state.clear, flash: null }),
}));
vi.mock('../leave/hooks/useLeaveWorkflowTrail', () => ({
  useLeaveWorkflowTrail: () => ({
    clearFailure: state.clear,
    failure: null,
    summaryRow: null,
    rows: [],
    loading: false,
    close: state.clear,
  }),
}));
vi.mock('../leave/components/ApplyLeaveModal', () => ({ default: () => null }));
vi.mock('../leave/components/LeaveRejectModal', () => ({ default: () => null }));
vi.mock('../leave/components/LeaveWorkflowTrailModal', () => ({ default: () => null }));
vi.mock('./components/LeaveTeamCalendar', () => ({ default: () => <p>Team calendar</p> }));
vi.mock('../leave/components/CompOffApprovalPanel', () => ({ default: () => null }));
vi.mock('../../utils/graphqlUserMessage', () => ({
  graphQlUserMessage: (error: Error) => error.message,
}));
vi.mock('../leave/components/LeaveRequestsTableSection', () => ({
  default: ({
    rows,
    onApprove,
  }: {
    rows: { id: string }[];
    onApprove: (id: string, step: string) => void;
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id}>
          <p>{row.id}</p>
          <button onClick={() => onApprove(row.id, 'workflow-step')}>Approve {row.id}</button>
        </div>
      ))}
    </div>
  ),
}));
function boardResponse(offset = 0) {
  return {
    viewerEmployeeId: 'manager',
    leaveTypes: [],
    leaveBalances: [],
    leavePolicies: [],
    upcomingHolidays: [],
    leaveApprovalQueue: {
      totalCount: 141,
      pendingCount: 131,
      actionableCount: 121,
      rows: [{ id: offset ? 'older-request' : 'first-request', viewerMayApprove: true }],
    },
  };
}
beforeEach(() => {
  state.api = {
    request: vi.fn((document: unknown, variables?: { offset?: number }) => {
      if (
        document &&
        typeof document === 'object' &&
        'document' in document &&
        String(document.document).includes('HrLeaveApplicationHolidays')
      )
        return Promise.resolve({ upcomingHolidays: [] });
      return state.client.request(document, variables) as Promise<unknown>;
    }),
  };
  state.client = {
    request: vi.fn((_document: unknown, variables: { offset?: number }) =>
      Promise.resolve(boardResponse(variables.offset))
    ),
  };
});

it('keeps a failed decision visible when the following refresh also fails', async () => {
  const board = boardResponse();
  state.client.request
    .mockResolvedValueOnce(board)
    .mockRejectedValueOnce(new Error('Decision changed; review again'))
    .mockRejectedValueOnce(new Error('Refresh unavailable'));
  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Approve first-request' }));
  await waitFor(() => expect(state.client.request).toHaveBeenCalledTimes(3));
  expect(await screen.findByText('Decision changed; review again')).toBeTruthy();
});

it('recovers keyboard focus when a successful approval removes its row', async () => {
  const board = boardResponse();
  state.client.request
    .mockResolvedValueOnce(board)
    .mockResolvedValueOnce({ approveLeaveRequest: { status: 'APPROVED' } })
    .mockResolvedValueOnce({
      ...board,
      leaveApprovalQueue: { rows: [], totalCount: 0, pendingCount: 0, actionableCount: 0 },
    });
  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );
  const approve = await screen.findByRole('button', { name: 'Approve first-request' });
  approve.focus();
  fireEvent.click(approve);
  await waitFor(() => expect(screen.queryByText('first-request')).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Leave approval queue' })
    )
  );
});
afterEach(cleanup);
it('retains queue focus when removing the last request moves back to an earlier page', async () => {
  const firstPage = boardResponse();
  const secondPage = boardResponse(20);
  state.client.request
    .mockResolvedValueOnce({
      ...secondPage,
      leaveApprovalQueue: { ...secondPage.leaveApprovalQueue, totalCount: 21 },
    })
    .mockResolvedValueOnce({ approveLeaveRequest: { status: 'APPROVED' } })
    .mockResolvedValueOnce({
      ...secondPage,
      leaveApprovalQueue: { ...secondPage.leaveApprovalQueue, rows: [], totalCount: 20 },
    })
    .mockResolvedValueOnce({
      ...firstPage,
      leaveApprovalQueue: { ...firstPage.leaveApprovalQueue, totalCount: 20 },
    });
  render(
    <MemoryRouter initialEntries={['/?page=1']}>
      <HrLeavesPage />
    </MemoryRouter>
  );
  const approve = await screen.findByRole('button', { name: 'Approve older-request' });
  approve.focus();
  fireEvent.click(approve);
  await screen.findByText('first-request');
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Leave approval queue' })
    )
  );
});
it('pages the complete filtered server queue and displays authoritative scope counts', async () => {
  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );
  await screen.findByText('first-request');
  expect(screen.getByRole('button', { name: /Pending in scope \(131\)/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Needs my action \(121\)/ })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Next leave requests' }));
  await screen.findByText('older-request');
  expect(state.client.request).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ offset: 20 })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Approved' }));
  await waitFor(() =>
    expect(state.client.request).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ offset: 0, status: 'APPROVED', needsMyAction: false })
    )
  );
  fireEvent.click(screen.getByRole('button', { name: /Needs my action/ }));
  await waitFor(() =>
    expect(state.client.request).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ offset: 0, needsMyAction: true })
    )
  );
});

it('does not publish an older response after changing the selected filter', async () => {
  let resolveOld!: (value: unknown) => void;
  state.client.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      })
  );
  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Approved' }));
  await screen.findByText('first-request');
  const old = boardResponse(20);
  await act(() => {
    resolveOld(old);
    return Promise.resolve();
  });
  await waitFor(() => expect(screen.queryByText('older-request')).toBeNull());
  expect(screen.getByText('first-request')).toBeTruthy();
});

it('does not move focus away from a control the user chose during approval', async () => {
  const board = boardResponse();
  let finish!: (value: unknown) => void;
  state.client.request
    .mockResolvedValueOnce(board)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    )
    .mockResolvedValueOnce({
      ...board,
      leaveApprovalQueue: { rows: [], totalCount: 0, pendingCount: 0, actionableCount: 0 },
    });
  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Approve first-request' }));
  const filter = screen.getByRole('button', { name: /Needs my action/ });
  filter.focus();
  await act(() => {
    finish({ approveLeaveRequest: { status: 'APPROVED' } });
    return Promise.resolve();
  });
  await waitFor(() => expect(screen.queryByText('first-request')).toBeNull());
  expect(document.activeElement).toBe(filter);
});

it('publishes the approval queue while the optional holidays request is still pending', async () => {
  state.api.request.mockImplementation((document: unknown, variables?: { offset?: number }) => {
    if (
      document &&
      typeof document === 'object' &&
      'document' in document &&
      String(document.document).includes('HrLeaveApplicationHolidays')
    ) {
      return new Promise(() => undefined);
    }
    return state.client.request(document, variables) as Promise<unknown>;
  });

  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );

  expect(await screen.findByText('first-request')).toBeTruthy();
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Apply for leave' }).disabled).toBe(
    false
  );
});

it('distinguishes a failed initial queue load from an empty queue', async () => {
  state.client.request.mockRejectedValueOnce(new Error('Queue unavailable'));

  render(
    <MemoryRouter>
      <HrLeavesPage />
    </MemoryRouter>
  );

  expect(await screen.findByText('Requests are unavailable. Refresh to try again.')).toBeTruthy();
  expect(screen.queryByText('No Requests In This Tab.')).toBeNull();
});
