// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useAdministrationCycles } from './useAdministrationCycles';

const { client } = vi.hoisted(() => ({ client: { request: vi.fn() } }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
afterEach(() => {
  cleanup();
  client.request.mockReset();
});
const empty = { performanceAdminCycles: { items: [], nextCursor: null } };

it('distinguishes failed loading from genuine empty success and supports retry', async () => {
  client.request.mockRejectedValueOnce(new Error('synthetic failure')).mockResolvedValueOnce(empty);
  const message = vi.fn();
  const { result } = renderHook(() => useAdministrationCycles({ setMessage: message }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeTruthy();
  expect(result.current.cycles).toEqual([]);
  await act(async () => {
    result.current.reloadCycles();
    await Promise.resolve();
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeNull();
  expect(result.current.cycles).toEqual([]);
});

it('ignores an older program response after selection changes', async () => {
  let resolveOld!: (value: typeof empty) => void;
  client.request
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        })
    )
    .mockResolvedValueOnce(empty);
  const message = vi.fn();
  const { result, rerender } = renderHook(
    ({ program }) =>
      useAdministrationCycles({ performanceProgramId: program, setMessage: message }),
    { initialProps: { program: 'old' } }
  );
  rerender({ program: 'new' });
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => {
    resolveOld({
      performanceAdminCycles: {
        items: [{ reviewCycle: { id: 'old-cycle' } }] as never,
        nextCursor: 'old-cursor',
      },
    });
    await Promise.resolve();
  });
  expect(result.current.cycles).toEqual([]);
  expect(result.current.nextCycleCursor).toBeNull();
  expect(result.current.error).toBeNull();
});
