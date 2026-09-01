// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RouteStatePage from './RouteStatePage';

const AccessDeniedWithoutRecovery = () => (
  // @ts-expect-error Access denied must always provide retry or a safe return route.
  <RouteStatePage state="access-denied" />
);
void AccessDeniedWithoutRecovery;

afterEach(cleanup);

describe('RouteStatePage', () => {
  it.each([
    ['loading', 'Opening page', 'Loading this page…'],
    [
      'unavailable',
      'Organization unavailable',
      'We could not open your organization workspace right now.',
    ],
    [
      'organization-not-found',
      'Organization not found',
      'Check the organization link and try again, or contact your administrator.',
    ],
    ['not-found', 'Page not found', 'We could not find the page you requested.'],
    ['unexpected', 'Page unavailable', 'This page could not be opened. Try again.'],
  ] as const)('renders the %s state with non-technical copy', (state, heading, message) => {
    render(
      <MemoryRouter>
        <RouteStatePage state={state} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/graphql|stack|exception|http|database/i);
  });

  it('labels loading as a polite status without a recovery action', () => {
    document.title = 'Reports | Helior HRMS';
    render(
      <MemoryRouter>
        <RouteStatePage state="loading" />
      </MemoryRouter>
    );

    const status = screen.getByRole('status', { name: 'Opening page' });
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(document.title).toBe('Reports | Helior HRMS');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each([
    ['unavailable', 'Organization unavailable | Helior HRMS', 'alert', 'assertive'],
    ['organization-not-found', 'Organization not found | Helior HRMS', 'alert', 'assertive'],
    ['not-found', 'Page not found | Helior HRMS', 'status', 'polite'],
    ['unexpected', 'Page unavailable | Helior HRMS', 'alert', 'assertive'],
  ] as const)(
    'owns the %s title and announces its terminal transition',
    async (state, title, role, live) => {
      document.title = 'Previous page | Helior HRMS';
      render(
        <MemoryRouter>
          <RouteStatePage state={state} />
        </MemoryRouter>
      );

      const announcement = screen.getByRole(role, {
        name: state === 'not-found' ? 'Page not found' : undefined,
      });
      expect(announcement.getAttribute('aria-live')).toBe(live);
      await waitFor(() => expect(document.title).toBe(title));
    }
  );

  it('requires access denied to provide an authorized recovery path', async () => {
    document.title = 'Previous page | Helior HRMS';
    render(
      <MemoryRouter>
        <RouteStatePage
          state="access-denied"
          returnTo="/dashboard"
          returnLabel="Return to dashboard"
        />
      </MemoryRouter>
    );

    const announcement = screen.getByRole('alert', { name: 'Access denied' });
    expect(announcement.getAttribute('aria-live')).toBe('assertive');
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toBeTruthy();
    await waitFor(() => expect(document.title).toBe('Access denied | Helior HRMS'));
  });

  it('offers only the supplied safe retry and return actions', () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <RouteStatePage
          state="unexpected"
          onRetry={onRetry}
          returnTo="/ops/tenants"
          returnLabel="Return to tenants"
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Return to tenants' }).getAttribute('href')).toBe(
      '/ops/tenants'
    );
  });

  it('explains exhausted organization recovery without rendering retry', () => {
    render(
      <MemoryRouter>
        <RouteStatePage state="unavailable" retryExhausted />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert', { name: 'Organization unavailable' })).toBeTruthy();
    expect(screen.getByText(/try again later/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
