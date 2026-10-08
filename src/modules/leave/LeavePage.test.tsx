// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApproveLeaveRequestDocument, LeaveBoardDocument } from '../../api/graphql/graphql';
import PageInformationButton from '../../components/common/PageInformationButton';
import PageInformationProvider from '../../components/common/PageInformationProvider';

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
vi.mock('../../hooks/useFlashToast', () => ({ useFlashToast: () => testState.flash }));
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
      employeeId: 'employee-1',
      employeeName: 'Asha Rao',
      employeeCode: 'EMP-001',
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
      if (document === ApproveLeaveRequestDocument) {
        return Promise.resolve({ approveLeaveRequest: { status: 'APPROVED' } });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    }),
  };
  testState.flash.show.mockReset();
  testState.flash.clear.mockReset();
  testState.clearWorkflowFailure.mockReset();
});

afterEach(cleanup);

describe('LeavePage approval', () => {
  it('keeps requests on the page and opens holiday and leave-type references from one control', async () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PageInformationProvider scopeKey="leave">
          <PageInformationButton />
          <LeavePage />
        </PageInformationProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Recent Leave Requests')).toBeTruthy();
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
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <LeavePage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Showing 1-20 of 41 leave requests')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next leave requests' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenLastCalledWith(LeaveBoardDocument, {
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
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <LeavePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.client.request).not.toHaveBeenCalled();
  });

  it('loads read-only leave data without submit or approval controls', async () => {
    testState.permissions = new Set(['leave:read']);
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <LeavePage />
      </MemoryRouter>
    );

    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    expect(desktop.getByText('Asha Rao (EMP-001)')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Apply for leave' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  it('loads with LeaveBoardDocument and forwards the row workflow step when approving', async () => {
    render(
      <MemoryRouter
        initialEntries={['/leave']}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <LeavePage />
      </MemoryRouter>
    );

    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    fireEvent.click(desktop.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(ApproveLeaveRequestDocument, {
        leaveRequestId: 'leave-1',
        expectedWorkflowStepId: 'workflow-step-1',
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
      | ((document: unknown) => Promise<unknown>)
      | undefined;
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

  it('does not toast or refresh a new owner when an old approval completes', async () => {
    let resolveApproval!: (value: unknown) => void;
    const normal = testState.client.request.getMockImplementation() as
      | ((document: unknown) => Promise<unknown>)
      | undefined;
    if (!normal) throw new Error('Missing baseline GraphQL fixture.');
    testState.client.request.mockImplementation((document: unknown) =>
      document === ApproveLeaveRequestDocument
        ? new Promise((resolve) => {
            resolveApproval = resolve;
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
    fireEvent.click(desktop.getByRole('button', { name: 'Approve' }));
    testState.userId = 'user-b';
    view.rerender(page());
    await screen.findByRole('table', { name: 'Leave requests' });
    const count = testState.client.request.mock.calls.filter(
      ([document]) => document === LeaveBoardDocument
    ).length;
    await act(async () => {
      resolveApproval({ approveLeaveRequest: { status: 'APPROVED' } });
      await Promise.resolve();
    });
    expect(testState.flash.show).not.toHaveBeenCalled();
    expect(
      testState.client.request.mock.calls.filter(([document]) => document === LeaveBoardDocument)
    ).toHaveLength(count);
  });
});

describe('LeavePage dialog and query boundaries', () => {
  it('closes a rejection target when the query year changes', async () => {
    render(
      <MemoryRouter>
        <LeavePage />
      </MemoryRouter>
    );
    const desktop = within(await screen.findByRole('table', { name: 'Leave requests' }));
    fireEvent.click(desktop.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('dialog', { name: 'Reject Leave Request' })).toBeTruthy();
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
