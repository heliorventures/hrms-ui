import {
  DecideLoanRequestDocument,
  LoanRequestDecision,
  PreviewLoanApprovalDocument,
} from '../../api/loans/graphql';

import { choices, yesNo, type LoanEditorDefinition, type LoanValues } from './loanForm';
import type { LoanPolicy, LoanRequest } from './loanTypes';
import { requestDecisionEditor } from './requestDecisionEditor';
import { validateLoanInterest } from './validateLoanInterest';

function interest(values: LoanValues) {
  const methods: Record<string, unknown> = {
    InterestFree: 'InterestFree',
    OneTimePercentage: { OneTimePercentage: { rate: values.rate } },
    OneTimeFixed: {
      OneTimeFixed: { amount: values.fixedCharge, approvedPrincipal: values.principal },
    },
    ReducingBalance: {
      ReducingBalance: {
        annualRate: values.rate,
        convention:
          values.convention === 'Act365Fixed'
            ? 'Act365Fixed'
            : { Monthly: { partialPeriod: values.partialPeriod } },
      },
    },
  };
  return methods[values.interest];
}
export function approvalEditor(
  request: LoanRequest,
  policy: LoanPolicy | null,
  decision: LoanRequestDecision
): LoanEditorDefinition {
  if (decision !== LoanRequestDecision.Approve || !request.isFinalApprovalStep)
    return requestDecisionEditor(request, decision);
  if (!policy) throw new Error('The requested policy could not be loaded. Refresh the request.');
  const common = [{ key: 'reason', label: 'Decision reason', type: 'textarea' as const }];
  return {
    title: 'Review and approve loan request',
    description: `${request.employeeName} · ${request.purpose} · ${request.currency} ${request.requestedAmount}. Policy ${policy.key} v${policy.version}.`,
    document: DecideLoanRequestDocument,
    version: request.version,
    values: {},
    fields: [
      { key: 'principal', label: 'Approved principal', type: 'decimal' },
      {
        key: 'interest',
        label: 'Interest method',
        options: choices(['InterestFree', 'OneTimePercentage', 'OneTimeFixed', 'ReducingBalance']),
      },
      {
        key: 'rate',
        label: 'Rate (%) for percentage or reducing interest',
        type: 'decimal',
        optional: true,
      },
      { key: 'fixedCharge', label: 'Fixed interest charge', type: 'decimal', optional: true },
      {
        key: 'convention',
        label: 'Reducing interest basis',
        optional: true,
        options: choices(['Act365Fixed', 'Monthly']),
      },
      {
        key: 'partialPeriod',
        label: 'Monthly partial period treatment',
        optional: true,
        options: choices(['Reject', 'ProrateActualDays']),
      },
      { key: 'monthlyAmount', label: 'Monthly repayment amount', type: 'decimal' },
      { key: 'maxInstalments', label: 'Maximum instalments', type: 'integer' },
      { key: 'allowResidual', label: 'Allow residual after the schedule', options: yesNo },
      {
        key: 'recovery',
        label: 'Repayment method',
        options: choices(['Payroll', 'External', 'Mixed']),
      },
      { key: 'rounding', label: 'Rounding', options: choices(['HalfUp', 'HalfEven']) },
      {
        key: 'allocation',
        label: 'Repayment allocation',
        options: choices(['InterestFirst', 'PrincipalFirst']),
      },
      { key: 'effectiveFrom', label: 'Terms effective from', type: 'date' },
      { key: 'firstDueDate', label: 'First repayment due date', type: 'date' },
      { key: 'agreementReference', label: 'Employee agreement reference' },
      ...common,
    ],
    validate: validateLoanInterest,
    preview: async (values, client) => {
      const result = await client.request(PreviewLoanApprovalDocument, {
        requestId: request.id,
        terms: approvalTerms(values, policy),
        effectiveFrom: values.effectiveFrom,
        firstDueDate: values.firstDueDate,
      });
      return result.previewLoanApproval;
    },
    build: (values) => ({
      requestId: request.id,
      stepId: request.currentStepId,
      decision,
      reason: values.reason,
      ...{
        effectiveFrom: values.effectiveFrom,
        firstDueDate: values.firstDueDate,
        agreementReference: values.agreementReference,
        terms: approvalTerms(values, policy),
      },
    }),
  };
}

function approvalTerms(values: LoanValues, policy: LoanPolicy) {
  return {
    currency: { code: policy.currency, minorUnits: policy.minorUnits },
    approvedPrincipal: values.principal,
    interest: interest(values),
    rounding: values.rounding,
    allocation: values.allocation,
    recovery: values.recovery,
    monthlyAmount: values.monthlyAmount,
    maxInstalments: Number(values.maxInstalments),
    allowResidual: values.allowResidual === 'yes',
    calculatorVersion: 'loans-v1',
  };
}
