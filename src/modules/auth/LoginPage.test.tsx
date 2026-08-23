// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './LoginPage';

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
} as const;

const mocks = vi.hoisted(() => ({
  auth: {
    error: null as string | null,
    loading: false,
    login: vi.fn((): Promise<void> => Promise.resolve()),
  },
  tenant: {
    currentTenant: { id: 'tenant-1', name: 'Northwind HR' },
    resolutionError: null as string | null,
    resolutionStatus: 'resolved',
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => mocks.tenant,
}));

const renderLogin = () =>
  render(
    <MemoryRouter future={routerFuture}>
      <LoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  mocks.auth.error = null;
  mocks.auth.loading = false;
  mocks.auth.login.mockReset();
  mocks.tenant.resolutionError = null;
  mocks.tenant.resolutionStatus = 'resolved';
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LoginPage', () => {
  it('provides one semantic page heading and stable credential metadata', () => {
    const { container } = renderLogin();
    const username = screen.getByLabelText('Email, mobile number, or unique name');
    const password = screen.getByLabelText('Password');
    const verification = screen.getByLabelText('Verification code');

    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(username.getAttribute('name')).toBe('username');
    expect(username.getAttribute('autocomplete')).toBe('username');
    expect(username.getAttribute('spellcheck')).toBe('false');
    expect(password.getAttribute('name')).toBe('password');
    expect(password.getAttribute('autocomplete')).toBe('current-password');
    expect(verification.getAttribute('name')).toBe('verificationCode');
    expect(document.body.textContent).not.toContain('https://auth.internal');
    expect(document.body.textContent).not.toContain('API rejected the request');
  });

  it('focuses invalid fields in username, password, then verification order', async () => {
    const user = userEventLibrary.setup();
    renderLogin();
    const username = screen.getByLabelText('Email, mobile number, or unique name');
    const password = screen.getByLabelText('Password');
    const verification = screen.getByLabelText('Verification code');
    const submit = screen.getByRole('button', { name: 'Sign in' });

    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(username));

    await user.type(username, 'alex');
    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(password));

    await user.type(password, 'correct horse battery staple');
    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(verification));
  });

  it('focuses a committed remote error without clearing entered credentials', async () => {
    const user = userEventLibrary.setup();
    const view = renderLogin();
    const username = screen.getByLabelText('Email, mobile number, or unique name');
    const password = screen.getByLabelText('Password');

    await user.type(username, 'alex');
    await user.type(password, 'secret value');
    mocks.auth.error = 'Username or password is incorrect.';
    view.rerender(
      <MemoryRouter future={routerFuture}>
        <LoginPage />
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect((username as HTMLInputElement).value).toBe('alex');
    expect((password as HTMLInputElement).value).toBe('secret value');
  });
});
