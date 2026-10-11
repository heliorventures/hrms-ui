// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoanRequestDecision } from '../../api/loans/graphql';

import { approvalEditor } from './approvalEditor';
import type { LoanPolicy, LoanRequest } from './loanTypes';
import MyLoansPage from './MyLoansPage';

const request = {
  id: 'request-1',
  employeeId: 'employee-1',
  employeeName: 'Asha Rao',
  employeeCode: 'E001',
  policyId: 'policy-1',
  preferences: {},
  createdAt: '2026-10-11T00:00:00Z',
  requestedAmount: '1000',
  currency: 'INR',
  purpose: 'Education',
  employeeNotes: null,
  state: 'UNDER_REVIEW',
  version: 2,
  workflowInstanceId: 'workflow-1',
  currentStepId: 'step-1',
  isFinalApprovalStep: false,
  decisionReason: null,
} satisfies LoanRequest;
const rows = vi.hoisted(() => ({ requests: [] as LoanRequest[] }));
vi.mock('./useLoanAccess', () => ({
  useLoanAccess: () => ({
    ownerKey: 'self',
    permissions: { canScopedPermission: () => true },
  }),
}));
vi.mock('./useLoanSelection', () => ({ useLoanSelection: () => [null, vi.fn()] }));
vi.mock('./useLoanPage', () => ({
  useLoanPage: (_document: unknown, field: string) => ({
    data: {
      nodes: field === 'myLoanRequests' ? rows.requests : [],
      pageInfo: { hasNextPage: false },
    },
    phase: 'ready',
    error: null,
    page: 1,
    refreshChecked: vi.fn(),
  }),
}));
vi.mock('./useLoanOptions', () => ({
  useLoanOptions: () => ({
    data: { nodes: [] },
    phase: 'ready',
    error: null,
  }),
}));
const policy: LoanPolicy = {
  id: 'policy-1',
  key: 'standard',
  version: 1,
  currency: 'INR',
  minorUnits: 2,
  effectiveFrom: '2026-01-01',
  effectiveTo: null,
  rules: {},
};
afterEach(() => {
  cleanup();
  rows.requests = [];
});

describe('loan request workflow', () => {
  it('sends only a decision reason at an intermediate approval stage without needing policy terms', () => {
    const editor = approvalEditor(request, null, LoanRequestDecision.Approve);
    expect(editor.title).toBe('Approve loan request step');
    expect(editor.fields.map((field) => field.key)).toEqual(['reason']);
    expect(editor.preview).toBeUndefined();
    expect(editor.build({ reason: 'Proceed to finance', principal: '999' })).toEqual({
      requestId: request.id,
      stepId: request.currentStepId,
      decision: LoanRequestDecision.Approve,
      reason: 'Proceed to finance',
    });
  });
  it('requires and submits financial terms at the final approval stage', () => {
    const final = { ...request, isFinalApprovalStep: true };
    expect(() => approvalEditor(final, null, LoanRequestDecision.Approve)).toThrow('policy');
    const editor = approvalEditor(final, policy, LoanRequestDecision.Approve);
    expect(editor.preview).toBeTypeOf('function');
    expect(
      editor.build({
        principal: '1000',
        interest: 'InterestFree',
        monthlyAmount: '100',
        maxInstalments: '10',
        allowResidual: 'no',
        recovery: 'Payroll',
        rounding: 'HalfUp',
        allocation: 'InterestFirst',
        effectiveFrom: '2026-10-11',
        firstDueDate: '2026-11-01',
        agreementReference: 'AG-1',
        reason: 'Agreed',
      })
    ).toMatchObject({
      terms: { approvedPrincipal: '1000', monthlyAmount: '100', maxInstalments: 10 },
      effectiveFrom: '2026-10-11',
      firstDueDate: '2026-11-01',
      agreementReference: 'AG-1',
      reason: 'Agreed',
    });
  });
  it('shows the employee the returned decision reason beside the request', () => {
    rows.requests = [
      { ...request, state: 'RETURNED', decisionReason: 'Please attach the fee receipt.' },
    ];
    render(<MyLoansPage />);
    expect(screen.getByText('Please attach the fee receipt.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit and submit' })).toBeTruthy();
  });
  it('allows an employee to withdraw a request that has progressed to UNDER_REVIEW', () => {
    rows.requests = [request];
    render(<MyLoansPage />);
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit and submit' })).toBeNull();
  });
  it('does not offer withdrawal after final approval', () => {
    rows.requests = [{ ...request, state: 'APPROVED', currentStepId: null }];
    render(<MyLoansPage />);
    expect(screen.queryByRole('button', { name: 'Withdraw' })).toBeNull();
  });
});
