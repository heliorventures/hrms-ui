import {
  SaveLoanRequestDocument,
  SubmitLoanRequestDocument,
  WithdrawLoanRequestDocument,
} from '../../api/loans/graphql';

import { choices, type LoanEditorDefinition, type LoanValues } from './loanForm';
import type { LoanPolicy, LoanRequest } from './loanTypes';

const preferences = (request?: LoanRequest): LoanValues => {
  const value = request?.preferences;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
};
export function requestEditor(
  policies: LoanPolicy[],
  draft: boolean,
  request?: LoanRequest
): LoanEditorDefinition {
  return {
    title: draft ? 'Save loan request draft' : 'Request a loan',
    description:
      'Select the company policy and share your repayment preference. HR confirms the approved terms. Approval does not record a disbursement.',
    document: draft ? SaveLoanRequestDocument : SubmitLoanRequestDocument,
    version: request?.version ?? 1,
    values: {
      policyId: request?.policyId ?? '',
      amount: request?.requestedAmount ?? '',
      purpose: request?.purpose ?? '',
      notes: request?.employeeNotes ?? '',
      ...preferences(request),
    },
    fields: [
      {
        key: 'policyId',
        label: 'Company policy',
        options: [
          { value: '', label: 'Choose a policy' },
          ...policies.map((policy) => ({
            value: policy.id,
            label: `${policy.key} · v${policy.version} · ${policy.currency}`,
          })),
        ],
      },
      { key: 'amount', label: 'Requested amount', type: 'decimal' },
      { key: 'purpose', label: 'Purpose' },
      {
        key: 'recovery',
        label: 'Preferred repayment method',
        options: choices(['Payroll', 'External', 'Mixed']),
      },
      { key: 'monthlyAmount', label: 'Preferred monthly amount', type: 'decimal', optional: true },
      { key: 'notes', label: 'Employee notes', type: 'textarea', optional: true },
    ],
    build: (values) => ({
      requestId: request?.id ?? null,
      policyId: values.policyId,
      amount: values.amount,
      purpose: values.purpose.trim(),
      notes: values.notes.trim() || null,
      preferences: { recovery: values.recovery, monthlyAmount: values.monthlyAmount },
    }),
  };
}
export function withdrawEditor(request: LoanRequest): LoanEditorDefinition {
  return {
    title: 'Withdraw loan request',
    description: 'Record why this request is being withdrawn.',
    document: WithdrawLoanRequestDocument,
    version: request.version,
    values: { reason: '' },
    fields: [{ key: 'reason', label: 'Reason', type: 'textarea' }],
    build: (values) => ({ requestId: request.id, reason: values.reason.trim() }),
  };
}
