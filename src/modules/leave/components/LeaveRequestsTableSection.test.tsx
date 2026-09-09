// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
  pendingApprovalStepId: 'workflow-step-1',
} satisfies LeaveRequestRow & {
  viewerMayApprove: boolean;
  pendingApprovalStage: string;
  pendingApprovalStepId: string;
};

describe('LeaveRequestsTableSection', () => {
  it('keeps authorized decisions and request evidence together in mobile rows', () => {
    const approve = vi.fn();
    render(
      <LeaveRequestsTableSection
        rows={[{ ...request, viewerMayApprove: true }]}
        leaveTypeNameById={new Map([['leave-type-1', 'Annual Leave']])}
        employeeLabel={() => 'Asha Rao'}
        showApprovalColumn
        approveBusyId={null}
        cancelBusyId={null}
        onApprove={approve}
        onRejectClick={vi.fn()}
        onCancelOwn={vi.fn()}
        onOpenTrail={vi.fn()}
      />
    );
    const mobile = within(screen.getByRole('list', { name: 'Leave requests mobile view' }));
    expect(mobile.getByText('Asha Rao')).toBeTruthy();
    expect(mobile.getByText('Family appointment')).toBeTruthy();
    expect(mobile.getByText('Awaiting Reporting Manager')).toBeTruthy();
    expect(mobile.getByText(/Applied:/)).toBeTruthy();
    const headers = within(screen.getByRole('table'))
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(headers.indexOf('Actions')).toBeLessThan(headers.indexOf('Details'));
    fireEvent.click(mobile.getByRole('button', { name: 'Approve' }));
    expect(approve).toHaveBeenCalledWith('leave-1', 'workflow-step-1');
  });
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
    const onApprove = vi.fn();
    const onRejectClick = vi.fn();
    render(
      <LeaveRequestsTableSection
        rows={[{ ...request, viewerMayApprove: true }]}
        leaveTypeNameById={new Map([['leave-type-1', 'Annual Leave']])}
        showApprovalColumn
        viewerId="manager-1"
        approveBusyId={null}
        cancelBusyId={null}
        onApprove={onApprove}
        onRejectClick={onRejectClick}
        onCancelOwn={vi.fn()}
        onOpenTrail={vi.fn()}
      />
    );

    const desktop = within(screen.getByRole('table'));
    expect(desktop.getByText('Awaiting Reporting Manager')).toBeTruthy();
    fireEvent.click(desktop.getByRole('button', { name: 'Approve' }));
    fireEvent.click(desktop.getByRole('button', { name: 'Reject' }));

    expect(onApprove).toHaveBeenCalledWith('leave-1', 'workflow-step-1');
    expect(onRejectClick).toHaveBeenCalledWith('leave-1', 'workflow-step-1');
  });

  it('suppresses stale actions and tells the approver to refresh when the step is absent', () => {
    render(
      <LeaveRequestsTableSection
        rows={[{ ...request, viewerMayApprove: true, pendingApprovalStepId: null }]}
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
    expect(
      within(screen.getByRole('table')).getByText(
        'This leave request moved to another approval step. Refresh leave requests before trying again.'
      )
    ).toBeTruthy();
  });
});
