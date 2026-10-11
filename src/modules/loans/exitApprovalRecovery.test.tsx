// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApproveSeparationWithFinanceDocument,
  CancelExitFinanceApprovalDocument,
} from '../../api/loans/graphql';

import ExitApprovalRecovery from './ExitApprovalRecovery';

const client = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
afterEach(() => {
  cleanup();
  client.request.mockReset();
});
const operation = {
  id: 'operation',
  reviewId: 'original-review',
  state: 'REGISTERED',
  canResume: true,
};

describe('Reopened exit approval recovery', () => {
  it('resumes the original financial review without saving a new decision', async () => {
    client.request.mockResolvedValueOnce({});
    const saved = vi.fn(async () => {});
    render(
      <ExitApprovalRecovery
        separationId="separation"
        operation={operation}
        onSaved={saved}
        reload={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Resume saved approval'));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(client.request).toHaveBeenCalledOnce();
    expect(client.request).toHaveBeenCalledWith(ApproveSeparationWithFinanceDocument, {
      separationId: 'separation',
      financeReviewId: 'original-review',
    });
  });
  it('requires an explicit cancellation acknowledgement and reloads authoritative status', async () => {
    client.request.mockResolvedValueOnce({ cancelExitApproval: true });
    const reload = vi.fn(async () => {});
    render(
      <ExitApprovalRecovery
        separationId="separation"
        operation={{ ...operation, canResume: false }}
        onSaved={vi.fn()}
        reload={reload}
      />
    );
    expect(screen.getByText('Resume saved approval').hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Cancel pending approval').hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Cancel pending approval'));
    await waitFor(() => expect(reload).toHaveBeenCalledOnce());
    expect(client.request).toHaveBeenCalledWith(CancelExitFinanceApprovalDocument, {
      operationId: 'operation',
    });
  });
  it('refreshes a committed approval without invoking either mutation', async () => {
    const saved = vi.fn(async () => {});
    render(
      <ExitApprovalRecovery
        separationId="separation"
        operation={{ ...operation, state: 'COMMITTED' }}
        onSaved={saved}
        reload={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Refresh exit records'));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(client.request).not.toHaveBeenCalled();
  });
});
