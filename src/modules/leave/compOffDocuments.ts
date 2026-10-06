export {
  CancellableCompOffLeaveDocument as ApprovedCompOffLeavesDocument,
  CancelApprovedCompOffDocument as CancelApprovedCompOffLeaveDocument,
  MyCompOffSummaryDocument as MyCompOffDocument,
  RequestCompOffCreditDocument as SubmitCompOffDocument,
  WithdrawCompOffCreditClaimDocument as CancelCompOffDocument,
  PendingCompOffCreditsDocument as CompOffApprovalDocument,
  ReviewCompOffCreditDocument as DecideCompOffDocument,
  CompanyCompOffPoliciesDocument as CompOffSettingsDocument,
  SaveCompanyCompOffPolicyDocument as SaveCompOffPolicyDocument,
} from '../../api/graphql/graphql';
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
