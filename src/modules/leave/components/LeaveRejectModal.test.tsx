// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RejectLeaveRequestDocument } from '../../../api/graphql/graphql';

import LeaveRejectModal from './LeaveRejectModal';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

beforeEach(() => {
  graphState.client = { request: vi.fn().mockResolvedValue({}) };
});

afterEach(cleanup);

describe('LeaveRejectModal', () => {
  it('sends the server-provided expected workflow step with the rejection', async () => {
    render(
      <LeaveRejectModal
        isOpen
        leaveRequestId="leave-1"
        expectedWorkflowStepId="workflow-step-1"
        onClose={vi.fn()}
        onRejected={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Reason For Rejection'), {
      target: { value: 'Insufficient leave balance' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reject request' }));

    await waitFor(() =>
      expect(graphState.client.request).toHaveBeenCalledWith(RejectLeaveRequestDocument, {
        leaveRequestId: 'leave-1',
        expectedWorkflowStepId: 'workflow-step-1',
        reason: 'Insufficient leave balance',
      })
    );
  });

  it('refuses rejection and asks for a refresh when the expected step is absent', async () => {
    render(
      <LeaveRejectModal
        isOpen
        leaveRequestId="leave-1"
        expectedWorkflowStepId={null}
        onClose={vi.fn()}
        onRejected={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Reason For Rejection'), {
      target: { value: 'Insufficient leave balance' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reject request' }));

    expect(
      await screen.findByText(
        'This leave request moved to another approval step. Refresh leave requests before trying again.'
      )
    ).toBeTruthy();
    expect(graphState.client.request).not.toHaveBeenCalled();
  });
});
