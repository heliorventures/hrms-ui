import type { ExpenseSubmissionHintsQuery } from '../../api/graphql/graphql';

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  code: string;
  maxAmountPerClaim?: string | null;
}

export interface ExpenseRow {
  id: string;
  employeeId: string;
  expenseCategoryId: string;
  travelRequestId?: string | null;
  workflowInstanceId?: string | null;
  amount: string;
  currency: string;
  expenseDate: string;
  title: string;
  status: string;
  pendingApprovalStage?: string | null;
  viewerMayApprove: boolean;
  submittedAt: string;
  approvedAmount?: string | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
  receiptFileStorageId?: string | null;
}

export interface TravelRequestRow {
  id: string;
  employeeId: string;
  originLocation?: string | null;
  destinationLocation?: string | null;
  fromDate: string;
  toDate: string;
  purpose: string;
  estimatedAmount?: string | null;
  currency: string;
  status: string;
  pendingApprovalStage?: string | null;
  viewerMayApprove: boolean;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  submittedAt: string;
  workflowInstanceId?: string | null;
}

export interface ExpenseBoardData {
  expenseCategories: ExpenseCategoryRow[];
  expenses: ExpenseRow[];
  travelRequests: TravelRequestRow[];
}

export type ExpenseNotice = {
  variant: 'error' | 'info' | 'success' | 'warning';
  message: string;
};

export type RejectTarget =
  | { kind: 'expense'; id: string }
  | { kind: 'travel'; id: string };

export type ApproveExpenseTarget = {
  id: string;
  claimAmount: string;
  currency: string;
  draftApprove: string;
};

export type ExpenseSubmissionHints = ExpenseSubmissionHintsQuery['expenseSubmissionHints'];

export interface SubmitExpenseInput {
  expenseCategoryId: string;
  amount: string;
  currency: string;
  expenseDate: string;
  title: string;
  travelRequestId?: string;
  receiptFileStorageId?: string;
}
