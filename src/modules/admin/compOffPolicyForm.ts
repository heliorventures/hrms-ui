import type { EmployeePickRow } from '../../components/common/EmployeeSearchSelect';
import type { CompOffPolicy } from '../leave/compOffDocuments';

export interface CompOffSettings {
  compOffPolicies: CompOffPolicy[];
  compOffPolicyTargets: {
    employees: EmployeePickRow[];
    designations: { id: string; title: string }[];
  };
}
export interface CompOffPolicyForm {
  id: string;
  scope: 'TENANT' | 'DESIGNATION' | 'EMPLOYEE';
  scopeId: string;
  enabled: boolean;
  validityDays: string;
  claimDeadlineDays: string;
  monthly: string;
  yearly: string;
  unused: string;
  allowCancel: boolean;
}
export const emptyCompOffPolicy: CompOffPolicyForm = {
  id: '',
  scope: 'TENANT',
  scopeId: '',
  enabled: false,
  validityDays: '',
  claimDeadlineDays: '',
  monthly: '',
  yearly: '',
  unused: '',
  allowCancel: false,
};
const scopeForPolicy = (policy: CompOffPolicy): CompOffPolicyForm['scope'] => {
  if (policy.employeeId) return 'EMPLOYEE';
  if (policy.designationId) return 'DESIGNATION';
  return 'TENANT';
};
export const formFromCompOffPolicy = (policy: CompOffPolicy): CompOffPolicyForm => ({
  id: policy.id,
  scope: scopeForPolicy(policy),
  scopeId: policy.employeeId ?? policy.designationId ?? '',
  enabled: policy.enabled,
  validityDays: String(policy.validityDays),
  claimDeadlineDays: String(policy.claimDeadlineDays),
  monthly: policy.monthlyEarningLimit ?? '',
  yearly: policy.yearlyEarningLimit ?? '',
  unused: policy.maxUnusedBalance ?? '',
  allowCancel: policy.allowApprovedLeaveCancellation,
});
export const compOffPolicyInput = (form: CompOffPolicyForm) => ({
  id: form.id || null,
  employeeId: form.scope === 'EMPLOYEE' ? form.scopeId : null,
  designationId: form.scope === 'DESIGNATION' ? form.scopeId : null,
  enabled: form.enabled,
  validityDays: Number(form.validityDays),
  claimDeadlineDays: Number(form.claimDeadlineDays),
  monthlyEarningLimit: form.monthly || null,
  yearlyEarningLimit: form.yearly || null,
  maxUnusedBalance: form.unused || null,
  allowApprovedLeaveCancellation: form.allowCancel,
});
export function compOffPolicyLabel(
  policy: CompOffPolicy,
  targets: CompOffSettings['compOffPolicyTargets']
) {
  if (policy.employeeId)
    return (
      targets.employees.find((employee) => employee.id === policy.employeeId)?.fullName ??
      'Unavailable employee'
    );
  if (policy.designationId)
    return (
      targets.designations.find((designation) => designation.id === policy.designationId)?.title ??
      'Unavailable designation'
    );
  return 'Company default';
}
