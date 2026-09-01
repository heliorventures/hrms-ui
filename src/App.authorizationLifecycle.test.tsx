// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const state = vi.hoisted(() => ({
  auth: {
    isAuthenticated: true,
    isOpsAuthenticated: false,
    tenantId: 'tenant-a' as string | null,
    user: { id: 'employee-a' } as { id: string } | null,
    opsUser: null as { id: string } | null,
  },
  tenant: {
    currentTenant: { id: 'tenant-a' },
    tenantSlug: 'tenant-a',
  },
}));

vi.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./contexts/TenantContext', () => ({
  TenantProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTenant: () => state.tenant,
}));
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => state.auth,
}));
vi.mock('./components/layout/CommandPaletteContext', () => ({
  CommandPaletteProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('./routes/AppRoutes', async () => {
  const { useDialogs } = await import('./contexts/DialogContext');
  return {
    default: () => {
      const dialogs = useDialogs();
      return (
        <button
          type="button"
          onClick={() => {
            void dialogs
              .confirm({ title: 'Delete employee', message: 'Delete this employee?' })
              .then((confirmed) => {
                document.body.dataset.confirmResult = String(confirmed);
              });
            void dialogs
              .alert({ title: 'Queued notice', message: 'Queued for this session' })
              .then(() => {
                document.body.dataset.alertSettled = 'true';
              });
          }}
        >
          Open authorization-owned dialogs
        </button>
      );
    },
  };
});

function openDialogs() {
  fireEvent.click(screen.getByRole('button', { name: 'Open authorization-owned dialogs' }));
  expect(screen.getByRole('dialog', { name: 'Delete employee' })).toBeTruthy();
}

async function expectDialogsInvalidated() {
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.body.dataset.confirmResult).toBe('false'));
  expect(document.body.dataset.alertSettled).toBe('true');
}

describe('App dialog authorization lifecycle', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/dashboard');
    state.auth = {
      isAuthenticated: true,
      isOpsAuthenticated: false,
      tenantId: 'tenant-a',
      user: { id: 'employee-a' },
      opsUser: null,
    };
    state.tenant = {
      currentTenant: { id: 'tenant-a' },
      tenantSlug: 'tenant-a',
    };
    delete document.body.dataset.confirmResult;
    delete document.body.dataset.alertSettled;
  });

  afterEach(() => cleanup());

  it('invalidates active and queued dialogs when the principal changes on the same route', async () => {
    const view = render(<App />);
    openDialogs();

    state.auth = { ...state.auth, user: { id: 'employee-b' } };
    view.rerender(<App />);

    await expectDialogsInvalidated();
  });

  it('invalidates active and queued dialogs when the tenant changes on the same route', async () => {
    const view = render(<App />);
    openDialogs();

    state.auth = { ...state.auth, tenantId: 'tenant-b' };
    state.tenant = {
      currentTenant: { id: 'tenant-b' },
      tenantSlug: 'tenant-b',
    };
    view.rerender(<App />);

    await expectDialogsInvalidated();
  });

  it('invalidates active and queued dialogs when the application domain changes', async () => {
    render(<App />);
    openDialogs();

    state.auth = {
      isAuthenticated: false,
      isOpsAuthenticated: false,
      tenantId: null,
      user: null,
      opsUser: null,
    };
    act(() => {
      window.history.pushState({}, '', '/ops/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await expectDialogsInvalidated();
  });
});
