import type {
  PayslipUnpaidLeaveQuery,
  PayrollUnpaidLeavePolicyQuery,
} from '../../api/graphql/graphql';

export interface UnpaidLeavePolicy {
  enabled: boolean;
  basicComponentCode: string | null;
  dayDivisor: string | null;
  treatment: 'BEFORE_STATUTORY' | 'AFTER_STATUTORY' | null;
}

export type UnpaidLeaveSnapshot = NonNullable<PayslipUnpaidLeaveQuery['payslipUnpaidLeave']>;

export const decodeUnpaidLeavePolicy = (
  value: PayrollUnpaidLeavePolicyQuery['payrollUnpaidLeavePolicy']
): UnpaidLeavePolicy => {
  const treatment = value?.treatment ?? null;
  if (treatment !== null && treatment !== 'BEFORE_STATUTORY' && treatment !== 'AFTER_STATUTORY')
    throw new Error('Unpaid leave treatment is invalid.');
  return {
    enabled: value?.enabled ?? false,
    basicComponentCode: value?.basicComponentCode ?? null,
    dayDivisor: value?.dayDivisor ?? null,
    treatment,
  };
};

export {
  PayrollUnpaidLeavePolicyDocument as UnpaidLeavePolicyDocument,
  SavePayrollUnpaidLeavePolicyDocument as SaveUnpaidLeavePolicyDocument,
  PayslipUnpaidLeaveDocument,
} from '../../api/graphql/graphql';
