// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import OpsLoginPage from './OpsLoginPage';

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
} as const;

const auth = vi.hoisted(() => ({
  loading: false,
  loginOps: vi.fn((): Promise<void> => Promise.resolve()),
  opsError: null as string | null,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => auth,
}));

const renderLogin = () =>
  render(
    <MemoryRouter future={routerFuture}>
      <OpsLoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  auth.loading = false;
  auth.loginOps.mockReset();
  auth.opsError = null;
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('OpsLoginPage', () => {
  it('provides one semantic page heading and stable credential metadata', () => {
    const { container } = renderLogin();
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const verification = screen.getByLabelText('Verification code');

    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(email.getAttribute('name')).toBe('email');
    expect(email.getAttribute('type')).toBe('email');
    expect(email.getAttribute('inputmode')).toBe('email');
    expect(email.getAttribute('autocomplete')).toBe('username');
    expect(email.getAttribute('spellcheck')).toBe('false');
    expect(password.getAttribute('name')).toBe('password');
    expect(password.getAttribute('autocomplete')).toBe('current-password');
    expect(verification.getAttribute('name')).toBe('verificationCode');
    expect(document.body.textContent).not.toContain('https://auth.internal');
    expect(document.body.textContent).not.toContain('API rejected the request');
  });

  it('focuses invalid fields in email, password, then verification order', async () => {
    const user = userEventLibrary.setup();
    renderLogin();
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const verification = screen.getByLabelText('Verification code');
    const submit = screen.getByRole('button', { name: 'Sign in to console' });

    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(email));

    await user.type(email, 'operator@example.com');
    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(password));

    await user.type(password, 'correct horse battery staple');
    await user.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(verification));
  });

  it('focuses a committed remote error without clearing entered credentials', async () => {
    const user = userEventLibrary.setup();
    const view = renderLogin();
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');

    await user.type(email, 'operator@example.com');
    await user.type(password, 'secret value');
    auth.opsError = 'Email or password is incorrect.';
    view.rerender(
      <MemoryRouter future={routerFuture}>
        <OpsLoginPage />
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect((email as HTMLInputElement).value).toBe('operator@example.com');
    expect((password as HTMLInputElement).value).toBe('secret value');
  });
});
