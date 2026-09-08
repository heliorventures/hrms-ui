export interface CompOffPolicy {
  id: string;
  designationId: string | null;
  employeeId: string | null;
  leaveTypeId: string;
  enabled: boolean;
  validityDays: number;
  claimDeadlineDays: number;
  monthlyEarningLimit: string | null;
  yearlyEarningLimit: string | null;
  maxUnusedBalance: string | null;
  allowApprovedLeaveCancellation: boolean;
}
export interface CompOffClaim {
  id: string;
  employeeId: string;
  employeeName: string | null;
  employeeCode: string | null;
  workedDate: string;
  units: string;
  status: string;
  reason: string | null;
  rejectionReason: string | null;
}
export interface CompOffSummary {
  compOffPolicy: CompOffPolicy | null;
  compOffBalance: {
    earnedUnits: string;
    reservedUnits: string;
    usedUnits: string;
    expiredUnits: string;
    availableUnits: string;
  };
  compOffClaims: CompOffClaim[];
}
export interface ApprovedCompOffLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  fromDate: string;
  toDate: string;
  daysRequested: string;
}
export const ApprovedCompOffLeavesDocument = `query CancellableCompOffLeave($offset: Int!) {
  approvedCompOffLeaves(limit: 20, offset: $offset) { id employeeId employeeName employeeCode fromDate toDate daysRequested }
}`;
export const CancelApprovedCompOffLeaveDocument = `mutation CancelApprovedCompOff($leaveRequestId: ID!) {
  cancelApprovedCompOffLeave(leaveRequestId: $leaveRequestId) { id status }
}`;
export const MyCompOffDocument = `query MyCompOffSummary($offset: Int!) {
  compOffPolicy { id enabled validityDays claimDeadlineDays }
  compOffBalance { earnedUnits reservedUnits usedUnits expiredUnits availableUnits }
  compOffClaims(mine: true, limit: 20, offset: $offset) { id workedDate units status reason rejectionReason }
}`;
export const SubmitCompOffDocument = `mutation RequestCompOffCredit($input: SubmitCompOffClaimInput!) {
  submitCompOffClaim(input: $input) { id status }
}`;
export const CancelCompOffDocument = `mutation WithdrawCompOffCreditClaim($claimId: ID!) {
  cancelCompOffClaim(claimId: $claimId) { id status }
}`;
export const CompOffApprovalDocument = `query PendingCompOffCredits($offset: Int!) {
  compOffClaims(status: "PENDING", forApproval: true, limit: 20, offset: $offset) { id employeeId employeeName employeeCode workedDate units status reason rejectionReason }
}`;
export const DecideCompOffDocument = `mutation ReviewCompOffCredit($claimId: ID!, $approve: Boolean!, $reason: String) {
  decideCompOffClaim(claimId: $claimId, approve: $approve, reason: $reason) { id status }
}`;
export const CompOffSettingsDocument = `query CompanyCompOffPolicies {
  compOffPolicyTargets { employees { id employeeCode fullName } designations { id title } }
  compOffPolicies { id designationId employeeId leaveTypeId enabled validityDays claimDeadlineDays monthlyEarningLimit yearlyEarningLimit maxUnusedBalance allowApprovedLeaveCancellation }
}`;
export const SaveCompOffPolicyDocument = `mutation SaveCompanyCompOffPolicy($input: UpsertCompOffPolicyInput!) {
  upsertCompOffPolicy(input: $input) { id enabled }
}`;
