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
};

export type AssignEmployeeSalaryStructureInput = {
  annualCtc: Scalars['String']['input'];
  effectiveFrom: Scalars['NaiveDate']['input'];
  effectiveTo?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
  overrides: Array<EmployeeSalaryComponentOverrideInput>;
  salaryStructureId: Scalars['ID']['input'];
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

export type RecordLoanPaymentInput = {
  amount: Scalars['String']['input'];
  evidenceReference: Scalars['String']['input'];
  externalReference: Scalars['String']['input'];
  loanId: Scalars['String']['input'];
  meta: LoanCommandMetaInput;
  method: Scalars['String']['input'];
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

export type LoanAccountFieldsFragment = { __typename?: 'LoanAccount', id: string, employeeId: string, requestId: string, loanNumber: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, terms: unknown };

export type LoanRequestFieldsFragment = { __typename?: 'LoanRequest', id: string, employeeId: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null };

export type LoanCommandFieldsFragment = { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string };

export type MyLoansQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type MyLoansQuery = { __typename?: 'QueryRoot', myLoans: { __typename?: 'LoanAccountConnection', nodes: Array<{ __typename?: 'LoanAccount', id: string, employeeId: string, requestId: string, loanNumber: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, terms: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanAccountsQueryVariables = Exact<{
  employeeId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanAccountsQuery = { __typename?: 'QueryRoot', loanAccounts: { __typename?: 'LoanAccountConnection', nodes: Array<{ __typename?: 'LoanAccount', id: string, employeeId: string, requestId: string, loanNumber: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, terms: unknown }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type MyLoanRequestsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type MyLoanRequestsQuery = { __typename?: 'QueryRoot', myLoanRequests: { __typename?: 'LoanRequestConnection', nodes: Array<{ __typename?: 'LoanRequest', id: string, employeeId: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanRequestQueueQueryVariables = Exact<{
  employeeId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
}>;


export type LoanRequestQueueQuery = { __typename?: 'QueryRoot', loanRequestQueue: { __typename?: 'LoanRequestConnection', nodes: Array<{ __typename?: 'LoanRequest', id: string, employeeId: string, requestedAmount: string, currency: string, purpose: string, employeeNotes?: string | null, state: string, version: number, workflowInstanceId?: string | null, currentStepId?: string | null }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type LoanAccountQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type LoanAccountQuery = { __typename?: 'QueryRoot', loanAccount: { __typename?: 'LoanAccount', id: string, employeeId: string, requestId: string, loanNumber: string, approvedPrincipal: string, currency: string, minorUnits: number, state: string, fundingState: string, version: number, principal: string, interest: string, terms: unknown } };

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


export type LoanPaymentsQuery = { __typename?: 'QueryRoot', loanPayments: { __typename?: 'LoanPaymentConnection', nodes: Array<{ __typename?: 'LoanPayment', id: string, kind: string, amount: string, valueDate: string, method: string, externalReference: string, unappliedCredit: string }>, pageInfo: { __typename?: 'LoanPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

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

export type SaveLoanRequestMutationVariables = Exact<{
  input: SubmitLoanRequestInput;
}>;


export type SaveLoanRequestMutation = { __typename?: 'MutationRoot', saveLoanRequest: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export type RetireLoanPolicyMutationVariables = Exact<{
  input: RetireLoanPolicyInput;
}>;


export type RetireLoanPolicyMutation = { __typename?: 'MutationRoot', retireLoanPolicy: { __typename?: 'LoanCommandResult', recordId: string, loanId?: string | null, employeeId?: string | null, version: number, state: string, postingIds: Array<string>, unappliedCredit: string } };

export const LoanAccountFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountFieldsFragment, unknown>;
export const LoanRequestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<LoanRequestFieldsFragment, unknown>;
export const LoanCommandFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanCommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanCommandResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]} as unknown as DocumentNode<LoanCommandFieldsFragment, unknown>;
export const MyLoansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLoans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLoans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<MyLoansQuery, MyLoansQueryVariables>;
export const LoanAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountsQuery, LoanAccountsQueryVariables>;
export const MyLoanRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLoanRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLoanRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanRequestFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<MyLoanRequestsQuery, MyLoanRequestsQueryVariables>;
export const LoanRequestQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanRequestQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanRequestQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanRequestFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNotes"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}}]}}]} as unknown as DocumentNode<LoanRequestQueueQuery, LoanRequestQueueQueryVariables>;
export const LoanAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LoanAccountFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LoanAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoanAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"loanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"approvedPrincipal"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"fundingState"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"principal"}},{"kind":"Field","name":{"kind":"Name","value":"interest"}},{"kind":"Field","name":{"kind":"Name","value":"terms"}}]}}]} as unknown as DocumentNode<LoanAccountQuery, LoanAccountQueryVariables>;
export const LoanPoliciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPolicies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"minorUnits"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"rules"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanPoliciesQuery, LoanPoliciesQueryVariables>;
export const LoanLedgerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanLedger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanLedger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceKind"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"valueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"principalDelta"}},{"kind":"Field","name":{"kind":"Name","value":"interestDelta"}},{"kind":"Field","name":{"kind":"Name","value":"reversalOf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanLedgerQuery, LoanLedgerQueryVariables>;
export const LoanPaymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoanPayments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loanPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"valueDate"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"externalReference"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<LoanPaymentsQuery, LoanPaymentsQueryVariables>;
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
export const SaveLoanRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveLoanRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitLoanRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveLoanRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<SaveLoanRequestMutation, SaveLoanRequestMutationVariables>;
export const RetireLoanPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetireLoanPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RetireLoanPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retireLoanPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"loanId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postingIds"}},{"kind":"Field","name":{"kind":"Name","value":"unappliedCredit"}}]}}]}}]} as unknown as DocumentNode<RetireLoanPolicyMutation, RetireLoanPolicyMutationVariables>;