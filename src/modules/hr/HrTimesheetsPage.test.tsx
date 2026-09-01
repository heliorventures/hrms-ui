// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApproveTimesheetWeekBatchDocument,
  RejectTimesheetWeekBatchDocument,
  ViewerEmployeeIdDocument,
} from '../../api/graphql/graphql';
import { TIMESHEET_APPROVAL_REFRESH_MESSAGE } from '../timesheet/timesheetApproval';

import HrTimesheetsPage from './HrTimesheetsPage';

const testState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  pendingApprovalStepId: 'timesheet-step-1' as string | null,
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => testState.client }));
vi.mock('./components/TimesheetBatchPreviewModal', () => ({ default: () => null }));

beforeEach(() => {
  testState.pendingApprovalStepId = 'timesheet-step-1';
  testState.client = {
    request: vi.fn((document: unknown) => {
      if (document === ViewerEmployeeIdDocument) {
        return Promise.resolve({ viewerEmployeeId: 'manager-1' });
      }
      if (typeof document === 'string' && document.includes('HrTimesheetWeekBatches')) {
        return Promise.resolve({
          timesheetWeekBatches: [
            {
              id: 'batch-1',
              employeeId: 'employee-1',
              employeeCode: 'EMP-001',
              employeeName: 'Asha Rao',
              weekStartDate: '2026-08-24',
              status: 'PENDING',
              pendingApprovalStage: 'Reporting Manager',
              pendingApprovalStepId: testState.pendingApprovalStepId,
              viewerMayApprove: true,
            },
          ],
        });
      }
      if (document === ApproveTimesheetWeekBatchDocument) {
        return Promise.resolve({ approveTimesheetWeekBatch: { status: 'APPROVED' } });
      }
      if (document === RejectTimesheetWeekBatchDocument) {
        return Promise.resolve({ rejectTimesheetWeekBatch: true });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    }),
  };
});

afterEach(cleanup);

describe('HrTimesheetsPage approval concurrency', () => {
  it('passes the server-provided workflow step when approving', async () => {
    render(<HrTimesheetsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(ApproveTimesheetWeekBatchDocument, {
        id: 'batch-1',
        expectedWorkflowStepId: 'timesheet-step-1',
      })
    );
  });

  it('passes the server-provided workflow step when rejecting', async () => {
    render(<HrTimesheetsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reject' }));

    await waitFor(() =>
      expect(testState.client.request).toHaveBeenCalledWith(RejectTimesheetWeekBatchDocument, {
        id: 'batch-1',
        expectedWorkflowStepId: 'timesheet-step-1',
        rejectionReason: null,
      })
    );
  });

  it('suppresses stale actions and asks the approver to refresh when the step is absent', async () => {
    testState.pendingApprovalStepId = null;
    render(<HrTimesheetsPage />);

    expect(await screen.findByText(TIMESHEET_APPROVAL_REFRESH_MESSAGE)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    expect(testState.client.request).not.toHaveBeenCalledWith(
      ApproveTimesheetWeekBatchDocument,
      expect.anything()
    );
    expect(testState.client.request).not.toHaveBeenCalledWith(
      RejectTimesheetWeekBatchDocument,
      expect.anything()
    );
  });
});
