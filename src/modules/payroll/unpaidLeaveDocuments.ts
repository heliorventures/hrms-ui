export interface UnpaidLeavePolicy {
  enabled: boolean;
  basicComponentCode: string | null;
  dayDivisor: string | null;
  treatment: 'BEFORE_STATUTORY' | 'AFTER_STATUTORY' | null;
}

export interface UnpaidLeaveSnapshot {
  basicComponentCode: string;
  basicAmount: string;
  dayDivisor: string;
  unpaidDays: string;
  amount: string;
  treatment: string;
}

export const UnpaidLeavePolicyDocument = `query PayrollUnpaidLeavePolicy {
  payrollUnpaidLeavePolicy { enabled basicComponentCode dayDivisor treatment }
}`;

export const SaveUnpaidLeavePolicyDocument = `mutation SavePayrollUnpaidLeavePolicy($input: SavePayrollUnpaidLeavePolicyInput!) {
  savePayrollUnpaidLeavePolicy(input: $input) { enabled basicComponentCode dayDivisor treatment }
}`;

export const PayslipUnpaidLeaveDocument = `query PayslipUnpaidLeave($payslipId: ID!) {
  payslipUnpaidLeave(payslipId: $payslipId) { basicComponentCode basicAmount dayDivisor unpaidDays amount treatment }
}`;
