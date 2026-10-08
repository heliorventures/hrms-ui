// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCompOffResource } from './useCompOffResource';

const state = vi.hoisted(() => ({ tenant: 'a', client: { request: vi.fn() } }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: state.tenant } }),
}));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => ({ clientSession: null }) }));
beforeEach(() => {
  state.tenant = 'a';
  state.client = { request: vi.fn() };
});
afterEach(cleanup);

describe('comp-off resource ownership', () => {
  it('sends one mutation when a request is submitted twice before completion', async () => {
    let finish!: (value: unknown) => void;
    state.client.request
      .mockResolvedValueOnce({ balance: '1' })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          })
      )
      .mockResolvedValue({ balance: '0' });
    const { result } = renderHook(() => useCompOffResource<{ balance: string }>('board', {}));
    await waitFor(() => expect(result.current.data).toBeTruthy());
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = result.current.mutate('claim', {});
      second = result.current.mutate('claim', {});
    });
    expect(await second).toBe(false);
    expect(state.client.request).toHaveBeenCalledTimes(2);
    await act(async () => {
      finish({ saved: true });
      expect(await first).toBe(true);
    });
  });
  it('does not expose the old tenant after its delayed query resolves', async () => {
    let finish!: (value: unknown) => void;
    state.client.request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const { result, rerender } = renderHook(() =>
      useCompOffResource<{ tenant: string }>('board', {})
    );
    await waitFor(() => expect(state.client.request).toHaveBeenCalledOnce());
    state.tenant = 'b';
    state.client = { request: vi.fn().mockResolvedValue({ tenant: 'b' }) };
    rerender();
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.data?.tenant).toBe('b'));
    await act(() => Promise.resolve(finish({ tenant: 'a' })));
    expect(result.current.data?.tenant).toBe('b');
  });
  it('does not refresh or overwrite a new tenant after a stale mutation completes', async () => {
    let finish!: (value: unknown) => void;
    const clientA = state.client;
    clientA.request.mockResolvedValueOnce({ tenant: 'a' }).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const { result, rerender } = renderHook(() =>
      useCompOffResource<{ tenant: string }>('board', {})
    );
    await waitFor(() => expect(result.current.data?.tenant).toBe('a'));
    let mutation!: Promise<boolean>;
    act(() => {
      mutation = result.current.mutate('approve', { id: 'claim-a' });
    });
    state.tenant = 'b';
    state.client = { request: vi.fn().mockResolvedValue({ tenant: 'b' }) };
    rerender();
    await waitFor(() => expect(result.current.data?.tenant).toBe('b'));
    await act(async () => {
      finish({ approved: true });
      expect(await mutation).toBe(false);
    });
    expect(result.current.data?.tenant).toBe('b');
    expect(state.client.request).toHaveBeenCalledOnce();
    expect(clientA.request).toHaveBeenCalledTimes(2);
  });
  it('keeps failed data unavailable and supports retry', async () => {
    state.client.request
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce({ balance: '2' });
    const { result } = renderHook(() => useCompOffResource<{ balance: string }>('board', {}));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.data).toBeNull();
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data?.balance).toBe('2'));
    expect(result.current.error).toBeNull();
  });
});
