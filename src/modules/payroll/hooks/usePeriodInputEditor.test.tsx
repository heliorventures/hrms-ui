// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { newPeriodInput } from '../newPeriodInput';

import { usePeriodInputEditor } from './usePeriodInputEditor';

afterEach(cleanup);
it('does not save monthly inputs in a locked cycle', async () => {
  const client = new GraphQLClient('https://example.invalid');
  const request = vi.fn().mockResolvedValue({
    payrollPeriodInput: { input: newPeriodInput(2026, 9), revision: 1, ready: true },
    payrollPeriodLocked: true,
  });
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() => usePeriodInputEditor(client, 'employee', 2026, 9));
  await waitFor(() => expect(result.current.locked).toBe(true));
  await act(async () => result.current.save());
  expect(request).toHaveBeenCalledOnce();
});
it('ignores an old employee load after changing employee', async () => {
  const client = new GraphQLClient('https://example.invalid');
  let complete: ((value: unknown) => void) | undefined;
  const request = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        })
    )
    .mockResolvedValue({ payrollPeriodInput: null, payrollPeriodLocked: false });
  Object.defineProperty(client, 'request', { value: request });
  const { result, rerender } = renderHook(({ id }) => usePeriodInputEditor(client, id, 2026, 9), {
    initialProps: { id: 'old' },
  });
  rerender({ id: 'new' });
  await waitFor(() => expect(result.current.busy).toBe(false));
  act(() =>
    complete?.({
      payrollPeriodInput: { input: newPeriodInput(2026, 9), revision: 1 },
      payrollPeriodLocked: true,
    })
  );
  expect(result.current.draft).toBeNull();
  expect(result.current.locked).toBe(false);
});
