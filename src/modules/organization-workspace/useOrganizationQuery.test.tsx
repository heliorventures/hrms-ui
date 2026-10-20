// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { ClientError } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { OrganizationAccessContext } from './organizationAccessContext';
import { useOrganizationQuery } from './useOrganizationQuery';

afterEach(cleanup);

it('hides previous company data immediately and ignores its late response', async () => {
  let finishOld: ((value: string) => void) | undefined;
  const load = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finishOld = resolve;
        })
    )
    .mockResolvedValue('Company B');
  const view = renderHook(({ owner }) => useOrganizationQuery(owner, load), {
    initialProps: { owner: 'principal-a|source-a|target-a' },
  });
  await waitFor(() => expect(load).toHaveBeenCalledOnce());
  view.rerender({ owner: 'principal-a|source-a|target-b' });
  expect(view.result.current.data).toBeNull();
  await waitFor(() => expect(view.result.current.data).toBe('Company B'));
  await act(async () => {
    finishOld?.('Company A private data');
    await Promise.resolve();
  });
  expect(view.result.current.data).toBe('Company B');
});

it('clears visible data after access revocation rather than retaining a successful cache', async () => {
  const load = vi
    .fn()
    .mockResolvedValueOnce(['employee-a'])
    .mockRejectedValue(new Error('forbidden'));
  const view = renderHook(() => useOrganizationQuery('principal-a|source-a|target-a', load));
  await waitFor(() => expect(view.result.current.data).toEqual(['employee-a']));
  act(() => view.result.current.refresh());
  expect(view.result.current.data).toBeNull();
  await waitFor(() => expect(view.result.current.error).not.toBeNull());
  expect(view.result.current.data).toBeNull();
});

it('signals current authorization denial so the workspace clears revoked company state', async () => {
  const denied = new ClientError(
    {
      status: 200,
      headers: new Headers(),
      errors: [{ message: 'denied', extensions: { code: 'FORBIDDEN' } }],
    },
    { query: '{ denied }' }
  );
  const revalidate = vi.fn();
  const load = vi.fn().mockRejectedValue(denied);
  const view = renderHook(() => useOrganizationQuery('principal-a|source-a|target-a', load), {
    wrapper: ({ children }) => (
      <OrganizationAccessContext.Provider value={revalidate}>
        {children}
      </OrganizationAccessContext.Provider>
    ),
  });
  await waitFor(() => expect(view.result.current.denied).toBe(true));
  expect(view.result.current.data).toBeNull();
  expect(revalidate).toHaveBeenCalledOnce();
});
