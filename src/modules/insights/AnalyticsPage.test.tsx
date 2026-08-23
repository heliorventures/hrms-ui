// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AnalyticsPage from './AnalyticsPage';

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

describe('AnalyticsPage', () => {
  it('renders a stable business panel without operational diagnostics or raw identifiers', async () => {
    render(<AnalyticsPage />);

    await screen.findByText('Collaboration');
    const tab = screen.getByRole('tab', { name: 'Workplace' });
    const panel = screen.getByRole('tabpanel', { name: 'Workplace' });
    expect(tab.id).toBe('analytics-tab-workplace-tab');
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(graphState.client.request).toHaveBeenCalledOnce();

    const businessPageText = document.body.textContent ?? '';
    expect(businessPageText).not.toMatch(
      /webhook|response body|subscription id|gateway|subgraph|outbox|federation/i
    );
    expect(screen.queryByRole('tab', { name: /webhook/i })).toBeNull();
  });

  it('ignores an older client response after a newer request has completed', async () => {
    const first = deferred<ReturnType<typeof workplaceData>>();
    const second = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => first.promise) };
    const view = render(<AnalyticsPage />);

    graphState.client = { request: vi.fn(() => second.promise) };
    view.rerender(<AnalyticsPage />);
    await act(async () => second.resolve(workplaceData('Strategic leadership')));
    await screen.findByText('Strategic leadership');

    await act(async () => first.resolve(workplaceData('Stale competency')));
    await waitFor(() => expect(screen.queryByText('Stale competency')).toBeNull());
    expect(screen.getByText('Strategic leadership')).toBeTruthy();
  });

  it('clears tenant A workplace data before a replacement tenant B request rejects', async () => {
    graphState.client = { request: vi.fn().mockResolvedValue(workplaceData('Tenant A capability')) };
    const view = render(<AnalyticsPage />);
    await screen.findByText('Tenant A capability');

    const tenantB = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => tenantB.promise) };
    view.rerender(<AnalyticsPage />);

    await screen.findByRole('status', { name: 'Loading workplace insights…' });
    expect(screen.queryByText('Tenant A capability')).toBeNull();
    await act(async () => tenantB.reject(new Error('tenant B raw transport failure')));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Workplace insights could not be loaded. Try again.');
    expect(alert.textContent).not.toContain('transport');
    expect(screen.queryByText('Tenant A capability')).toBeNull();
  });

  it('announces friendly loading and empty workplace states', async () => {
    const pending = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => pending.promise) };
    render(<AnalyticsPage />);

    expect(screen.getByRole('status', { name: 'Loading workplace insights…' })).toBeTruthy();
    await act(async () => pending.resolve({ competencies: [], talentPools: [] }));

    expect(await screen.findByText('No competencies are available yet.')).toBeTruthy();
    expect(screen.getByText('No talent pools are available yet.')).toBeTruthy();
    expect(document.body.textContent).not.toContain('returned');
    expect(document.body.textContent).not.toContain('Loading...');
  });

  it('does not publish a response after unmount', async () => {
    const pending = deferred<ReturnType<typeof workplaceData>>();
    graphState.client = { request: vi.fn(() => pending.promise) };
    const view = render(<AnalyticsPage />);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.unmount();
    await act(async () => pending.resolve(workplaceData('After unmount')));

    expect(screen.queryByText('After unmount')).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
