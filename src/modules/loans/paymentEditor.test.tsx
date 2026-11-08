// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Kind, type DocumentNode, type OperationDefinitionNode } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LoanEditor from './LoanEditor';
import { validateLoanFields, type LoanEditorDefinition } from './loanForm';
import type { LoanAccount } from './loanTypes';
import { deductionEditor, overrideEditor } from './paymentEditor';

const request = vi.hoisted(() => vi.fn<unknown[], Promise<unknown>>());
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));
const account: LoanAccount = {
  id: 'loan-1',
  employeeId: 'employee-1',
  employeeName: 'Employee',
  employeeCode: 'E1',
  requestId: 'request-1',
  loanNumber: 'LN-001',
  purpose: 'Education',
  approvedPrincipal: '10000',
  currency: 'INR',
  minorUnits: 2,
  state: 'ACTIVE',
  fundingState: 'FUNDED',
  version: 7,
  principal: '10000',
  interest: '0',
  outstanding: '10000',
  disbursed: '10000',
  repaid: '0',
  unappliedCredit: '0',
  terms: {},
};
const overrideValues = {
  action: 'AMOUNT',
  periodStart: '2026-11-01',
  amount: '500',
  pauseInterest: 'no',
  reason: 'Agreement',
};
const deductionValues = {
  effectiveFrom: '2026-11-01',
  firstDueDate: '2026-11-30',
  amount: '500',
  recovery: 'PAYROLL',
  reason: 'Agreement',
};
const projection = {
  basis: 'CURRENT_BALANCES',
  currency: { code: 'INR', minorUnits: 2 },
  schedule: {
    items: [
      {
        dueDate: '2026-11-30',
        principal: '490',
        interest: '10',
        total: '500',
        principalAfter: '9510',
        interestAfter: '0',
      },
    ],
    residualPrincipal: '9510',
    residualInterest: '0',
    carry: '0',
  },
};
function issue(definition: LoanEditorDefinition, values: Record<string, string>) {
  return validateLoanFields(definition.fields, values) ?? definition.validate?.(values);
}
function open(definition: LoanEditorDefinition, values: Record<string, string>) {
  render(
    <LoanEditor
      definition={{ ...definition, values }}
      onClose={vi.fn()}
      onSaved={vi.fn(async () => {})}
    />
  );
}
function operation(call: unknown[]) {
  return (call[0] as DocumentNode).definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION
  );
}
afterEach(() => {
  cleanup();
  request.mockReset();
});

describe('Loan period recovery choice', () => {
  it.each(['', '0', '0.00'])('requires a positive explicit amount, rejecting %j', (amount) => {
    expect(issue(overrideEditor(account), { ...overrideValues, amount })).toBeTruthy();
  });
  it('requires a deliberate skip choice and sends null even if an old amount remains', () => {
    const definition = overrideEditor(account);
    expect(issue(definition, { ...overrideValues, action: '' })).toBeTruthy();
    expect(definition.build({ ...overrideValues, action: 'SKIP' })).toEqual({
      loanId: 'loan-1',
      periodStart: '2026-11-01',
      amount: null,
      pauseInterest: false,
      reason: 'Agreement',
    });
  });
  it('hides the amount for skip and ignores a stale invalid amount', () => {
    const values = { ...overrideValues, action: 'SKIP', amount: 'invalid' };
    const definition = overrideEditor(account);
    open(definition, values);
    expect(screen.queryByLabelText('Recovery amount for this period')).toBeNull();
    expect(issue(definition, values)).toBeFalsy();
    fireEvent.change(screen.getByLabelText('Period action'), { target: { value: 'AMOUNT' } });
    expect(screen.getByLabelText('Recovery amount for this period')).toBeTruthy();
  });
});

describe('Proposed loan change previews', () => {
  it.each([
    ['deduction', deductionEditor, deductionValues, 'previewLoanDeduction', 'PreviewLoanDeduction'],
    [
      'override',
      overrideEditor,
      overrideValues,
      'previewLoanPeriodOverride',
      'PreviewLoanPeriodOverride',
    ],
  ] as const)(
    'requires a read-only %s preview and refreshes it after edits',
    async (_, factory, values, responseKey, queryName) => {
      request.mockResolvedValue({ [responseKey]: projection });
      open(factory(account), values);
      fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
      await screen.findByRole('button', { name: 'Confirm and save' });
      expect(request).toHaveBeenCalledTimes(1);
      expect(operation(request.mock.calls[0])).toMatchObject({
        operation: 'query',
        name: { value: queryName },
      });
      expect(request.mock.calls[0][1]).toMatchObject({
        input: { loanId: 'loan-1', amount: '500', meta: { expectedVersion: 7 } },
      });
      expect(screen.getByRole('table', { name: 'Projected loan repayments' })).toBeTruthy();
      expect(screen.getByText('2026-11-30')).toBeTruthy();
      expect(
        screen.getByText(/Residual after this schedule: principal 9510, interest 0/)
      ).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Edit values' }));
      expect(screen.queryByRole('button', { name: 'Confirm and save' })).toBeNull();
      fireEvent.change(
        screen.getByLabelText(
          factory === deductionEditor ? 'Monthly amount' : 'Recovery amount for this period'
        ),
        { target: { value: '750' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
      await screen.findByRole('button', { name: 'Confirm and save' });
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][1]).toMatchObject({
        input: { amount: '750', meta: { expectedVersion: 7 } },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and save' }));
      await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
      expect(operation(request.mock.calls[2])?.operation).toBe('mutation');
      expect(request.mock.calls[2][1]).toMatchObject({
        input: { amount: '750', meta: { expectedVersion: 7 } },
      });
    }
  );
  it('does not allow confirmation when the preview rejects a stale account version', async () => {
    request.mockRejectedValue(new Error('Loan account changed. Refresh and retry.'));
    open(deductionEditor(account), deductionValues);
    fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Confirm and save' })).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
