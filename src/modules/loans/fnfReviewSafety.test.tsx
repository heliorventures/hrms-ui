// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFnfFinanceReview } from './useFnfFinanceReview';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  prepared: { revision: 2, fingerprint: 'saved-fingerprint', settlement: null },
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../hooks/useRetainedQuery', () => ({
  useRetainedQuery: () => ({
    data: { fnfFinancialReview: state.prepared },
    refresh: vi.fn(),
    phase: 'ready',
  }),
}));
afterEach(() => {
  cleanup();
  state.client.request.mockReset();
});

describe('FNF saved review finalization', () => {
  it('refuses to finalize a saved review after the date or source inputs are edited', async () => {
    const { result } = renderHook(() => useFnfFinanceReview('separation', vi.fn()));
    act(() => result.current.edit());
    await act(() => result.current.finalize());
    expect(result.current.dirty).toBe(true);
    expect(state.client.request).not.toHaveBeenCalled();
  });
  it('finalizes an unchanged saved review using its exact revision and fingerprint', async () => {
    state.client.request.mockResolvedValueOnce({ finalizeFnfSettlement: {} });
    const { result } = renderHook(() => useFnfFinanceReview('separation', vi.fn()));
    await act(() => result.current.finalize());
    expect(state.client.request).toHaveBeenCalledWith(expect.anything(), {
      separationId: 'separation',
      expectedRevision: 2,
      expectedFingerprint: 'saved-fingerprint',
    });
  });
});
