// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApproveLeaveRequestDocument, LeaveBoardDocument } from '../../api/graphql/graphql';

import LeavePage from './LeavePage';

const testState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
  flash: { show: vi.fn(), clear: vi.fn(), flash: null },
  clearWorkflowFailure: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'manager-1',
      permissions: testState.permissions,
      permissionScopes: {},
      resourceScopes: {},
    },
  }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => testState.client }));
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
  testState.permissions = new Set(['leave:read', 'leave:submit', 'leave:approve']);
  testState.client = {
    request: vi.fn((document: unknown) => {
      if (document === LeaveBoardDocument) return Promise.resolve(board);
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

    expect(await screen.findByText('Asha Rao (EMP-001)')).toBeTruthy();
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

    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(ApproveLeaveRequestDocument, {
        leaveRequestId: 'leave-1',
        expectedWorkflowStepId: 'workflow-step-1',
      })
    );
    expect(testState.client.request.mock.calls[0]).toEqual([
      LeaveBoardDocument,
      {
        limit: 20,
        balanceYear: new Date().getFullYear(),
        fromDate: `${new Date().getFullYear()}-01-01`,
        toDate: `${new Date().getFullYear()}-12-31`,
      },
    ]);
  });
});
