// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CancelLeaveRequestDocument, LeaveBoardDocument } from '../../api/graphql/graphql';
import PageInformationProvider from '../../components/common/PageInformationProvider';
import type * as UseFlashToastModule from '../../hooks/useFlashToast';

import { MyCompOffDocument } from './compOffDocuments';
import LeavePage from './LeavePage';

const testState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
  userId: 'user-a',
  flash: { show: vi.fn(), clear: vi.fn(), flash: null },
  clearWorkflowFailure: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: testState.userId },
    tenantId: 'tenant-1',
    clientSession: {
      employeeId: 'manager-1',
      permissions: testState.permissions,
      permissionScopes: {
        'leave:read': 'ALL',
        'leave:submit': 'SELF',
        'leave:approve': 'TEAM',
      },
      resourceScopes: {},
    },
  }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => testState.client }));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-1', timezone: 'Asia/Kolkata' } }),
}));
vi.mock('../../hooks/useFlashToast', async (importOriginal) => ({
  ...(await importOriginal<typeof UseFlashToastModule>()),
  useFlashToast: () => testState.flash,
}));
vi.mock('./hooks/useAllCompanyHolidays', () => ({
  useAllCompanyHolidays: () => ({
    rows: [],
    failure: null,
    isOpen: false,
    loading: false,
    open: vi.fn(),
    close: vi.fn(),
    retry: vi.fn(),
  }),
}));
vi.mock('./hooks/useLeaveWorkflowTrail', () => ({
  useLeaveWorkflowTrail: () => ({
    clearFailure: testState.clearWorkflowFailure,
    failure: null,
    loading: false,
    open: vi.fn(),
    retry: vi.fn(),
    close: vi.fn(),
    rows: [],
    summaryRow: null,
  }),
}));

const board = {
  viewerEmployeeId: 'manager-1',
  leaveRequestCount: 41,
  upcomingHolidays: [],
  leavePolicies: [],
  leaveTypes: [
    {
      id: 'annual-leave',
      name: 'Annual Leave',
      code: 'AL',
      isPaid: true,
      carryForward: true,
      requiresDocument: false,
      halfDayAllowed: true,
      sandwichRule: false,
    },
  ],
  leaveRequests: [
    {
      id: 'leave-1',
      employeeId: 'manager-1',
      employeeName: 'Logged In Employee',
      employeeCode: 'EMP-SELF',
      leaveTypeId: 'annual-leave',
      fromDate: '2026-08-27',
      toDate: '2026-08-27',
      daysRequested: '1',
      status: 'PENDING',
      reason: 'Family appointment',
      rejectionReason: null,
      isHalfDay: false,
      halfDaySession: null,
      appliedAt: '2026-08-26T09:00:00Z',
      workflowInstanceId: 'workflow-1',
      pendingApprovalStage: 'Reporting Manager',
      pendingApprovalStepId: 'workflow-step-1',
      viewerMayApprove: true,
      supportingDocumentReference: null,
    },
  ],
  leaveBalances: [],
};

beforeEach(() => {
  testState.userId = 'user-a';
  testState.permissions = new Set(['leave:read', 'leave:submit', 'leave:approve']);
  testState.client = {
    request: vi.fn((document: unknown) => {
      if (document === LeaveBoardDocument) return Promise.resolve(board);
      if (document === MyCompOffDocument)
        return Promise.resolve({
          compOffPolicy: null,
          compOffClaims: [],
          compOffBalance: {
            earnedUnits: '0',
            reservedUnits: '0',
            usedUnits: '0',
            expiredUnits: '0',
            availableUnits: '0',
          },
        });
      if (document === CancelLeaveRequestDocument) {
        return Promise.resolve({ cancelLeaveRequest: { status: 'CANCELLED' } });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    }),
  };
  testState.flash.show.mockReset();
  testState.flash.clear.mockReset();
  testState.clearWorkflowFailure.mockReset();
});

afterEach(cleanup);

describe('LeavePage personal requests', () => {
  it('never shows other employees or review actions even if a response includes them', async () => {
    const normal = testState.client.request.getMockImplementation() as
      ((document: unknown) => Promise<unknown>) | undefined;
    if (!normal) throw new Error('Missing baseline GraphQL fixture.');
    testState.client.request.mockImplementation((document: unknown) => {
      if (document === LeaveBoardDocument)
        return Promise.resolve({
          ...board,
          leaveRequests: [
            ...board.leaveRequests,
            {
              ...board.leaveRequests[0],
              id: 'foreign-leave',
              employeeId: 'other-employee',
              reason: 'Private reason',
            },
          ],
        });
      return normal(document);
    });
    render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );
    await screen.findByRole('table', { name: 'Leave requests' });
    expect(screen.queryByText('Private reason')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
  });

  it('keeps requests on the page and opens holiday and leave-type references from one control', async () => {
    render(
      <MemoryRouter>
        <PageInformationProvider scopeKey="leave">
          <LeavePage />
        </PageInformationProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('My Leave Requests')).toBeTruthy();
    expect(screen.queryByText('Upcoming public holidays')).toBeNull();
    expect(screen.queryByText('Carry Forward')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Page information' }));
    const information = screen.getByRole('dialog', { name: 'Page information' });
    expect(within(information).getByText('Upcoming public holidays')).toBeTruthy();
    expect(within(information).getByText('Carry Forward')).toBeTruthy();
    expect(within(information).getByRole('button', { name: 'View all' })).toBeTruthy();
  });

  it('pages through all leave requests instead of truncating the board at twenty rows', async () => {
    render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Showing 1-20 of 41 leave requests')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next leave requests' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(LeaveBoardDocument, {
        limit: 20,
        requestOffset: 20,
        balanceYear: new Date().getFullYear(),
        fromDate: `${new Date().getFullYear()}-01-01`,
        toDate: `${new Date().getFullYear()}-12-31`,
      })
    );
  });

  it('does not render or request the board without leave:read', async () => {
    testState.permissions = new Set();
    const view = render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.client.request).not.toHaveBeenCalled();
  });

  it('loads read-only leave data without submit or approval controls', async () => {
    testState.permissions = new Set(['leave:read']);
    render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );

    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    expect(desktop.queryByRole('columnheader', { name: 'Employee' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Apply for leave' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  it('allows cancelling an own pending request without approval or rejection controls', async () => {
    render(
      <MemoryRouter initialEntries={['/leave']}>
        <LeavePage />
      </MemoryRouter>
    );

    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    fireEvent.click(desktop.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(CancelLeaveRequestDocument, {
        leaveRequestId: 'leave-1',
      })
    );
    expect(testState.client.request).toHaveBeenCalledWith(LeaveBoardDocument, {
      limit: 20,
      requestOffset: 0,
      balanceYear: new Date().getFullYear(),
      fromDate: `${new Date().getFullYear()}-01-01`,
      toDate: `${new Date().getFullYear()}-12-31`,
    });
  });
});

describe('LeavePage ownership', () => {
  it('ignores an old identity response after A to B to A navigation', async () => {
    const pending: ((value: typeof board) => void)[] = [];
    const normal = testState.client.request.getMockImplementation() as
      ((document: unknown) => Promise<unknown>) | undefined;
    if (!normal) throw new Error('Missing baseline GraphQL fixture.');
    testState.client.request.mockImplementation((document: unknown) => {
      if (document === LeaveBoardDocument)
        return new Promise<typeof board>((resolve) => pending.push(resolve));
      return normal(document);
    });
    const page = () => (
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );
    const view = render(page());
    await waitFor(() => expect(pending).toHaveLength(1));
    testState.userId = 'user-b';
    view.rerender(page());
    await waitFor(() => expect(pending).toHaveLength(2));
    testState.userId = 'user-a';
    view.rerender(page());
    await waitFor(() => expect(pending).toHaveLength(3));
    await act(async () => {
      pending[2]({ ...board, leaveRequestCount: 7 });
      await Promise.resolve();
    });
    expect(await screen.findByText('Showing 1-7 of 7 leave requests')).toBeTruthy();
    await act(async () => {
      pending[0]({ ...board, leaveRequestCount: 99 });
      await Promise.resolve();
    });
    expect(screen.queryByText(/of 99 leave requests/)).toBeNull();
  });

  it('does not toast or refresh a new owner when an old cancellation completes', async () => {
    let resolveCancellation!: (value: unknown) => void;
    const normal = testState.client.request.getMockImplementation() as
      ((document: unknown) => Promise<unknown>) | undefined;
    if (!normal) throw new Error('Missing baseline GraphQL fixture.');
    testState.client.request.mockImplementation((document: unknown) =>
      document === CancelLeaveRequestDocument
        ? new Promise((resolve) => {
            resolveCancellation = resolve;
          })
        : normal(document)
    );
    const page = () => (
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );
    const view = render(page());
    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    fireEvent.click(desktop.getByRole('button', { name: 'Cancel' }));
    testState.userId = 'user-b';
    view.rerender(page());
    await screen.findByRole('table', { name: 'Leave requests' });
    const count = testState.client.request.mock.calls.filter(
      ([document]) => document === LeaveBoardDocument
    ).length;
    await act(async () => {
      resolveCancellation({ cancelLeaveRequest: { status: 'CANCELLED' } });
      await Promise.resolve();
    });
    expect(testState.flash.show).not.toHaveBeenCalled();
    expect(
      testState.client.request.mock.calls.filter(([document]) => document === LeaveBoardDocument)
    ).toHaveLength(count);
  });
});

describe('LeavePage dialog and query boundaries', () => {
  it('reloads personal requests when the query year changes without a rejection dialog', async () => {
    render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );
    await screen.findByRole('table', { name: 'Leave requests' });
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), {
      target: { value: String(new Date().getFullYear() - 1) },
    });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Reject Leave Request' })).toBeNull()
    );
    expect(testState.client.request).toHaveBeenCalledWith(
      LeaveBoardDocument,
      expect.objectContaining({ balanceYear: new Date().getFullYear() - 1, requestOffset: 0 })
    );
  });
  it('opens the direct apply link with restored year and page', async () => {
    const year = new Date().getFullYear() - 1;
    render(
      <MemoryRouter initialEntries={[`/leave?year=${year}&page=1&apply=1`]}>
        <LeavePage />
      </MemoryRouter>
    );
    expect(await screen.findByRole('dialog', { name: 'Apply For Leave' })).toBeTruthy();
    expect(testState.client.request).toHaveBeenCalledWith(
      LeaveBoardDocument,
      expect.objectContaining({ balanceYear: year, requestOffset: 20 })
    );
  });
  it('does not open a direct apply link for read-only access', async () => {
    testState.permissions = new Set(['leave:read']);
    render(
      <MemoryRouter initialEntries={['/leave?apply=1']}>
        <LeavePage />
      </MemoryRouter>
    );
    await screen.findByRole('table', { name: 'Leave requests' });
    expect(screen.queryByRole('dialog', { name: 'Apply For Leave' })).toBeNull();
  });
});
