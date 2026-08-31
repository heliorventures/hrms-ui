// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError, resolveTenantBySlug, type ResolvedTenant } from '../auth/authClient';

import { TenantProvider, useTenant } from './TenantContext';

const appConfig = vi.hoisted(() => ({
  current: {
    authUrl: 'https://auth.example.test',
    devTenantSlug: 'acme' as string | undefined,
    gatewayUrl: 'https://gateway.example.test/graphql',
  },
}));

vi.mock('../config', () => ({ getAppConfig: () => appConfig.current }));

const RESOLVED_TENANT: ResolvedTenant = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Acme Health',
  status: 'ACTIVE',
  subdomain: 'acme',
  timezone: 'Asia/Kolkata',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
  });
}

function deferred<T>() {
  let resolve = (_value: T): void => undefined;
  let reject = (_reason?: unknown): void => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

const TenantProbe = () => {
  const tenant = useTenant();
  const [retryResult, setRetryResult] = useState<string>('not-called');

  return (
    <>
      <output data-testid="status">{tenant.resolutionStatus}</output>
      <output data-testid="error">{tenant.resolutionError ?? ''}</output>
      <output data-testid="tenant-name">{tenant.currentTenant.name}</output>
      <output data-testid="tenant-timezone">{tenant.currentTenant.timezone}</output>
      <output data-testid="can-retry">{String(tenant.canRetryTenantResolution)}</output>
      <output data-testid="retry-result">{retryResult}</output>
      <button type="button" onClick={() => setRetryResult(String(tenant.retryTenantResolution()))}>
        Retry resolution
      </button>
    </>
  );
};

function renderTenantProvider() {
  return render(
    <MemoryRouter>
      <TenantProvider>
        <TenantProbe />
      </TenantProvider>
    </MemoryRouter>
  );
}

function expectStatus(status: string): void {
  expect(screen.getByTestId('status').textContent).toBe(status);
}

beforeEach(() => {
  appConfig.current = {
    authUrl: 'https://auth.example.test',
    devTenantSlug: 'acme',
    gatewayUrl: 'https://gateway.example.test/graphql',
  };
  window.history.replaceState({}, '', '/');
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('resolveTenantBySlug', () => {
  it('forwards an optional AbortSignal while preserving one-argument callers', async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        Promise.resolve(jsonResponse(RESOLVED_TENANT))
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await resolveTenantBySlug('acme', { signal: controller.signal });
    await resolveTenantBySlug('legacy');

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
    expect(fetchMock.mock.calls[1]?.[1]?.signal).toBeUndefined();
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'https://auth.example.test/auth/client/tenants/legacy'
    );
  });
});

describe('TenantProvider resolution lifecycle', () => {
  it.each([
    ['a response without timezone', { ...RESOLVED_TENANT, timezone: undefined }],
    ['an invalid IANA timezone', { ...RESOLVED_TENANT, timezone: 'Not/A-Timezone' }],
  ])('fails closed for %s instead of using the browser timezone', async (_label, payload) => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse(payload))));

    renderTenantProvider();

    await waitFor(() => expectStatus('error'));
    expect(screen.getByTestId('error').textContent).toBe(
      'We could not open this organization right now. Try again.'
    );
    expect(screen.getByTestId('tenant-timezone').textContent).toBe('UTC');
  });

  it('makes a 404 terminal and refuses retry without another request', async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        Promise.resolve(
          jsonResponse(
            { error: { code: 'TENANT_NOT_FOUND', message: 'raw tenant service detail' } },
            404
          )
        )
    );
    vi.stubGlobal('fetch', fetchMock);

    renderTenantProvider();

    await waitFor(() => expectStatus('not-found'));
    expect(screen.getByTestId('error').textContent).toBe('We could not find this organization.');
    expect(screen.getByTestId('can-retry').textContent).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expect(screen.getByTestId('retry-result').textContent).toBe('false');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a transient failure, exposes resolving, and clears retry state on success', async () => {
    const retryRequest = deferred<Response>();
    const fetchMock = vi
      .fn<[RequestInfo | URL, RequestInit?], Promise<Response>>()
      .mockRejectedValueOnce(new TypeError('fetch https://auth.internal failed'))
      .mockImplementationOnce(() => retryRequest.promise);
    vi.stubGlobal('fetch', fetchMock);

    renderTenantProvider();

    await waitFor(() => expectStatus('error'));
    expect(screen.getByTestId('can-retry').textContent).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expectStatus('resolving');
    expect(screen.getByTestId('retry-result').textContent).toBe('true');
    expect(screen.getByTestId('error').textContent).toBe('');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      retryRequest.resolve(jsonResponse(RESOLVED_TENANT));
      await retryRequest.promise;
    });

    await waitFor(() => expectStatus('resolved'));
    expect(screen.getByTestId('tenant-name').textContent).toBe('Acme Health');
    expect(screen.getByTestId('tenant-timezone').textContent).toBe('Asia/Kolkata');
    expect(screen.getByTestId('can-retry').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it.each([
    [
      'a revoked proxy',
      () => {
        const proxy = Proxy.revocable({}, {});
        proxy.revoke();
        return proxy.proxy;
      },
    ],
    [
      'an AuthError with hostile status and code accessors',
      () => {
        const error = Object.create(AuthError.prototype) as AuthError;
        Object.defineProperties(error, {
          code: {
            get: () => {
              throw new Error('code access is hostile');
            },
          },
          status: {
            get: () => {
              throw new Error('status access is hostile');
            },
          },
        });
        return error;
      },
    ],
  ])('fails closed for %s and presents the safe unavailable state', async (_label, makeError) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(makeError()))
    );

    renderTenantProvider();

    await waitFor(() => expectStatus('error'));
    expect(screen.getByTestId('error').textContent).toBe(
      'We could not open this organization right now. Try again.'
    );
    expect(screen.getByTestId('can-retry').textContent).toBe('true');
  });
});

describe('TenantProvider retry limits and cleanup', () => {
  it('starts one physical request when StrictMode replays the initial effect', async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('cancelled', 'AbortError')),
            { once: true }
          );
        })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <StrictMode>
          <TenantProvider>
            <TenantProbe />
          </TenantProvider>
        </StrictMode>
      </MemoryRouter>
    );
    await act(async () => Promise.resolve());

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts after 10 seconds and reports a safe transient error', async () => {
    vi.useFakeTimers();
    const requestState = { signal: null as AbortSignal | null };
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      requestState.signal = init?.signal ?? null;
      return new Promise((_resolve, reject) => {
        requestState.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('request timed out', 'AbortError')),
          { once: true }
        );
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderTenantProvider();
    expectStatus('resolving');

    await act(async () => vi.advanceTimersByTimeAsync(9_999));
    expect(requestState.signal?.aborted).toBe(false);
    expectStatus('resolving');

    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(requestState.signal?.aborted).toBe(true);
    expectStatus('error');
    expect(screen.getByTestId('error').textContent).toBe(
      'The sign-in service is unavailable right now. Try again.'
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts at most 3 attempts and refuses active or exhausted retries', async () => {
    const secondRequest = deferred<Response>();
    const thirdRequest = deferred<Response>();
    const fetchMock = vi
      .fn<[RequestInfo | URL, RequestInit?], Promise<Response>>()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockImplementationOnce(() => secondRequest.promise)
      .mockImplementationOnce(() => thirdRequest.promise);
    vi.stubGlobal('fetch', fetchMock);

    renderTenantProvider();
    await waitFor(() => expectStatus('error'));

    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expectStatus('resolving');
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expect(screen.getByTestId('retry-result').textContent).toBe('false');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondRequest.reject(new TypeError('still offline'));
      await secondRequest.promise.catch(() => undefined);
    });
    await waitFor(() => expectStatus('error'));
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expectStatus('resolving');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    await act(async () => {
      thirdRequest.reject(new TypeError('still offline'));
      await thirdRequest.promise.catch(() => undefined);
    });
    await waitFor(() => expectStatus('error'));
    expect(screen.getByTestId('can-retry').textContent).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expect(screen.getByTestId('retry-result').textContent).toBe('false');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not resolve or retry without a tenant slug', () => {
    appConfig.current = { ...appConfig.current, devTenantSlug: undefined };
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderTenantProvider();

    expectStatus('marketing');
    expect(screen.getByTestId('can-retry').textContent).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Retry resolution' }));
    expect(screen.getByTestId('retry-result').textContent).toBe('false');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aborts the active request and clears its timeout on unmount', async () => {
    vi.useFakeTimers();
    const requestState = { signal: null as AbortSignal | null };
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      requestState.signal = init?.signal ?? null;
      return new Promise(() => undefined);
    });
    vi.stubGlobal('fetch', fetchMock);

    const view = renderTenantProvider();
    await act(async () => Promise.resolve());
    expect(requestState.signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    view.unmount();

    expect(requestState.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
