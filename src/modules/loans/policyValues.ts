import type { LoanValues } from './loanForm';
import type { LoanPolicy } from './loanTypes';

function at(value: unknown, path: string[]): unknown {
  let result = value;
  for (const key of path) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) return undefined;
    result = Object.getOwnPropertyDescriptor(result, key)?.value as unknown;
  }
  return result;
}
function text(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === 'string').join(',');
  return '';
}
const groups: Record<string, string[]> = {
  eligibility: ['employmentTypes', 'minimumServiceDays'],
  exposure: ['perLoan', 'perEmployee', 'perCompany'],
  interest: ['methods', 'maximumRate', 'maximumFixedCharge'],
  recovery: [
    'modes',
    'priority',
    'minimumMonthlyAmount',
    'maxInstalments',
    'minimumNetPay',
    'maximumNetPayPercentage',
    'allowResidual',
    'allowOverrides',
    'allowSkips',
    'allowAccrualPause',
  ],
  exitRecovery: ['allowFnf', 'allowContinuing'],
  taxTreatment: ['jurisdiction', 'externalAssessmentRequired'],
  approval: ['workflowId', 'acknowledgementRequired'],
};
export function policyValues(policy?: LoanPolicy): LoanValues {
  if (!policy) return {};
  const values: LoanValues = {
    key: policy.key,
    currency: policy.currency,
    minorUnits: String(policy.minorUnits),
  };
  for (const [group, keys] of Object.entries(groups)) {
    for (const key of keys) values[key] = text(at(policy.rules, [group, key]));
  }
  for (const key of ['shortSalary', 'allocation', 'excessCredit', 'earlySettlement'])
    values[key] = text(at(policy.rules, [key]));
  values.exitReviewReference = text(at(policy.rules, ['exitRecovery', 'reviewReference']));
  values.taxReviewReference = text(at(policy.rules, ['taxTreatment', 'reviewReference']));
  return values;
}
