// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmployeeUanCard from './EmployeeUanCard';

afterEach(cleanup);

describe('EmployeeUanCard', () => {
  it('reloads when the profile refreshes and replaces the previously saved value', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    vi.spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeUanNumber: null })
      .mockResolvedValueOnce({ setEmployeeUanNumber: '012345678901' })
      .mockResolvedValueOnce({ employeeUanNumber: '987654321012' });
    const view = render(
      <EmployeeUanCard client={client} employeeId="employee-1" canEdit refreshVersion={0} />
    );
    await user.click(await screen.findByRole('button', { name: 'Add EPF / UAN number' }));
    await user.type(screen.getByRole('textbox', { name: 'EPF / UAN number' }), '012345678901');
    await user.click(screen.getByRole('button', { name: 'Save EPF / UAN number' }));
    await screen.findByText('012345678901');
    view.rerender(
      <EmployeeUanCard client={client} employeeId="employee-1" canEdit refreshVersion={1} />
    );
    await screen.findByText('987654321012');
    expect(screen.queryByText('012345678901')).toBeNull();
  });

  it('clears a recorded UAN only through an explicit save', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi
      .spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeUanNumber: '012345678901' })
      .mockResolvedValueOnce({ setEmployeeUanNumber: null });
    render(<EmployeeUanCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Update EPF / UAN number' }));
    await user.clear(screen.getByRole('textbox', { name: 'EPF / UAN number' }));
    expect(request).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Save EPF / UAN number' }));
    await screen.findByText('Not recorded');
    expect(request.mock.calls[1]?.[1]).toEqual({
      input: { employeeId: 'employee-1', uanNumber: '' },
    });
  });

  it('prevents submission of an invalid UAN', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi.spyOn(client, 'request').mockResolvedValue({ employeeUanNumber: null });
    render(<EmployeeUanCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Add EPF / UAN number' }));
    await user.type(screen.getByRole('textbox', { name: 'EPF / UAN number' }), '12345678901A');
    expect(screen.getByRole('alert').textContent).toBe('Enter exactly 12 digits.');
    expect(
      (screen.getByRole('button', { name: 'Save EPF / UAN number' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('ignores a previous employee save after switching profiles', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const onChanged = vi.fn();
    let resolveSave!: (value: { setEmployeeUanNumber: string }) => void;
    const pendingSave = new Promise<{ setEmployeeUanNumber: string }>((resolve) => {
      resolveSave = resolve;
    });
    vi.spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeUanNumber: null })
      .mockReturnValueOnce(pendingSave)
      .mockResolvedValueOnce({ employeeUanNumber: '987654321012' });
    const view = render(
      <EmployeeUanCard client={client} employeeId="employee-1" canEdit onChanged={onChanged} />
    );
    await user.click(await screen.findByRole('button', { name: 'Add EPF / UAN number' }));
    await user.type(screen.getByRole('textbox', { name: 'EPF / UAN number' }), '012345678901');
    await user.click(screen.getByRole('button', { name: 'Save EPF / UAN number' }));
    view.rerender(
      <EmployeeUanCard client={client} employeeId="employee-2" canEdit onChanged={onChanged} />
    );
    await screen.findByText('987654321012');
    await act(async () => {
      resolveSave({ setEmployeeUanNumber: '012345678901' });
      await pendingSave;
    });
    expect(screen.queryByText('012345678901')).toBeNull();
    expect(screen.queryByText('EPF / UAN number saved.')).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('shows an existing UAN without edit controls for a read-only employee', async () => {
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi
      .spyOn(client, 'request')
      .mockResolvedValue({ employeeUanNumber: '012345678901' });
    render(<EmployeeUanCard client={client} employeeId="employee-1" canEdit={false} />);
    await screen.findByText('012345678901');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('saves the identifier as a string and displays the persisted value', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    const request = vi
      .spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeUanNumber: null })
      .mockResolvedValueOnce({ setEmployeeUanNumber: '012345678901' });
    render(<EmployeeUanCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Add EPF / UAN number' }));
    await user.type(screen.getByRole('textbox', { name: 'EPF / UAN number' }), '012345678901');
    await user.click(screen.getByRole('button', { name: 'Save EPF / UAN number' }));
    await screen.findByText('EPF / UAN number saved.');
    expect(screen.getByText('012345678901')).toBeTruthy();
    expect(request.mock.calls[1]?.[1]).toEqual({
      input: { employeeId: 'employee-1', uanNumber: '012345678901' },
    });
  });

  it('retains the saved value and draft when saving fails', async () => {
    const user = userEvent.setup();
    const client = new GraphQLClient('https://example.test/graphql');
    vi.spyOn(client, 'request')
      .mockResolvedValueOnce({ employeeUanNumber: '012345678901' })
      .mockRejectedValueOnce(new Error('Connection unavailable'));
    render(<EmployeeUanCard client={client} employeeId="employee-1" canEdit />);
    await user.click(await screen.findByRole('button', { name: 'Update EPF / UAN number' }));
    const input = screen.getByRole('textbox', { name: 'EPF / UAN number' });
    await user.clear(input);
    await user.type(input, '123456789012');
    await user.click(screen.getByRole('button', { name: 'Save EPF / UAN number' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect((input as HTMLInputElement).value).toBe('123456789012');
    expect(screen.getByText('012345678901')).toBeTruthy();
  });
});
