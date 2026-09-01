// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import LeaveRecoveryNotice from './LeaveRecoveryNotice';

afterEach(cleanup);

describe('LeaveRecoveryNotice', () => {
  it('keeps an actionable leave failure visible and refreshes only the board', async () => {
    const user = userEventLibrary.setup();
    let refreshes = 0;
    render(
      <LeaveRecoveryNotice
        message="We could not complete this action right now. Please try again in a moment."
        operation="board"
        onRefreshBoard={() => {
          refreshes += 1;
        }}
      />
    );

    expect(screen.getByRole('alert').textContent).toContain('Leave requests need attention');
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Refresh leave requests' }));
    expect(refreshes).toBe(1);
  });

  it('retries the failed workflow-trail read instead of refreshing the board', async () => {
    const user = userEventLibrary.setup();
    let boardRefreshes = 0;
    let trailRetries = 0;
    render(
      <LeaveRecoveryNotice
        message="We could not load this request history."
        operation="workflowTrail"
        onRefreshBoard={() => {
          boardRefreshes += 1;
        }}
        onRetryWorkflowTrail={() => {
          trailRetries += 1;
        }}
      />
    );

    expect(screen.getByRole('alert').textContent).toContain('Leave request history is unavailable');
    await user.click(screen.getByRole('button', { name: 'Retry request history' }));
    expect(trailRetries).toBe(1);
    expect(boardRefreshes).toBe(0);
  });
});
