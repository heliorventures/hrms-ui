// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationCommandJournal from './OrganizationCommandJournal';
import type { TrackedOrganizationCommand } from './organizationCommandTransport';

afterEach(cleanup);

it('offers source checks and confirmed cancellation recovery without permitting payloadless retry', () => {
  const retry = vi.fn();
  const check = vi.fn().mockResolvedValue(undefined);
  const cancel = vi.fn().mockResolvedValue(undefined);
  render(
    <OrganizationCommandJournal
      commands={[
        {
          organizationId: 'org-a',
          companyName: 'Company A',
          canRetry: false,
          busy: false,
          error: null,
          outcome: null,
          intent: {
            commandId: 'recovered',
            resourceId: 'leave-a',
            membershipId: 'member-a',
            expectedVersion: 3,
            operation: 'leave_decision',
          },
        },
      ]}
      retry={retry}
      check={check}
      cancel={cancel}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Retry original command' }));
  expect(retry).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Check source status' }));
  expect(check).toHaveBeenCalledWith('recovered');
  expect(screen.getByText(/Recovered after reload/)).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel if not executed' }));
  expect(cancel).not.toHaveBeenCalled();
  expect(screen.getByText(/This does not undo a committed change/)).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel if not executed' }));
  expect(cancel).toHaveBeenCalledWith('recovered');
});

it('labels pending source work and retries its reference without rendering its private payload', () => {
  const entry: TrackedOrganizationCommand = {
    organizationId: 'org-a',
    companyName: 'Company A',
    canRetry: true,
    busy: false,
    error: null,
    intent: {
      commandId: 'stable-command',
      membershipId: 'membership-a',
      resourceId: 'review-a',
      expectedVersion: 4,
      operation: 'review_submit',
      payload: { comments: 'Private review contents' },
    },
    outcome: {
      commandId: 'stable-command',
      resourceId: 'review-a',
      status: 'SUBMITTED',
      resourceVersion: 4,
      result: {},
    },
  };
  const retry = vi.fn().mockResolvedValue(undefined);
  render(
    <OrganizationCommandJournal
      commands={[entry]}
      retry={retry}
      check={vi.fn().mockResolvedValue(undefined)}
      cancel={vi.fn()}
    />
  );
  expect(screen.getByText('Source company: Company A')).toBeDefined();
  expect(screen.getByText('Submitted; awaiting source confirmation')).toBeDefined();
  expect(screen.queryByText('Private review contents')).toBeNull();
  expect(screen.queryByText(/approved/i)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry original command' }));
  expect(retry).toHaveBeenCalledWith('stable-command');
});
