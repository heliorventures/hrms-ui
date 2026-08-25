// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LeaveRequestsTableSection, { type LeaveRequestRow } from './LeaveRequestsTableSection';

afterEach(cleanup);

const request = {
  id: 'leave-1',
  employeeId: 'employee-2',
  leaveTypeId: 'leave-type-1',
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
  supportingDocumentReference: null,
  viewerMayApprove: false,
  pendingApprovalStage: 'Reporting Manager',
} satisfies LeaveRequestRow & {
  viewerMayApprove: boolean;
  pendingApprovalStage: string;
};

describe('LeaveRequestsTableSection', () => {
  it('does not expose approval actions when the server says the viewer cannot act', () => {
    render(
      <LeaveRequestsTableSection
        rows={[request]}
        leaveTypeNameById={new Map([['leave-type-1', 'Annual Leave']])}
        showApprovalColumn
        viewerId="manager-1"
        approveBusyId={null}
        cancelBusyId={null}
        onApprove={vi.fn()}
        onRejectClick={vi.fn()}
        onCancelOwn={vi.fn()}
        onOpenTrail={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
  });

  it('shows the current workflow stage and actions only when the server authorizes them', () => {
    render(
      <LeaveRequestsTableSection
        rows={[{ ...request, viewerMayApprove: true }]}
        leaveTypeNameById={new Map([['leave-type-1', 'Annual Leave']])}
        showApprovalColumn
        viewerId="manager-1"
        approveBusyId={null}
        cancelBusyId={null}
        onApprove={vi.fn()}
        onRejectClick={vi.fn()}
        onCancelOwn={vi.fn()}
        onOpenTrail={vi.fn()}
      />
    );

    expect(screen.getByText('Awaiting Reporting Manager')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeTruthy();
  });
});
