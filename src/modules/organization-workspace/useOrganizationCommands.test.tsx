// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { createCommandIntent } from './organizationCommand';
import { useOrganizationCommands } from './useOrganizationCommands';

const feedback = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useActionFeedback', () => ({ useActionFeedback: () => feedback }));
afterEach(() => {
  cleanup();
  feedback.mockClear();
});

it.each(['account_create', 'employee_login_provision'] as const)(
  'keeps %s initial passwords out of the command journal even while delivery is uncertain',
  async (operation) => {
    const execute = vi.fn().mockRejectedValue(new Error('failed to fetch'));
    const view = renderHook(() =>
      useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
    );
    const intent = createCommandIntent('membership-a', operation, 'new-user', 1, {
      username: 'new',
      initial_password: 'private-initial-password',
      role_ids: [],
    });
    await act(async () => {
      await view.result.current.submit('org-a', 'Company A', intent);
    });
    expect(execute).toHaveBeenCalledWith('org-a', intent);
    expect(JSON.stringify(view.result.current.commands)).not.toContain('private-initial-password');
    expect(view.result.current.commands[0].intent).not.toHaveProperty('payload');
    expect(view.result.current.commands[0].canRetry).toBe(false);
    await act(async () => {
      await view.result.current.retry(intent.commandId);
    });
    expect(execute).toHaveBeenCalledOnce();
  }
);

it('treats accepted payroll as a processing job without business success feedback', async () => {
  const intent = createCommandIntent('membership-a', 'payroll_draft', 'cycle-a', 1, {});
  const execute = vi.fn().mockResolvedValue({
    commandId: intent.commandId,
    resourceId: intent.resourceId,
    resourceVersion: 1,
    status: 'ACCEPTED',
    result: { job_id: intent.commandId, state: 'QUEUED', accepted: true },
  });
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  expect(feedback).not.toHaveBeenCalled();
  expect(view.result.current.commands[0].canRetry).toBe(false);
});

it('recovers status-only commands without payloads or retry and blocks a replacement decision', async () => {
  const execute = vi.fn();
  const status = vi.fn().mockResolvedValue({
    commandId: 'recovered',
    resourceId: 'leave-a',
    status: 'COMMITTED',
    resourceVersion: 8,
    result: {},
  });
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status, cancel: vi.fn() })
  );
  const reference = {
    commandId: 'recovered',
    membershipId: 'membership-a',
    resourceId: 'leave-a',
    expectedVersion: 7,
    operation: 'leave_decision' as const,
  };
  act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
  expect(view.result.current.commands[0].canRetry).toBe(false);
  expect(view.result.current.commands[0].intent).not.toHaveProperty('payload');
  await act(async () => {
    await view.result.current.retry('recovered');
    await view.result.current.submit(
      'org-a',
      'Company A',
      createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, { decision: 'reject' })
    );
  });
  expect(execute).not.toHaveBeenCalled();
  await act(async () => {
    await view.result.current.check('recovered');
  });
  expect(status).toHaveBeenCalledWith('recovered');
  expect(view.result.current.commands[0].outcome?.status).toBe('COMMITTED');
});

it('preserves original live command payload when recovering the same pending reference', async () => {
  const execute = vi.fn().mockRejectedValue(new Error('failed to fetch'));
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  const intent = createCommandIntent('membership-a', 'review_submit', 'review-a', 7, {
    answers: ['private'],
  });
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  act(() => view.result.current.restorePending('org-a', 'Company A', [intent]));
  expect(view.result.current.commands[0].canRetry).toBe(true);
  await act(async () => {
    await view.result.current.retry(intent.commandId);
  });
  expect(execute.mock.calls[1]).toEqual(execute.mock.calls[0]);
});

it('keeps uncertain commands pending and retries the same source intent without success feedback', async () => {
  const execute = vi.fn().mockRejectedValueOnce(new Error('failed to fetch')).mockResolvedValue({
    commandId: 'unused',
    resourceId: 'leave-a',
    status: 'SUBMITTED',
    resourceVersion: 7,
    result: {},
  });
  const status = vi.fn();
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status, cancel: vi.fn() })
  );
  const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {
    decision: 'approve',
  });
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  expect(view.result.current.commands[0].outcome?.status).toBe('AWAITING_CONFIRMATION');
  expect(feedback).not.toHaveBeenCalled();
  await act(async () => {
    await view.result.current.retry(intent.commandId);
  });
  expect(execute.mock.calls[0]).toEqual(execute.mock.calls[1]);
  expect(feedback).not.toHaveBeenCalled();
});

it('ignores an earlier identity response and emits success only after matching source receipt', async () => {
  let finish: ((value: object) => void) | undefined;
  const execute = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const view = renderHook(
    ({ owner }) => useOrganizationCommands(owner, { execute, status: vi.fn(), cancel: vi.fn() }),
    {
      initialProps: { owner: 'session-a' },
    }
  );
  const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {});
  act(() => {
    void view.result.current.submit('org-a', 'Company A', intent);
  });
  await waitFor(() => expect(execute).toHaveBeenCalledOnce());
  view.rerender({ owner: 'session-b' });
  expect(view.result.current.commands).toEqual([]);
  await act(async () => {
    finish?.({
      commandId: intent.commandId,
      resourceId: intent.resourceId,
      status: 'COMMITTED',
      resourceVersion: 8,
      result: {},
    });
    await Promise.resolve();
  });
  expect(feedback).not.toHaveBeenCalled();
  expect(view.result.current.commands).toEqual([]);
});

it('refuses a receipt that does not match command and resource identity', async () => {
  const execute = vi.fn().mockResolvedValue({
    commandId: 'other-command',
    resourceId: 'other-resource',
    status: 'COMMITTED',
    resourceVersion: 8,
    result: {},
  });
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {});
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  expect(feedback).not.toHaveBeenCalled();
  expect(view.result.current.commands[0].outcome?.status).toBe('AWAITING_CONFIRMATION');
});

it('removes command payloads and ignores an in-flight result after company capability revocation', async () => {
  let finish: ((value: object) => void) | undefined;
  const execute = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {
    decision: 'approve',
  });
  act(() => {
    void view.result.current.submit('org-a', 'Company A', intent);
  });
  await waitFor(() => expect(execute).toHaveBeenCalledOnce());
  act(() =>
    view.result.current.retainCompanies('org-a', [
      {
        membershipId: 'membership-a',
        status: 'ACTIVE',
        version: 1,
        runtimeStatus: 'ACTIVE',
        installedVersion: 1,
        capabilities: [],
      },
    ])
  );
  expect(view.result.current.commands).toEqual([]);
  await act(async () => {
    finish?.({
      commandId: intent.commandId,
      resourceId: intent.resourceId,
      status: 'COMMITTED',
      resourceVersion: 8,
      result: {},
    });
    await Promise.resolve();
  });
  expect(view.result.current.commands).toEqual([]);
  expect(feedback).not.toHaveBeenCalled();
});

it('does not confirm a receipt with an invalid source resource version', async () => {
  const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {});
  const execute = vi.fn().mockResolvedValue({
    commandId: intent.commandId,
    resourceId: intent.resourceId,
    status: 'COMMITTED',
    resourceVersion: 0,
    result: {},
  });
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  expect(feedback).not.toHaveBeenCalled();
  expect(view.result.current.commands[0].outcome?.status).toBe('AWAITING_CONFIRMATION');
});

it('discards earlier membership-epoch commands when a company resumes at a new configuration version', async () => {
  const execute = vi.fn().mockRejectedValue(new Error('failed to fetch'));
  const view = renderHook(() =>
    useOrganizationCommands('session-a', { execute, status: vi.fn(), cancel: vi.fn() })
  );
  const authority = {
    membershipId: 'membership-a',
    status: 'ACTIVE',
    version: 1,
    runtimeStatus: 'ACTIVE',
    installedVersion: 1,
    capabilities: ['organization:delegate'],
  };
  act(() => view.result.current.retainCompanies('org-a', [authority]));
  const intent = createCommandIntent('membership-a', 'install_grant', 'binding-a', 3, {});
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', intent);
  });
  expect(view.result.current.commands).toHaveLength(1);
  act(() =>
    view.result.current.retainCompanies('org-a', [
      { ...authority, version: 2, installedVersion: 2 },
    ])
  );
  expect(view.result.current.commands).toEqual([]);
  await act(async () => {
    await view.result.current.submit('org-a', 'Company A', {
      ...intent,
      commandId: 'current-epoch',
    });
  });
  expect(execute).toHaveBeenCalledTimes(2);
});
