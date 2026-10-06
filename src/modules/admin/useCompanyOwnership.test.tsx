// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useCompanyMutation } from './useCompanyMutation';
import { useCompanyResource } from './useCompanyResource';

const state = vi.hoisted(() => ({
  tenantId: 'a',
  user: { id: 'admin' },
  clientSession: null,
  client: { request: vi.fn() },
}));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => state }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
afterEach(() => {
  cleanup();
  state.tenantId = 'a';
  state.client.request.mockReset();
});
it('rejects an old mutation owner before starting a write and suppresses its late completion', async () => {
  let finish: ((value: object) => void) | undefined;
  state.client.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const view = renderHook(() => useCompanyMutation());
  const oldRun = view.result.current.run;
  let pending: Promise<unknown> | undefined;
  act(() => {
    pending = oldRun('mutation Save', {});
  });
  state.tenantId = 'b';
  view.rerender();
  expect(await oldRun('mutation Save', {})).toBeNull();
  expect(state.client.request).toHaveBeenCalledOnce();
  await act(async () => {
    finish?.({ saved: true });
    expect(await pending).toBeNull();
  });
  expect(view.result.current.busy).toBe(false);
  expect(view.result.current.error).toBeNull();
});
it('hides an old location response while a new owner loads', async () => {
  let oldFinish: ((value: object) => void) | undefined;
  state.client.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        oldFinish = resolve;
      })
  );
  const view = renderHook(() => useCompanyResource<{ name: string }>('query Locations', {}));
  await waitFor(() => expect(state.client.request).toHaveBeenCalledOnce());
  state.client.request.mockResolvedValueOnce({ name: 'new location' });
  state.tenantId = 'b';
  view.rerender();
  await waitFor(() => expect(view.result.current.data?.name).toBe('new location'));
  await act(async () => {
    oldFinish?.({ name: 'old tenant location' });
    await Promise.resolve();
  });
  expect(view.result.current.data?.name).toBe('new location');
});
