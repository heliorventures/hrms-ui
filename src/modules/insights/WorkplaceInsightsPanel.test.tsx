// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import WorkplaceInsightsPanel from './WorkplaceInsightsPanel';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

const workplaceData = (name: string) => ({
  competencies: [{ id: `competency-${name}`, name, category: null, description: null }],
  talentPools: [],
});

beforeEach(() => {
  graphState.client = { request: vi.fn().mockResolvedValue(workplaceData('Collaboration')) };
});

afterEach(cleanup);

describe('WorkplaceInsightsPanel', () => {
  it('renders a stable business panel without operational diagnostics or raw identifiers', async () => {
    render(<WorkplaceInsightsPanel />);

    await screen.findByText('Collaboration');
    expect(screen.getByRole('region', { name: 'Workplace insights' })).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledOnce();

    const businessPageText = document.body.textContent;
    expect(businessPageText).not.toMatch(
      /webhook|response body|subscription id|gateway|subgraph|outbox|federation/i
    );
    expect(screen.queryByRole('tab', { name: /webhook/i })).toBeNull();
  });

  it('ignores an older client response after a newer request has completed', async () => {
    const first = deferred<ReturnType<typeof workplaceData>>();
    const second = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => first.promise) };
    const view = render(<WorkplaceInsightsPanel />);

    graphState.client = { request: vi.fn(() => second.promise) };
    view.rerender(<WorkplaceInsightsPanel />);
    await act(() => Promise.resolve(second.resolve(workplaceData('Strategic leadership'))));
    await screen.findByText('Strategic leadership');

    await act(() => Promise.resolve(first.resolve(workplaceData('Stale competency'))));
    await waitFor(() => expect(screen.queryByText('Stale competency')).toBeNull());
    expect(screen.getByText('Strategic leadership')).toBeTruthy();
  });

  it('clears tenant A workplace data before a replacement tenant B request rejects', async () => {
    graphState.client = {
      request: vi.fn().mockResolvedValue(workplaceData('Tenant A capability')),
    };
    const view = render(<WorkplaceInsightsPanel />);
    await screen.findByText('Tenant A capability');

    const tenantB = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => tenantB.promise) };
    view.rerender(<WorkplaceInsightsPanel />);

    await screen.findByRole('status', { name: 'Loading workplace insights…' });
    expect(screen.queryByText('Tenant A capability')).toBeNull();
    await act(() => Promise.resolve(tenantB.reject(new Error('tenant B raw transport failure'))));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Workplace insights could not be loaded. Try again.');
    expect(alert.textContent).not.toContain('transport');
    expect(screen.queryByText('Tenant A capability')).toBeNull();
  });

  it('announces friendly loading and empty workplace states', async () => {
    const pending = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => pending.promise) };
    render(<WorkplaceInsightsPanel />);

    expect(screen.getByRole('status', { name: 'Loading workplace insights…' })).toBeTruthy();
    await act(() => Promise.resolve(pending.resolve({ competencies: [], talentPools: [] })));

    expect(await screen.findByText('No competencies are available yet.')).toBeTruthy();
    expect(screen.getByText('No talent pools are available yet.')).toBeTruthy();
    expect(document.body.textContent).not.toContain('returned');
    expect(document.body.textContent).not.toContain('Loading...');
  });

  it('does not publish a response after unmount', async () => {
    const pending = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => pending.promise) };
    const view = render(<WorkplaceInsightsPanel />);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.unmount();
    await act(() => Promise.resolve(pending.resolve(workplaceData('After unmount'))));

    expect(screen.queryByText('After unmount')).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
