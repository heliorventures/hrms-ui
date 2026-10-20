// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { createCommandIntent } from './organizationCommand';
import { useOrganizationCommands } from './useOrganizationCommands';

vi.mock('../../hooks/useActionFeedback', () => ({ useActionFeedback: () => vi.fn() }));
afterEach(cleanup);
const reference = {
  commandId: 'old',
  membershipId: 'member',
  resourceId: 'leave',
  expectedVersion: 3,
  operation: 'leave_decision' as const,
};
const transport = () => ({
  execute: vi.fn().mockRejectedValue(new Error('network')),
  status: vi.fn(),
  cancel: vi.fn(),
});

it.each(['recovered', 'live'])(
  'discards an omitted %s intent only after authoritative recovery completes',
  async (kind) => {
    const view = renderHook(() => useOrganizationCommands('actor', transport()));
    if (kind === 'recovered')
      act(() => view.result.current.restorePending('org', 'Company', [reference]));
    else
      await act(async () =>
        view.result.current.submit('org', 'Company', {
          ...reference,
          payload: { private: 'feedback' },
        })
      );
    const reconcile = view.result.current.beginPendingRecovery('org');
    expect(view.result.current.commands).toHaveLength(1);
    let changed = false;
    act(() => {
      changed = reconcile([]);
    });
    expect(changed).toBe(true);
    expect(view.result.current.commands).toHaveLength(0);
    expect(reconcile([])).toBe(false);
  }
);

it('keeps returned pending references and commands created after the query starts', async () => {
  const view = renderHook(() => useOrganizationCommands('actor', transport()));
  act(() => view.result.current.restorePending('org', 'Company', [reference]));
  const reconcile = view.result.current.beginPendingRecovery('org');
  const intent = createCommandIntent('member', 'leave_decision', 'new-leave', 3, {
    decision: 'approve',
  });
  await act(async () => view.result.current.submit('org', 'Company', intent));
  act(() => {
    expect(reconcile(['old'])).toBe(false);
  });
  expect(view.result.current.commands.map((entry) => entry.intent.commandId)).toEqual([
    'old',
    intent.commandId,
  ]);
});

it('preserves commands that become in-flight after recovery begins, even if the request finishes first', async () => {
  const adapter = transport();
  const view = renderHook(() => useOrganizationCommands('actor', adapter));
  await act(async () =>
    view.result.current.submit('org', 'Company', { ...reference, payload: {} })
  );
  const reconcile = view.result.current.beginPendingRecovery('org');
  await act(async () => view.result.current.retry(reference.commandId));
  act(() => {
    expect(reconcile([])).toBe(false);
  });
  expect(view.result.current.commands).toHaveLength(1);
});

it('ignores recovery after identity change and preserves commands already in flight at query start', () => {
  const adapter = transport();
  adapter.execute.mockImplementation(() => new Promise(() => undefined));
  const view = renderHook(({ owner }) => useOrganizationCommands(owner, adapter), {
    initialProps: { owner: 'actor' },
  });
  act(() => {
    void view.result.current.submit('org', 'Company', { ...reference, payload: {} });
  });
  const reconcile = view.result.current.beginPendingRecovery('org');
  act(() => {
    expect(reconcile([])).toBe(false);
  });
  expect(view.result.current.commands).toHaveLength(1);
  view.rerender({ owner: 'other-actor' });
  expect(reconcile([])).toBe(false);
  expect(view.result.current.commands).toHaveLength(0);
});
