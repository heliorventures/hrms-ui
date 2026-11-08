import { PublishLoanPolicyDocument, RetireLoanPolicyDocument } from '../../api/loans/graphql';

import {
  choices,
  yesNo,
  type LoanEditorDefinition,
  type LoanField,
  type LoanValues,
} from './loanForm';
import type { LoanPolicy } from './loanTypes';
import { policyValues } from './policyValues';

const field = (key: string, label: string, type: LoanField['type'] = 'text'): LoanField => ({
  key,
  label,
  type,
});
const select = (key: string, label: string, values: readonly string[]): LoanField => ({
  key,
  label,
  options: choices(values),
});
const permission = (key: string, label: string): LoanField => ({ key, label, options: yesNo });
const multi = (key: string, label: string, values: readonly string[]): LoanField => ({
  key,
  label,
  type: 'multi',
  options: choices(values).slice(1),
});
const policyFields: LoanField[] = [
  field('key', 'Policy name / key'),
  field('currency', 'Currency code'),
  field('minorUnits', 'Currency decimal places', 'integer'),
  field('effectiveFrom', 'Effective from', 'date'),
  { ...field('effectiveTo', 'Effective to', 'date'), optional: true },
  field('employmentTypes', 'Eligible employment types (comma separated)'),
  field('minimumServiceDays', 'Minimum service days', 'integer'),
  field('perLoan', 'Maximum per loan', 'decimal'),
  field('perEmployee', 'Maximum per employee', 'decimal'),
  field('perCompany', 'Maximum company exposure', 'decimal'),
  multi('methods', 'Allowed interest methods', [
    'InterestFree',
    'OneTimePercentage',
    'OneTimeFixed',
    'ReducingBalance',
  ]),
  field('maximumRate', 'Maximum rate (%)', 'decimal'),
  field('maximumFixedCharge', 'Maximum fixed charge', 'decimal'),
  multi('modes', 'Allowed repayment methods', ['Payroll', 'External', 'Mixed']),
  select('priority', 'Recovery priority', [
    'OldestApprovedFirst',
    'NewestApprovedFirst',
    'LowestBalanceFirst',
    'HighestBalanceFirst',
  ]),
  field('minimumMonthlyAmount', 'Minimum monthly repayment', 'decimal'),
  field('maxInstalments', 'Maximum instalments', 'integer'),
  field('minimumNetPay', 'Protected minimum net pay', 'decimal'),
  field('maximumNetPayPercentage', 'Maximum net pay deduction (%)', 'decimal'),
  permission('allowResidual', 'Allow residual after schedule'),
  permission('allowOverrides', 'Allow monthly overrides'),
  permission('allowSkips', 'Allow skipped repayments'),
  permission('allowAccrualPause', 'Allow interest pauses'),
  select('shortSalary', 'When salary is insufficient', ['Block', 'CapAndCarry']),
  select('allocation', 'Repayment allocation', ['InterestFirst', 'PrincipalFirst']),
  select('excessCredit', 'Excess repayment', ['Reject', 'HoldForReview']),
  select('earlySettlement', 'Previously assessed charge at early settlement', [
    'KeepAssessedCharge',
  ]),
  permission('allowFnf', 'Allow final settlement recovery'),
  permission('allowContinuing', 'Allow repayments after exit'),
  field('exitReviewReference', 'Exit recovery policy approval reference'),
  field('jurisdiction', 'Tax jurisdiction'),
  field('taxReviewReference', 'Tax policy review reference'),
  permission('externalAssessmentRequired', 'Require external tax assessment'),
  field('workflowId', 'Loan approval workflow name'),
  permission('acknowledgementRequired', 'Require employee acknowledgement'),
];
function rules(v: LoanValues) {
  return {
    eligibility: {
      employmentTypes: v.employmentTypes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      minimumServiceDays: Number(v.minimumServiceDays),
    },
    exposure: { perLoan: v.perLoan, perEmployee: v.perEmployee, perCompany: v.perCompany },
    interest: {
      methods: v.methods.split(','),
      maximumRate: v.maximumRate,
      maximumFixedCharge: v.maximumFixedCharge,
    },
    recovery: {
      modes: v.modes.split(','),
      priority: v.priority,
      minimumMonthlyAmount: v.minimumMonthlyAmount,
      maxInstalments: Number(v.maxInstalments),
      allowResidual: v.allowResidual === 'yes',
      allowOverrides: v.allowOverrides === 'yes',
      allowSkips: v.allowSkips === 'yes',
      allowAccrualPause: v.allowAccrualPause === 'yes',
      minimumNetPay: v.minimumNetPay,
      maximumNetPayPercentage: v.maximumNetPayPercentage,
    },
    shortSalary: v.shortSalary,
    allocation: v.allocation,
    excessCredit: v.excessCredit,
    earlySettlement: v.earlySettlement,
    exitRecovery: {
      allowFnf: v.allowFnf === 'yes',
      allowContinuing: v.allowContinuing === 'yes',
      reviewReference: v.exitReviewReference,
    },
    taxTreatment: {
      jurisdiction: v.jurisdiction,
      reviewReference: v.taxReviewReference,
      externalAssessmentRequired: v.externalAssessmentRequired === 'yes',
    },
    approval: {
      workflowId: v.workflowId,
      acknowledgementRequired: v.acknowledgementRequired === 'yes',
    },
  };
}
export function policyEditor(
  workflows: { id: string; name: string }[],
  previous?: LoanPolicy
): LoanEditorDefinition {
  return {
    title: 'Publish a company loan policy',
    description:
      'Enter reviewed company policy values. Publishing creates an immutable version; existing loans retain their approved version. Retire an overlapping active policy before publishing its replacement.',
    fields: policyFields.map((item) =>
      item.key === 'workflowId'
        ? {
            ...item,
            label: 'Approval workflow',
            options: [
              { value: '', label: 'Choose a workflow' },
              ...workflows.map((workflow) => ({ value: workflow.id, label: workflow.name })),
            ],
          }
        : { ...item, readOnly: Boolean(previous && item.key === 'key') }
    ),
    values: policyValues(previous),
    document: PublishLoanPolicyDocument,
    version: previous?.version ?? 1,
    build: (values) => ({
      key: values.key,
      currency: values.currency,
      minorUnits: Number(values.minorUnits),
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo || null,
      rules: rules(values),
    }),
  };
}
export function retireEditor(policy: LoanPolicy): LoanEditorDefinition {
  return {
    title: 'Retire loan policy',
    description: `${policy.key} v${policy.version}. Existing loan terms remain in force.`,
    fields: [field('reason', 'Retirement reason', 'textarea')],
    values: {},
    document: RetireLoanPolicyDocument,
    version: policy.version,
    build: (values) => ({ policyId: policy.id, reason: values.reason }),
  };
}
