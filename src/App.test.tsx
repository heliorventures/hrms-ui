// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const state = vi.hoisted(() => ({
  client: {
    request: vi.fn(() => new Promise<never>(() => undefined)),
  },
  logoutOps: vi.fn(async () => undefined),
}));

vi.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./contexts/TenantContext', () => ({
  TenantProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTenant: () => ({
    currentTenant: { id: '11111111-1111-4111-8111-111111111111' },
    resolutionError: null,
    resolutionStatus: 'error',
  }),
}));
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isAuthenticated: false,
    isOpsAuthenticated: true,
    tenantId: null,
    opsUser: { email: 'operator@example.com' },
    logoutOps: state.logoutOps,
  }),
}));
vi.mock('./components/layout/CommandPaletteContext', () => ({
  CommandPaletteProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));

describe('App provider topology', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    state.client.request.mockClear();
  });

  afterEach(() => cleanup());

  it.each([
    ['/ops/tenants', 'Tenants'],
    ['/ops/modules', 'Modules & Subscriptions'],
  ])('provides shared dialogs to the real operations page at %s', async (path, heading) => {
    window.history.pushState({}, '', path);
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: heading }, { timeout: 5_000 })
    ).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Page unavailable' })).toBeNull();
  });
});
