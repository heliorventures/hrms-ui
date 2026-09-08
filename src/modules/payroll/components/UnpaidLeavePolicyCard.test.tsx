// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveUnpaidLeavePolicyDocument } from '../unpaidLeaveDocuments';

import UnpaidLeavePolicyCard from './UnpaidLeavePolicyCard';

afterEach(cleanup);
const savedPolicy = {
  enabled: true,
  basicComponentCode: 'BASIC',
  dayDivisor: '26',
  treatment: 'AFTER_STATUTORY',
};
const clientFor = (request: unknown) => ({ request }) as unknown as GraphQLClient;

describe('company unpaid leave policy', () => {
  it('starts disabled and requires HR to choose the complete formula', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({ payrollUnpaidLeavePolicy: null })
      .mockResolvedValueOnce({ savePayrollUnpaidLeavePolicy: savedPolicy });
    render(<UnpaidLeavePolicyCard client={clientFor(request)} ownerKey="tenant-a" />);
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
    await waitFor(() => expect(checkbox.disabled).toBe(false));
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(screen.getByLabelText<HTMLInputElement>('Divide monthly basic by (days)').value).toBe(
      ''
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('');
    fireEvent.change(screen.getByLabelText<HTMLInputElement>('Basic earning component code'), {
      target: { value: 'BASIC' },
    });
    fireEvent.change(screen.getByLabelText<HTMLInputElement>('Divide monthly basic by (days)'), {
      target: { value: '26' },
    });
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'AFTER_STATUTORY' },
    });
    fireEvent.click(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Save unpaid leave policy' })
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(SaveUnpaidLeavePolicyDocument, { input: savedPolicy })
    );
    expect(await screen.findByText('Unpaid leave policy saved.')).toBeTruthy();
  });

  it('does not treat a failed load as a disabled policy that can be overwritten', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('Cannot load policy'))
      .mockResolvedValueOnce({ payrollUnpaidLeavePolicy: savedPolicy });
    render(<UnpaidLeavePolicyCard client={clientFor(request)} ownerKey="tenant-a" />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Save unpaid leave policy' }).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole<HTMLButtonElement>('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true));
  });

  it('drops a previous tenant response and clears its form immediately', async () => {
    let finishFirst!: (value: unknown) => void;
    const requestA = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finishFirst = resolve;
        })
    );
    const requestB = vi.fn().mockResolvedValue({ payrollUnpaidLeavePolicy: null });
    const view = render(<UnpaidLeavePolicyCard client={clientFor(requestA)} ownerKey="tenant-a" />);
    await waitFor(() => expect(requestA).toHaveBeenCalledOnce());
    view.rerender(<UnpaidLeavePolicyCard client={clientFor(requestB)} ownerKey="tenant-b" />);
    await waitFor(() =>
      expect(screen.getByRole<HTMLInputElement>('checkbox').disabled).toBe(false)
    );
    await act(() => Promise.resolve(finishFirst({ payrollUnpaidLeavePolicy: savedPolicy })));
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
    expect(screen.queryByLabelText('Basic earning component code')).toBeNull();
  });
});
