// @vitest-environment jsdom
import { act, cleanup, fireEvent, renderHook, screen } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { DialogProvider } from '../../../contexts/DialogContext';
import { calculateMutation, finalizeMutation, draftQuery } from '../taxProjectionTypes';

import { usePayrollDraftActions } from './usePayrollDraftActions';

const wrapper = ({ children }: PropsWithChildren) => <DialogProvider>{children}</DialogProvider>;
const draft = {
  cycle_id: 'cycle',
  revision: 3,
  fingerprint: 'reviewed-hash',
  can_finalize: true,
  employees: [],
};
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('calculates without finalization and confirms the exact reviewed revision', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce({ payrollDraft: { ...draft, revision: 2 } })
    .mockResolvedValueOnce({ calculatePayrollCycle: draft })
    .mockResolvedValueOnce({ finalizePayrollCycle: { status: 'PROCESSED' } });
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const reload = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(
    () => usePayrollDraftActions(client, true, 'tenant-admin', reload),
    { wrapper }
  );
  await act(async () => result.current.runPayroll('cycle'));
  expect(request).toHaveBeenNthCalledWith(1, draftQuery, { cycleId: 'cycle' });
  expect(request).toHaveBeenNthCalledWith(2, calculateMutation, {
    cycleId: 'cycle',
    expectedRevision: 2,
  });
  expect(result.current.draft?.revision).toBe(3);
  expect(reload).not.toHaveBeenCalled();
  let pending: Promise<void> | undefined;
  act(() => {
    pending = result.current.finalize([]);
  });
  expect(screen.getByRole('dialog', { name: 'Finalize and lock payroll?' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Finalize & Lock' }));
  await act(async () => pending);
  expect(request).toHaveBeenLastCalledWith(finalizeMutation, {
    cycleId: 'cycle',
    draftRevision: 3,
    fingerprint: 'reviewed-hash',
    acknowledgement: { provisional_tax_employees: [] },
  });
  expect(result.current.draft).toBeNull();
  expect(reload).toHaveBeenCalledOnce();
});
it('suppresses calculations without management authority', async () => {
  const request = vi.fn();
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() => usePayrollDraftActions(client, false, 'employee', vi.fn()), {
    wrapper,
  });
  await act(async () => result.current.runPayroll('cycle'));
  expect(request).not.toHaveBeenCalled();
});
it('discards a pending response after the tenant changes', async () => {
  let resolve: ((value: { calculatePayrollCycle: typeof draft }) => void) | undefined;
  const response = new Promise<{ calculatePayrollCycle: typeof draft }>((done) => {
    resolve = done;
  });
  const request = vi
    .fn()
    .mockResolvedValueOnce({ payrollDraft: null })
    .mockReturnValueOnce(response);
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const { result, rerender } = renderHook(
    ({ owner }) => usePayrollDraftActions(client, true, owner, vi.fn()),
    { initialProps: { owner: 'first' }, wrapper }
  );
  let pending: Promise<void> | undefined;
  await act(async () => {
    pending = result.current.runPayroll('cycle');
    await Promise.resolve();
  });
  rerender({ owner: 'second' });
  await act(async () => {
    resolve?.({ calculatePayrollCycle: draft });
    await pending;
  });
  expect(result.current.draft).toBeNull();
});
