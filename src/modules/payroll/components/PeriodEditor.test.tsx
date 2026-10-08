// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { newPeriodInput } from '../newPeriodInput';
import { type PeriodInput, periodInputQuery, savePeriodInputMutation } from '../periodInputTypes';

import PeriodEditor from './PeriodEditor';

afterEach(cleanup);
const clientWith = (request: unknown) => {
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  return client;
};
type SaveVariables = { expectedRevision: number | null; input: PeriodInput };
describe('monthly payroll review', () => {
  it('creates a draft with unknown amounts and preserves a multiword deduction reason', async () => {
    const request = vi.fn((document: unknown, _variables?: SaveVariables) => {
      if (document === periodInputQuery) return Promise.resolve({ payrollPeriodInput: null });
      if (document === savePeriodInputMutation)
        return Promise.resolve({
          savePayrollPeriodInput: {
            id: 'period',
            input: newPeriodInput(2026, 10),
            revision: 1,
            ready: false,
            validationError: 'Missing financial inputs.',
          },
        });
      return Promise.resolve({
        payrollApprovedLwpReview: { hash: null, days: '0', source_days: [] },
      });
    });
    render(
      <PeriodEditor client={clientWith(request)} employeeId="fictional" year={2026} month={10} />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Create monthly draft' }));
    expect(screen.getByLabelText('Monthly fixed gross').getAttribute('value')).toBe('');
    fireEvent.change(screen.getByLabelText('New deduction code'), {
      target: { value: 'RECOVERY' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add deduction' }));
    fireEvent.change(screen.getByLabelText('RECOVERY amount'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('RECOVERY reason'), {
      target: { value: 'Loan repayment ' },
    });
    expect(screen.getByLabelText('RECOVERY reason').getAttribute('value')).toBe('Loan repayment ');
    fireEvent.click(screen.getByRole('button', { name: 'Validate and save' }));
    await screen.findByText(/Saved as a draft/);
    const save = request.mock.calls.find(([document]) => document === savePeriodInputMutation);
    expect(save).toBeTruthy();
    expect(save?.[1]?.expectedRevision).toBeNull();
    expect(save?.[1]?.input.fixed_gross).toBeNull();
    expect(save?.[1]?.input.additional_deductions).toEqual([
      {
        code: 'RECOVERY',
        amount: '100',
        reason: 'Loan repayment ',
        origin: 'HR_CONFIGURATION',
      },
    ]);
  });
  it('binds approved dated LWP review to the monthly total without changing that total', async () => {
    const draft = { ...newPeriodInput(2026, 10), lwp_days: '2' };
    const request = vi.fn((document: unknown, _variables?: SaveVariables) => {
      if (document === periodInputQuery)
        return Promise.resolve({
          payrollPeriodInput: { id: 'period', input: draft, revision: 1, ready: false },
        });
      if (document === savePeriodInputMutation)
        return Promise.resolve({
          savePayrollPeriodInput: { id: 'period', input: draft, revision: 2, ready: true },
        });
      return Promise.resolve({
        payrollApprovedLwpReview: {
          hash: 'reviewed-hash',
          days: '1',
          source_days: [{ date: '2026-10-01', days: '1' }],
        },
      });
    });
    render(
      <PeriodEditor client={clientWith(request)} employeeId="fictional" year={2026} month={10} />
    );
    fireEvent.click(
      await screen.findByLabelText(
        'These approved dates are included in the monthly LWP total above.'
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate and save' }));
    await waitFor(() => {
      const save = request.mock.calls.find(([document]) => document === savePeriodInputMutation);
      expect(save?.[1]?.expectedRevision).toBe(1);
      expect(save?.[1]?.input.approved_lwp_review_hash).toBe('reviewed-hash');
      expect(save?.[1]?.input.lwp_days).toBe('2');
    });
  });
});
