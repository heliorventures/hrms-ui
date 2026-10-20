// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationSourceForm from './OrganizationSourceForm';

afterEach(cleanup);

it('clears an initial password before an uncertain submission finishes and prevents duplicate submission', async () => {
  let finish: (() => void) | undefined;
  const onSubmit = vi.fn().mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const stored = vi.spyOn(Storage.prototype, 'setItem');
  render(
    <OrganizationSourceForm
      label="Create source account"
      fields={[
        { key: 'username', label: 'Username', required: true },
        { key: 'initial_password', label: 'Initial password', type: 'password', required: true },
      ]}
      onSubmit={onSubmit}
    />
  );
  fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'source-account' } });
  const password = screen.getByLabelText(/Initial password/);
  fireEvent.change(password, { target: { value: 'private-initial-secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create source account' }));
  expect(onSubmit).toHaveBeenCalledWith({
    username: 'source-account',
    initial_password: 'private-initial-secret',
  });
  expect((password as HTMLInputElement).value).toBe('');
  fireEvent.click(screen.getByRole('button', { name: /Create source account/ }));
  expect(onSubmit).toHaveBeenCalledOnce();
  expect(stored).not.toHaveBeenCalled();
  await act(async () => {
    finish?.();
    await Promise.resolve();
  });
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Create source account' }).hasAttribute('disabled')
    ).toBe(false)
  );
});
