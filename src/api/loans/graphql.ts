/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: string; output: string; }
  /** A scalar that can represent any JSON value. */
  JSON: { input: unknown; output: unknown; }
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: { input: string; output: string; }
  /**
   * A UUID is a unique 128-bit number, stored as 16 octets. UUIDs are parsed as
   * Strings within GraphQL. UUIDs are used to assign unique identifiers to
   * entities without requiring a central allocating authority.
   *
   * # References
   *
   * * [Wikipedia: Universally Unique Identifier](http://en.wikipedia.org/wiki/Universally_unique_identifier)
   * * [RFC4122: A Universally Unique Identifier (UUID) URN Namespace](http://tools.ietf.org/html/rfc4122)
   */
  UUID: { input: string; output: string; }
};

export type AssignEmployeeSalaryStructureInput = {
  annualCtc: Scalars['String']['input'];
  effectiveFrom: Scalars['NaiveDate']['input'];
  effectiveTo?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
  overrides: Array<EmployeeSalaryComponentOverrideInput>;
  salaryStructureId: Scalars['ID']['input'];
};

export type CancelLoanFundingInput = {
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  reason: Scalars['String']['input'];
};

/** Create a `PENDING` arrear; paid out on the next pay run that includes the employee. */
export type CreatePayrollArrearInput = {
  /** Decimal string, e.g. "5000.00" */
  amount: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** Create a new tenant payroll period row (`DRAFT`). One cycle per (tenant, month, year) in v1. */
export type CreatePayrollCycleInput = {
  /** Calendar month 1–12 */
  month: Scalars['Int']['input'];
  /** Display label, e.g. "April 2026 payroll" */
  name: Scalars['String']['input'];
  /** Optional pay-out date */
  paymentDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  year: Scalars['Int']['input'];
};

export type DecideLoanRequestInput = {
  agreementReference?: InputMaybe<Scalars['String']['input']>;
  decision: LoanRequestDecision;
  effectiveFrom?: InputMaybe<Scalars['String']['input']>;
  firstDueDate?: InputMaybe<Scalars['String']['input']>;
  meta: LoanCommandMetaInput;
  reason: Scalars['String']['input'];
  requestId: Scalars['String']['input'];
  stepId: Scalars['String']['input'];
  terms?: InputMaybe<Scalars['JSON']['input']>;
};

export type EmployeeSalaryComponentOverrideInput = {
  calculationBasis: Scalars['String']['input'];
  calculationValue: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  salaryComponentId: Scalars['ID']['input'];
};

export type LoanCommandMetaInput = {
  expectedVersion: Scalars['Int']['input'];
  idempotencyKey: Scalars['String']['input'];
};

export type LoanExitReviewInput = {
  decision: Scalars['JSON']['input'];
  exposureFingerprint: Scalars['String']['input'];
  separationFingerprint: Scalars['String']['input'];
  separationId: Scalars['UUID']['input'];
  settlementDate: Scalars['NaiveDate']['input'];
};

export enum LoanHistoricalPaymentKind {
  Disbursement = 'DISBURSEMENT',
  Receipt = 'RECEIPT'
}

export enum LoanRecoveryMode {
  External = 'EXTERNAL',
  Mixed = 'MIXED',
  Payroll = 'PAYROLL'
}

export enum LoanRequestDecision {
  Approve = 'APPROVE',
  Reject = 'REJECT',
  Return = 'RETURN'
}

export type PublishLoanPolicyInput = {
  currency: Scalars['String']['input'];
  effectiveFrom: Scalars['String']['input'];
  effectiveTo?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  minorUnits: Scalars['Int']['input'];
  rules: Scalars['JSON']['input'];
};

export type RecordHistoricalLoanPaymentInput = {
  amount: Scalars['String']['input'];
  evidenceReference: Scalars['String']['input'];
  externalReference: Scalars['String']['input'];
  kind: LoanHistoricalPaymentKind;
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  method: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  reconciliationReference: Scalars['String']['input'];
  resignationExceptionReason?: InputMaybe<Scalars['String']['input']>;
  reviewFingerprint: Scalars['String']['input'];
  valueDate: Scalars['String']['input'];
};

export type RecordLoanPaymentInput = {
  amount: Scalars['String']['input'];
  evidenceReference: Scalars['String']['input'];
  externalReference: Scalars['String']['input'];
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  method: Scalars['String']['input'];
  resignationExceptionReason?: InputMaybe<Scalars['String']['input']>;
  valueDate: Scalars['String']['input'];
};

export type RetireLoanPolicyInput = {
  meta: LoanCommandMetaInput;
  policyId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type ReverseLoanPostingInput = {
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  postingId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  reconciliationReference: Scalars['String']['input'];
  reviewFingerprint?: InputMaybe<Scalars['String']['input']>;
};

export type SalaryStructureComponentInput = {
  calculationBasis: Scalars['String']['input'];
  calculationValue: Scalars['String']['input'];
  displayOrder: Scalars['Int']['input'];
  salaryComponentId: Scalars['ID']['input'];
};

export type SaveFnfFinancialReviewInput = {
  expectedFingerprint?: InputMaybe<Scalars['String']['input']>;
  expectedRevision?: InputMaybe<Scalars['Int']['input']>;
  input: Scalars['JSON']['input'];
  separationId: Scalars['UUID']['input'];
};

export type SavePayrollUnpaidLeavePolicyInput = {
  basicComponentCode?: InputMaybe<Scalars['String']['input']>;
  dayDivisor?: InputMaybe<Scalars['String']['input']>;
  enabled: Scalars['Boolean']['input'];
  treatment?: InputMaybe<Scalars['String']['input']>;
};

export type SetLoanDeductionInput = {
  amount: Scalars['String']['input'];
  effectiveFrom: Scalars['String']['input'];
  firstDueDate: Scalars['String']['input'];
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  reason: Scalars['String']['input'];
  recovery: LoanRecoveryMode;
};

export type SetLoanPeriodOverrideInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  pauseInterest: Scalars['Boolean']['input'];
  periodStart: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type SubmitLoanRequestInput = {
  amount: Scalars['String']['input'];
  employeeId?: InputMaybe<Scalars['String']['input']>;
  meta: LoanCommandMetaInput;
  notes?: InputMaybe<Scalars['String']['input']>;
  policyId: Scalars['String']['input'];
  preferences: Scalars['JSON']['input'];
  purpose: Scalars['String']['input'];
  requestId?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertFnfSettlementInput = {
  bonusPayable?: InputMaybe<Scalars['String']['input']>;
  gratuityAmount?: InputMaybe<Scalars['String']['input']>;
  leaveEncashment?: InputMaybe<Scalars['String']['input']>;
  recoveryAmount?: InputMaybe<Scalars['String']['input']>;
  separationId: Scalars['ID']['input'];
};

export type UpsertPayrollComplianceSettingInput = {
  arrearSalaryComponentCode?: InputMaybe<Scalars['String']['input']>;
  baseSalaryComponentCode?: InputMaybe<Scalars['String']['input']>;
  employerLegalName?: InputMaybe<Scalars['String']['input']>;
  employerTan?: InputMaybe<Scalars['String']['input']>;
  /** Omitted preserves the saved address; null or blank clears it. */
  payslipCompanyAddress?: InputMaybe<Scalars['String']['input']>;
  payslipEmployeeFields?: InputMaybe<Array<Scalars['String']['input']>>;
  payslipHeaderTitle?: InputMaybe<Scalars['String']['input']>;
  payslipLogoFileStorageId?: InputMaybe<Scalars['ID']['input']>;
  payslipTemplate?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertSalaryComponentInput = {
  code: Scalars['String']['input'];
  componentType: Scalars['String']['input'];
  formulaExpression?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive: Scalars['Boolean']['input'];
  isFixed: Scalars['Boolean']['input'];
  isTaxable: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};

export type UpsertSalaryStructureInput = {
  components: Array<SalaryStructureComponentInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type WithdrawLoanRequestInput = {
  meta: LoanCommandMetaInput;
  reason: Scalars['String']['input'];
  requestId: Scalars['String']['input'];
};

export type LoanAccountFieldsFragment = { __typename?: 'LoanAccount', id: string, employeeId: string, employeeName: string, employeeCode: string, requestId: string, loanNumber: string, purpose: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, outstanding: string, disbursed: string, repaid: string, unappliedCredit: string, terms: unknown };

export type LoanRequestFieldsFragment = { __typename?: 'LoanRequest', id: string, employeeId: string, employeeName: string, employeeCode: string, policyId: string, preferences: unknown, createdAt: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null };

export type LoanCommandFieldsFragment = { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string };

export type MyLoansQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type MyLoansQuery = { __typename?: 'QueryRoot', myLoans: { __typename?: 'LoanAccountConnection', nodes: Array<{ __typename?: 'LoanAccount', id: string, employeeId: string, employeeName: string, employeeCode: string, requestId: string, loanNumber: string, purpose: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, outstanding: string, disbursed: string, repaid: string, unappliedCredit: string, terms: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanAccountsQueryVariables = Exact<{
  employeeId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
}>;


export type LoanAccountsQuery = { __typename?: 'QueryRoot', loanAccounts: { __typename?: 'LoanAccountConnection', nodes: Array<{ __typename?: 'LoanAccount', id: string, employeeId: string, employeeName: string, employeeCode: string, requestId: string, loanNumber: string, purpose: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, outstanding: string, disbursed: string, repaid: string, unappliedCredit: string, terms: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type MyLoanRequestsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type MyLoanRequestsQuery = { __typename?: 'QueryRoot', myLoanRequests: { __typename?: 'LoanRequestConnection', nodes: Array<{ __typename?: 'LoanRequest', id: string, employeeId: string, employeeName: string, employeeCode: string, policyId: string, preferences: unknown, createdAt: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanRequestQueueQueryVariables = Exact<{
  employeeId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
}>;


export type LoanRequestQueueQuery = { __typename?: 'QueryRoot', loanRequestQueue: { __typename?: 'LoanRequestConnection', nodes: Array<{ __typename?: 'LoanRequest', id: string, employeeId: string, employeeName: string, employeeCode: string, policyId: string, preferences: unknown, createdAt: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanAccountQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type LoanAccountQuery = { __typename?: 'QueryRoot', loanAccount: { __typename?: 'LoanAccount', id: string, employeeId: string, employeeName: string, employeeCode: string, requestId: string, loanNumber: string, purpose: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, outstanding: string, disbursed: string, repaid: string, unappliedCredit: string, terms: unknown } };

export type LoanPolicyQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type LoanPolicyQuery = { __typename?: 'QueryRoot', loanPolicy: { __typename?: 'LoanPolicy', id: string, key: string, version: number, currency: string, minorUnits: number, effectiveFrom: string, effectiveTo?: string | null, rules: unknown } };

export type PreviewLoanApprovalQueryVariables = Exact<{
  requestId: Scalars['String']['input'];
  terms: Scalars['JSON']['input'];
  effectiveFrom: Scalars['NaiveDate']['input'];
  firstDueDate: Scalars['NaiveDate']['input'];
}>;


export type PreviewLoanApprovalQuery = { __typename?: 'QueryRoot', previewLoanApproval: unknown };

export type LoanSchedulePreviewQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  firstDueDate: Scalars['NaiveDate']['input'];
}>;


export type LoanSchedulePreviewQuery = { __typename?: 'QueryRoot', loanSchedulePreview: unknown };

export type LoanStatementQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanStatementQuery = { __typename?: 'QueryRoot', loanStatement: { __typename?: 'LoanPostingConnection', nodes: Array<{ __typename?: 'LoanPosting', id: string, kind: string, sourceKind: string, sourceId: string, valueDate: string, amount: string, principalDelta: string, interestDelta: string, reversalOf?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanPoliciesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanPoliciesQuery = { __typename?: 'QueryRoot', loanPolicies: { __typename?: 'LoanPolicyConnection', nodes: Array<{ __typename?: 'LoanPolicy', id: string, key: string, version: number, currency: string, minorUnits: number, effectiveFrom: string, effectiveTo?: string | null, rules: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanLedgerQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanLedgerQuery = { __typename?: 'QueryRoot', loanLedger: { __typename?: 'LoanPostingConnection', nodes: Array<{ __typename?: 'LoanPosting', id: string, kind: string, sourceKind: string, sourceId: string, valueDate: string, amount: string, principalDelta: string, interestDelta: string, reversalOf?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanPaymentsQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanPaymentsQuery = { __typename?: 'QueryRoot', loanPayments: { __typename?: 'LoanPaymentConnection', nodes: Array<{ __typename?: 'LoanPayment', id: string, kind: string, amount: string, valueDate: string, method: string, externalReference: string, unappliedCredit: string, resignationExceptionReason?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanSchedulesQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanSchedulesQuery = { __typename?: 'QueryRoot', loanSchedules: { __typename?: 'LoanScheduleConnection', nodes: Array<{ __typename?: 'LoanSchedule', id: string, version: number, effectiveFrom: string, monthlyAmount: string, recoveryMode: string, isProjection: boolean }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type PublishLoanPolicyMutationVariables = Exact<{
  input: PublishLoanPolicyInput;
}>;


export type PublishLoanPolicyMutation = { __typename?: 'MutationRoot', publishLoanPolicy: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type SubmitLoanRequestMutationVariables = Exact<{
  input: SubmitLoanRequestInput;
}>;


export type SubmitLoanRequestMutation = { __typename?: 'MutationRoot', submitLoanRequest: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type DecideLoanRequestMutationVariables = Exact<{
  input: DecideLoanRequestInput;
}>;


export type DecideLoanRequestMutation = { __typename?: 'MutationRoot', decideLoanRequest: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type WithdrawLoanRequestMutationVariables = Exact<{
  input: WithdrawLoanRequestInput;
}>;


export type WithdrawLoanRequestMutation = { __typename?: 'MutationRoot', withdrawLoanRequest: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type RecordLoanDisbursementMutationVariables = Exact<{
  input: RecordLoanPaymentInput;
}>;


export type RecordLoanDisbursementMutation = { __typename?: 'MutationRoot', recordLoanDisbursement: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type RecordLoanReceiptMutationVariables = Exact<{
  input: RecordLoanPaymentInput;
}>;


export type RecordLoanReceiptMutation = { __typename?: 'MutationRoot', recordLoanReceipt: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type SetLoanDeductionMutationVariables = Exact<{
  input: SetLoanDeductionInput;
}>;


export type SetLoanDeductionMutation = { __typename?: 'MutationRoot', setLoanDeduction: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type SetLoanPeriodOverrideMutationVariables = Exact<{
  input: SetLoanPeriodOverrideInput;
}>;


export type SetLoanPeriodOverrideMutation = { __typename?: 'MutationRoot', setLoanPeriodOverride: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type ReverseLoanPostingMutationVariables = Exact<{
  input: ReverseLoanPostingInput;
}>;


export type ReverseLoanPostingMutation = { __typename?: 'MutationRoot', reverseLoanPosting: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type PreviewLoanReversalQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
  postingId: Scalars['String']['input'];
}>;


export type PreviewLoanReversalQuery = { __typename?: 'QueryRoot', previewLoanReversal: { __typename?: 'LoanCorrectionPreview', loanId: string, postingId: string, accountVersion: number, occurrenceDate: string, postingDate: string, currency: string, currentPrincipal: string, currentInterest: string, correctedPrincipal: string, correctedInterest: string, preservedPayrollPostings: Array<string>, reviewFingerprint: string } };

export type LoanPolicyVersionsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type LoanPolicyVersionsQuery = { __typename?: 'QueryRoot', loanPolicyVersions: { __typename?: 'LoanPolicyConnection', nodes: Array<{ __typename?: 'LoanPolicy', id: string, key: string, version: number, status: string, currency: string, minorUnits: number, effectiveFrom: string, effectiveTo?: string | null, rules: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanApprovalWorkflowsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanApprovalWorkflowsQuery = { __typename?: 'QueryRoot', loanApprovalWorkflows: { __typename?: 'LoanApprovalWorkflowConnection', nodes: Array<{ __typename?: 'LoanApprovalWorkflow', id: string, name: string }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type SaveLoanRequestMutationVariables = Exact<{
  input: SubmitLoanRequestInput;
}>;


export type SaveLoanRequestMutation = { __typename?: 'MutationRoot', saveLoanRequest: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type RetireLoanPolicyMutationVariables = Exact<{
  input: RetireLoanPolicyInput;
}>;


export type RetireLoanPolicyMutation = { __typename?: 'MutationRoot', retireLoanPolicy: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type SetPayrollCyclePaymentDateMutationVariables = Exact<{
  cycleId: Scalars['ID']['input'];
  paymentDate: Scalars['NaiveDate']['input'];
  expectedRevision?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SetPayrollCyclePaymentDateMutation = { __typename?: 'MutationRoot', setPayrollCyclePaymentDate: boolean };

export type PreviewLoanExitReviewQueryVariables = Exact<{
  separationId: Scalars['UUID']['input'];
  settlementDate: Scalars['NaiveDate']['input'];
}>;


export type PreviewLoanExitReviewQuery = { __typename?: 'QueryRoot', previewLoanExitReview: { __typename?: 'LoanExitReviewPreview', separationId: string, employeeId: string, lastWorkingDate: string, separationFingerprint: string, exposure: unknown, payrollContext: unknown } };

export type SaveLoanExitReviewMutationVariables = Exact<{
  input: LoanExitReviewInput;
}>;


export type SaveLoanExitReviewMutation = { __typename?: 'MutationRoot', saveLoanExitReview: { __typename?: 'LoanExitReviewResult', id: string, separationId: string, exposure: unknown, decision: unknown } };

export type FnfFinancialReviewQueryVariables = Exact<{
  separationId: Scalars['UUID']['input'];
}>;


export type FnfFinancialReviewQuery = { __typename?: 'QueryRoot', fnfFinancialReview: { __typename?: 'FnfFinancialPreparation', revision?: number | null, fingerprint?: string | null, input?: unknown | null, legacyFiguresFingerprint?: string | null, settlement?: { __typename?: 'FnfSettlement', id: string, separationId: string, status: string, leaveEncashment?: string | null, gratuityAmount?: string | null, bonusPayable?: string | null, recoveryAmount?: string | null, netPayable?: string | null, financials?: unknown | null } | null } };

export type PreviewFnfLoanExposureQueryVariables = Exact<{
  separationId: Scalars['UUID']['input'];
  settlementDate: Scalars['NaiveDate']['input'];
}>;


export type PreviewFnfLoanExposureQuery = { __typename?: 'QueryRoot', previewFnfLoanExposure: unknown };

export type LoanFnfSettlementQueryVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type LoanFnfSettlementQuery = { __typename?: 'QueryRoot', fnfSettlement?: { __typename?: 'FnfSettlement', id: string, separationId: string, status: string, leaveEncashment?: string | null, gratuityAmount?: string | null, bonusPayable?: string | null, recoveryAmount?: string | null, netPayable?: string | null, processedAt?: string | null, financials?: unknown | null } | null };

export type FinanceFollowUpOwnersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['UUID']['input']>;
  first: Scalars['Int']['input'];
}>;


export type FinanceFollowUpOwnersQuery = { __typename?: 'QueryRoot', financeFollowUpOwners: { __typename?: 'FinanceOwnerConnection', nodes: Array<{ __typename?: 'FinanceOwner', id: string, name: string }>, pageInfo: { __typename?: 'FinanceOwnerPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type SaveFnfFinancialReviewMutationVariables = Exact<{
  input: SaveFnfFinancialReviewInput;
}>;


export type SaveFnfFinancialReviewMutation = { __typename?: 'MutationRoot', saveFnfFinancialReview: { __typename?: 'FnfFinancialPreparation', revision?: number | null, fingerprint?: string | null, input?: unknown | null, legacyFiguresFingerprint?: string | null, settlement?: { __typename?: 'FnfSettlement', id: string, separationId: string, status: string, leaveEncashment?: string | null, gratuityAmount?: string | null, bonusPayable?: string | null, recoveryAmount?: string | null, netPayable?: string | null, financials?: unknown | null } | null } };

export type FinalizeReviewedFnfMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
  expectedRevision: Scalars['Int']['input'];
  expectedFingerprint: Scalars['String']['input'];
}>;


export type FinalizeReviewedFnfMutation = { __typename?: 'MutationRoot', finalizeFnfSettlement: { __typename?: 'FnfSettlement', id: string, separationId: string, status: string, netPayable?: string | null, financials?: unknown | null } };

export type ApproveSeparationWithFinanceMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
  financeReviewId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ApproveSeparationWithFinanceMutation = { __typename?: 'MutationRoot', approveSeparation: { __typename?: 'Separation', id: string, status: string } };

export type CancelExitFinanceApprovalMutationVariables = Exact<{
  operationId: Scalars['ID']['input'];
}>;


export type CancelExitFinanceApprovalMutation = { __typename?: 'MutationRoot', cancelExitApproval: boolean };

export type ExitApprovalOperationQueryVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ExitApprovalOperationQuery = { __typename?: 'QueryRoot', exitApprovalOperation?: { __typename?: 'ExitApprovalOperation', id: string, reviewId: string, state: string, canResume: boolean } | null };

export type CancelLoanFundingMutationVariables = Exact<{
  input: CancelLoanFundingInput;
}>;


export type CancelLoanFundingMutation = { __typename?: 'MutationRoot', cancelLoanFunding: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type LoanFinancialReconciliationQueryVariables = Exact<{
  loanId: Scalars['String']['input'];
}>;


export type LoanFinancialReconciliationQuery = { __typename?: 'QueryRoot', loanFinancialReconciliation?: unknown | null };

export type ReconcileLoanFinancialsMutationVariables = Exact<{
  loanId: Scalars['String']['input'];
}>;


export type ReconcileLoanFinancialsMutation = { __typename?: 'MutationRoot', reconcileLoanFinancials: unknown };

export type PreviewHistoricalLoanPaymentQueryVariables = Exact<{
  input: RecordLoanPaymentInput;
  kind: LoanHistoricalPaymentKind;
}>;


export type PreviewHistoricalLoanPaymentQuery = { __typename?: 'QueryRoot', previewHistoricalLoanPayment: unknown };

export type RecordHistoricalLoanPaymentMutationVariables = Exact<{
  input: RecordHistoricalLoanPaymentInput;
}>;


export type RecordHistoricalLoanPaymentMutation = { __typename?: 'MutationRoot', recordHistoricalLoanPayment: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export const LoanAccountFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"outstanding"}},{"kind":"Field","name":{"kind":"Name","value":"disbursed"}},{"kind":"Field","name":{"kind":"Name","value":"repaid"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountFieldsFragment, unknown>;
export const LoanRequestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<LoanRequestFieldsFragment, unknown>;
export const LoanCommandFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<LoanCommandFieldsFragment, unknown>;
export const MyLoansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLoans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLoans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"outstanding"}},{"kind":"Field","name":{"kind":"Name","value":"disbursed"}},{"kind":"Field","name":{"kind":"Name","value":"repaid"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<MyLoansQuery, MyLoansQueryVariables>;
export const LoanAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"outstanding"}},{"kind":"Field","name":{"kind":"Name","value":"disbursed"}},{"kind":"Field","name":{"kind":"Name","value":"repaid"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountsQuery, LoanAccountsQueryVariables>;
export const MyLoanRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLoanRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLoanRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanRequestFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<MyLoanRequestsQuery, MyLoanRequestsQueryVariables>;
export const LoanRequestQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanRequestQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanRequestQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanRequestFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<LoanRequestQueueQuery, LoanRequestQueueQueryVariables>;
export const LoanAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"outstanding"}},{"kind":"Field","name":{"kind":"Name","value":"disbursed"}},{"kind":"Field","name":{"kind":"Name","value":"repaid"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountQuery, LoanAccountQueryVariables>;
export const LoanPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"rules"}}]}}]}}]} as unknown as DocumentNode<LoanPolicyQuery, LoanPolicyQueryVariables>;
export const PreviewLoanApprovalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewLoanApproval"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"terms"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"effectiveFrom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstDueDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewLoanApproval"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"terms"},"value":{"kind":"Variable","name":{"kind":"Name","value":"terms"}}},{"kind":"Argument","name":{"kind":"Name","value":"effectiveFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"effectiveFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"firstDueDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstDueDate"}}}]}]}}]} as unknown as DocumentNode<PreviewLoanApprovalQuery, PreviewLoanApprovalQueryVariables>;
export const LoanSchedulePreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanSchedulePreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstDueDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanSchedulePreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"firstDueDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstDueDate"}}}]}]}}]} as unknown as DocumentNode<LoanSchedulePreviewQuery, LoanSchedulePreviewQueryVariables>;
export const LoanStatementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanStatement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceKind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"valueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"principalDelta"}},{"kind":"Field","name":{"kind":"Name","value":"interestDelta"}},{"kind":"Field","name":{"kind":"Name","value":"reversalOf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanStatementQuery, LoanStatementQueryVariables>;
export const LoanPoliciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPolicies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"rules"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanPoliciesQuery, LoanPoliciesQueryVariables>;
export const LoanLedgerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanLedger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanLedger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceKind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"valueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"principalDelta"}},{"kind":"Field","name":{"kind":"Name","value":"interestDelta"}},{"kind":"Field","name":{"kind":"Name","value":"reversalOf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanLedgerQuery, LoanLedgerQueryVariables>;
export const LoanPaymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPayments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"valueDate"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"externalReference"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}},{"kind":"Field","name":{"kind":"Name","value":"resignationExceptionReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanPaymentsQuery, LoanPaymentsQueryVariables>;
export const LoanSchedulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanSchedules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanSchedules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyAmount"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryMode"}},{"kind":"Field","name":{"kind":"Name","value":"isProjection"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanSchedulesQuery, LoanSchedulesQueryVariables>;
export const PublishLoanPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishLoanPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishLoanPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishLoanPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<PublishLoanPolicyMutation, PublishLoanPolicyMutationVariables>;
export const SubmitLoanRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitLoanRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitLoanRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitLoanRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<SubmitLoanRequestMutation, SubmitLoanRequestMutationVariables>;
export const DecideLoanRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DecideLoanRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DecideLoanRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"decideLoanRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<DecideLoanRequestMutation, DecideLoanRequestMutationVariables>;
export const WithdrawLoanRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WithdrawLoanRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WithdrawLoanRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"withdrawLoanRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<WithdrawLoanRequestMutation, WithdrawLoanRequestMutationVariables>;
export const RecordLoanDisbursementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordLoanDisbursement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordLoanPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordLoanDisbursement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<RecordLoanDisbursementMutation, RecordLoanDisbursementMutationVariables>;
export const RecordLoanReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordLoanReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordLoanPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordLoanReceipt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<RecordLoanReceiptMutation, RecordLoanReceiptMutationVariables>;
export const SetLoanDeductionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetLoanDeduction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLoanDeductionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLoanDeduction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<SetLoanDeductionMutation, SetLoanDeductionMutationVariables>;
export const SetLoanPeriodOverrideDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetLoanPeriodOverride"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLoanPeriodOverrideInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLoanPeriodOverride"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<SetLoanPeriodOverrideMutation, SetLoanPeriodOverrideMutationVariables>;
export const ReverseLoanPostingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReverseLoanPosting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReverseLoanPostingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reverseLoanPosting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanCommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<ReverseLoanPostingMutation, ReverseLoanPostingMutationVariables>;
export const PreviewLoanReversalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewLoanReversal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"postingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewLoanReversal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"postingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"postingId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"postingId"}},{"kind":"Field","name":{"kind":"Name","value":"accountVersion"}},{"kind":"Field","name":{"kind":"Name","value":"occurrenceDate"}},{"kind":"Field","name":{"kind":"Name","value":"postingDate"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"currentPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currentInterest"}},{"kind":"Field","name":{"kind":"Name","value":"correctedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"correctedInterest"}},{"kind":"Field","name":{"kind":"Name","value":"preservedPayrollPostings"}},{"kind":"Field","name":{"kind":"Name","value":"reviewFingerprint"}}]}}]}}]} as unknown as DocumentNode<PreviewLoanReversalQuery, PreviewLoanReversalQueryVariables>;
export const LoanPolicyVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPolicyVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPolicyVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"rules"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanPolicyVersionsQuery, LoanPolicyVersionsQueryVariables>;
export const LoanApprovalWorkflowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanApprovalWorkflows"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanApprovalWorkflows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanApprovalWorkflowsQuery, LoanApprovalWorkflowsQueryVariables>;
export const SaveLoanRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveLoanRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitLoanRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveLoanRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<SaveLoanRequestMutation, SaveLoanRequestMutationVariables>;
export const RetireLoanPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetireLoanPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RetireLoanPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retireLoanPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<RetireLoanPolicyMutation, RetireLoanPolicyMutationVariables>;
export const SetPayrollCyclePaymentDateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetPayrollCyclePaymentDate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cycleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedRevision"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPayrollCyclePaymentDate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cycleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cycleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"paymentDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedRevision"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedRevision"}}}]}]}}]} as unknown as DocumentNode<SetPayrollCyclePaymentDateMutation, SetPayrollCyclePaymentDateMutationVariables>;
export const PreviewLoanExitReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewLoanExitReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settlementDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewLoanExitReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"settlementDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settlementDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"lastWorkingDate"}},{"kind":"Field","name":{"kind":"Name","value":"separationFingerprint"}},{"kind":"Field","name":{"kind":"Name","value":"exposure"}},{"kind":"Field","name":{"kind":"Name","value":"payrollContext"}}]}}]}}]} as unknown as DocumentNode<PreviewLoanExitReviewQuery, PreviewLoanExitReviewQueryVariables>;
export const SaveLoanExitReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveLoanExitReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoanExitReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveLoanExitReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"exposure"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}}]}}]}}]} as unknown as DocumentNode<SaveLoanExitReviewMutation, SaveLoanExitReviewMutationVariables>;
export const FnfFinancialReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FnfFinancialReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fnfFinancialReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"fingerprint"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"legacyFiguresFingerprint"}},{"kind":"Field","name":{"kind":"Name","value":"settlement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"leaveEncashment"}},{"kind":"Field","name":{"kind":"Name","value":"gratuityAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bonusPayable"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"financials"}}]}}]}}]}}]} as unknown as DocumentNode<FnfFinancialReviewQuery, FnfFinancialReviewQueryVariables>;
export const PreviewFnfLoanExposureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewFnfLoanExposure"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settlementDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewFnfLoanExposure"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"settlementDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settlementDate"}}}]}]}}]} as unknown as DocumentNode<PreviewFnfLoanExposureQuery, PreviewFnfLoanExposureQueryVariables>;
export const LoanFnfSettlementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanFnfSettlement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fnfSettlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"leaveEncashment"}},{"kind":"Field","name":{"kind":"Name","value":"gratuityAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bonusPayable"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"processedAt"}},{"kind":"Field","name":{"kind":"Name","value":"financials"}}]}}]}}]} as unknown as DocumentNode<LoanFnfSettlementQuery, LoanFnfSettlementQueryVariables>;
export const FinanceFollowUpOwnersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinanceFollowUpOwners"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financeFollowUpOwners"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<FinanceFollowUpOwnersQuery, FinanceFollowUpOwnersQueryVariables>;
export const SaveFnfFinancialReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveFnfFinancialReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveFnfFinancialReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveFnfFinancialReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"fingerprint"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"legacyFiguresFingerprint"}},{"kind":"Field","name":{"kind":"Name","value":"settlement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"leaveEncashment"}},{"kind":"Field","name":{"kind":"Name","value":"gratuityAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bonusPayable"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"financials"}}]}}]}}]}}]} as unknown as DocumentNode<SaveFnfFinancialReviewMutation, SaveFnfFinancialReviewMutationVariables>;
export const FinalizeReviewedFnfDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinalizeReviewedFnf"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedRevision"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedFingerprint"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeFnfSettlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedRevision"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedRevision"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedFingerprint"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedFingerprint"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"financials"}}]}}]}}]} as unknown as DocumentNode<FinalizeReviewedFnfMutation, FinalizeReviewedFnfMutationVariables>;
export const ApproveSeparationWithFinanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveSeparationWithFinance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"financeReviewId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveSeparation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"financeReviewId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"financeReviewId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ApproveSeparationWithFinanceMutation, ApproveSeparationWithFinanceMutationVariables>;
export const CancelExitFinanceApprovalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelExitFinanceApproval"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelExitApproval"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"operationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operationId"}}}]}]}}]} as unknown as DocumentNode<CancelExitFinanceApprovalMutation, CancelExitFinanceApprovalMutationVariables>;
export const ExitApprovalOperationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExitApprovalOperation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exitApprovalOperation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviewId"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}}]}}]}}]} as unknown as DocumentNode<ExitApprovalOperationQuery, ExitApprovalOperationQueryVariables>;
export const CancelLoanFundingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelLoanFunding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancelLoanFundingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelLoanFunding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<CancelLoanFundingMutation, CancelLoanFundingMutationVariables>;
export const LoanFinancialReconciliationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanFinancialReconciliation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanFinancialReconciliation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}}]}]}}]} as unknown as DocumentNode<LoanFinancialReconciliationQuery, LoanFinancialReconciliationQueryVariables>;
export const ReconcileLoanFinancialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReconcileLoanFinancials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reconcileLoanFinancials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}}]}]}}]} as unknown as DocumentNode<ReconcileLoanFinancialsMutation, ReconcileLoanFinancialsMutationVariables>;
export const PreviewHistoricalLoanPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewHistoricalLoanPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordLoanPaymentInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoanHistoricalPaymentKind"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewHistoricalLoanPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}}]}]}}]} as unknown as DocumentNode<PreviewHistoricalLoanPaymentQuery, PreviewHistoricalLoanPaymentQueryVariables>;
export const RecordHistoricalLoanPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordHistoricalLoanPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordHistoricalLoanPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordHistoricalLoanPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<RecordHistoricalLoanPaymentMutation, RecordHistoricalLoanPaymentMutationVariables>;