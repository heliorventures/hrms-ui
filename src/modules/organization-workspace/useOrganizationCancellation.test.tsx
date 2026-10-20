// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  commandPresentation,
  createCommandIntent,
  type CommandIntent,
  type CommandOutcome,
} from './organizationCommand';
import { useOrganizationCommands } from './useOrganizationCommands';

const feedback = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useActionFeedback', () => ({ useActionFeedback: () => feedback }));
afterEach(() => {
  cleanup();
  feedback.mockClear();
});

const reference = {
  commandId: 'restored-command',
  membershipId: 'member-a',
  resourceId: 'leave-a',
  expectedVersion: 7,
  operation: 'leave_decision' as const,
};
const receipt = (status: string): CommandOutcome => ({
  commandId: reference.commandId,
  resourceId: reference.resourceId,
  resourceVersion: 7,
  status,
  result: {},
});

it('recovers a payloadless command, source-cancels it and permits a fresh decision only after the terminal receipt', async () => {
  const cancel = vi.fn().mockResolvedValue(receipt('CANCELLED_NOT_EXECUTED'));
  const execute = vi
    .fn()
    .mockImplementation((_organizationId: string, intent: CommandIntent) =>
      Promise.resolve({ ...receipt('SUBMITTED'), commandId: intent.commandId })
    );
  const view = renderHook(() =>
    useOrganizationCommands('source-owner', { execute, status: vi.fn(), cancel })
  );
  act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
  await act(async () => {
    await view.result.current.cancel(reference.commandId);
  });
  expect(cancel).toHaveBeenCalledWith(reference.commandId);
  expect(commandPresentation(view.result.current.commands[0].outcome?.status ?? '').pending).toBe(
    false
  );
  expect(view.result.current.commands[0].intent).not.toHaveProperty('payload');
  expect(feedback).not.toHaveBeenCalledWith('updated', 'Source company confirmed the change.');
  await act(async () => {
    await view.result.current.submit(
      'org-a',
      'Company A',
      createCommandIntent('member-a', 'leave_decision', 'leave-a', 7, { decision: 'approve' })
    );
  });
  expect(execute).toHaveBeenCalledOnce();
});

it.each(['AWAITING_CONFIRMATION', 'NETWORK_ERROR'])(
  'keeps uncertain cancellation %s pending and blocks replacement decisions',
  async (status) => {
    const cancel =
      status === 'NETWORK_ERROR'
        ? vi.fn().mockRejectedValue(new Error('failed to fetch'))
        : vi.fn().mockResolvedValue(receipt(status));
    const execute = vi.fn();
    const view = renderHook(() =>
      useOrganizationCommands('source-owner', { execute, status: vi.fn(), cancel })
    );
    act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
    await act(async () => {
      await view.result.current.cancel(reference.commandId);
    });
    expect(commandPresentation(view.result.current.commands[0].outcome?.status ?? '').pending).toBe(
      true
    );
    await act(async () => {
      await view.result.current.submit(
        'org-a',
        'Company A',
        createCommandIntent('member-a', 'leave_decision', 'leave-a', 7, { decision: 'reject' })
      );
    });
    expect(execute).not.toHaveBeenCalled();
    expect(feedback).not.toHaveBeenCalled();
  }
);

it.each(['COMMITTED', 'REJECTED'])(
  'retains the source original terminal outcome %s instead of claiming cancellation',
  async (status) => {
    const view = renderHook(() =>
      useOrganizationCommands('source-owner', {
        execute: vi.fn(),
        status: vi.fn(),
        cancel: vi.fn().mockResolvedValue(receipt(status)),
      })
    );
    act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
    await act(async () => {
      await view.result.current.cancel(reference.commandId);
    });
    expect(view.result.current.commands[0].outcome?.status).toBe(status);
    expect(commandPresentation(status).pending).toBe(false);
  }
);

it('ignores a late original response after source cancellation wins an in-flight race', async () => {
  let finish: ((value: CommandOutcome) => void) | undefined;
  const execute = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const intent = { ...reference, payload: { decision: 'approve', private: 'do not persist' } };
  const view = renderHook(() =>
    useOrganizationCommands('source-owner', {
      execute,
      status: vi.fn(),
      cancel: vi.fn().mockResolvedValue(receipt('CANCELLED_NOT_EXECUTED')),
    })
  );
  act(() => {
    void view.result.current.submit('org-a', 'Company A', intent);
  });
  await waitFor(() => expect(execute).toHaveBeenCalledOnce());
  await act(async () => {
    await view.result.current.cancel(reference.commandId);
  });
  await act(async () => {
    finish?.(receipt('COMMITTED'));
    await Promise.resolve();
  });
  expect(view.result.current.commands[0].outcome?.status).toBe('CANCELLED_NOT_EXECUTED');
  expect(view.result.current.commands[0].intent).not.toHaveProperty('payload');
  expect(feedback).not.toHaveBeenCalledWith('updated', 'Source company confirmed the change.');
});

it.each(['revocation', 'logout'])(
  'discards an in-flight cancellation response after %s',
  async (mode) => {
    let finish: ((value: CommandOutcome) => void) | undefined;
    const cancel = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const view = renderHook(
      ({ owner }) => useOrganizationCommands(owner, { execute: vi.fn(), status: vi.fn(), cancel }),
      { initialProps: { owner: 'source-owner' } }
    );
    act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
    act(() => {
      void view.result.current.cancel(reference.commandId);
    });
    await waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    if (mode === 'logout') view.rerender({ owner: 'another-source-owner' });
    else act(() => view.result.current.retainOrganizations([]));
    await act(async () => {
      finish?.(receipt('CANCELLED_NOT_EXECUTED'));
      await Promise.resolve();
    });
    expect(view.result.current.commands).toEqual([]);
    expect(feedback).not.toHaveBeenCalled();
  }
);

it('refuses cancellation proof whose version predates the original command', async () => {
  const cancel = vi
    .fn()
    .mockResolvedValue({ ...receipt('CANCELLED_NOT_EXECUTED'), resourceVersion: 6 });
  const view = renderHook(() =>
    useOrganizationCommands('source-owner', { execute: vi.fn(), status: vi.fn(), cancel })
  );
  act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
  await act(async () => {
    await view.result.current.cancel(reference.commandId);
  });
  expect(view.result.current.commands[0].outcome?.status).toBe('AWAITING_CONFIRMATION');
  expect(feedback).not.toHaveBeenCalled();
});

it('refuses an invalid cancellation receipt and keeps the original command pending', async () => {
  const cancel = vi
    .fn()
    .mockResolvedValue({ ...receipt('CANCELLED_NOT_EXECUTED'), resourceId: 'other-resource' });
  const view = renderHook(() =>
    useOrganizationCommands('source-owner', { execute: vi.fn(), status: vi.fn(), cancel })
  );
  act(() => view.result.current.restorePending('org-a', 'Company A', [reference]));
  await act(async () => {
    await view.result.current.cancel(reference.commandId);
  });
  expect(view.result.current.commands[0].outcome?.status).toBe('AWAITING_CONFIRMATION');
  expect(feedback).not.toHaveBeenCalled();
});
