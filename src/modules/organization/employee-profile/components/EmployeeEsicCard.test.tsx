// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmployeeEsicCard from './EmployeeEsicCard';

afterEach(cleanup);

describe('EmployeeEsicCard', () => {
  it('saves the number as text, preserves leading zeroes and reloads with the profile', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi
      .spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeEsicNumber: null })
      .mockResolvedValueOnce({ setEmployeeEsicNumber: '0123456789' })
      .mockResolvedValueOnce({ employeeEsicNumber: '9876543210' });
    const view = render(
      <EmployeeEsicCard client={client} employeeId="employee-1" canEdit refreshVersion={0} />
    );
    await user.click(await screen.findByRole('button', { name: 'Add ESIC number' }));
    await user.type(screen.getByRole('textbox', { name: 'ESIC number' }), '0123456789');
    await user.click(screen.getByRole('button', { name: 'Save ESIC number' }));
    await screen.findByText('0123456789');
    expect(request).toHaveBeenNthCalledWith(2, expect.anything(), {
      input: { employeeId: 'employee-1', esicNumber: '0123456789' },
    });
    view.rerender(
      <EmployeeEsicCard client={client} employeeId="employee-1" canEdit refreshVersion={1} />
    );
    await screen.findByText('9876543210');
    expect(screen.queryByText('0123456789')).toBeNull();
  });

  it('cancels without clearing and clears only through an explicit save', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi
      .spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeEsicNumber: '0123456789' })
      .mockResolvedValueOnce({ setEmployeeEsicNumber: null });
    render(<EmployeeEsicCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Update ESIC number' }));
    await user.clear(screen.getByRole('textbox', { name: 'ESIC number' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.getByText('0123456789')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Update ESIC number' }));
    await user.clear(screen.getByRole('textbox', { name: 'ESIC number' }));
    await user.click(screen.getByRole('button', { name: 'Save ESIC number' }));
    await screen.findByText('Not recorded');
    expect(request).toHaveBeenNthCalledWith(2, expect.anything(), {
      input: { employeeId: 'employee-1', esicNumber: '' },
    });
  });

  it.each(['123456789', '123456789A'])('rejects invalid input %s without saving', async (value) => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi.spyOn(client, 'request').mockResolvedValue({ employeeEsicNumber: null });
    render(<EmployeeEsicCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Add ESIC number' }));
    await user.type(screen.getByRole('textbox', { name: 'ESIC number' }), value);
    expect(screen.getByRole('alert').textContent).toBe('Enter exactly 10 digits.');
    expect(
      (screen.getByRole('button', { name: 'Save ESIC number' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('ignores a pending save after switching to another employee', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const onChanged = vi.fn();
    let resolveSave!: (value: { setEmployeeEsicNumber: string }) => void;
    const pendingSave = new Promise<{ setEmployeeEsicNumber: string }>((resolve) => {
      resolveSave = resolve;
    });
    vi.spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeEsicNumber: null })
      .mockReturnValueOnce(pendingSave)
      .mockResolvedValueOnce({ employeeEsicNumber: '9876543210' });
    const view = render(
      <EmployeeEsicCard client={client} employeeId="employee-1" canEdit onChanged={onChanged} />
    );
    await user.click(await screen.findByRole('button', { name: 'Add ESIC number' }));
    await user.type(screen.getByRole('textbox', { name: 'ESIC number' }), '0123456789');
    await user.click(screen.getByRole('button', { name: 'Save ESIC number' }));
    view.rerender(
      <EmployeeEsicCard client={client} employeeId="employee-2" canEdit onChanged={onChanged} />
    );
    await screen.findByText('9876543210');
    await act(async () => {
      resolveSave({ setEmployeeEsicNumber: '0123456789' });
      await pendingSave;
    });
    expect(screen.queryByText('0123456789')).toBeNull();
    expect(screen.queryByText('ESIC number saved.')).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('shows a recorded number without edit controls for a read-only viewer', async () => {
    const client = new GraphQLClient('https://example.test/graphql');
    vi.spyOn(client, 'request').mockResolvedValue({ employeeEsicNumber: '0123456789' });
    render(<EmployeeEsicCard client={client} employeeId="employee-1" canEdit={false} />);
    await screen.findByText('0123456789');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('retains the saved number and draft when the save fails', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    vi.spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeEsicNumber: '0123456789' })
      .mockRejectedValueOnce(new Error('Connection unavailable'));
    render(<EmployeeEsicCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Update ESIC number' }));
    const input = screen.getByRole('textbox', { name: 'ESIC number' });
    await user.clear(input);
    await user.type(input, '1234567890');
    await user.click(screen.getByRole('button', { name: 'Save ESIC number' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect((input as HTMLInputElement).value).toBe('1234567890');
    expect(screen.getByText('0123456789')).toBeTruthy();
  });
});
