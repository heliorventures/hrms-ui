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

export type AdjustLeaveBalanceEntitlementInput = {
  employeeId: Scalars['ID']['input'];
  entitledDelta: Scalars['String']['input'];
  leaveTypeId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
};

export type SubmitCompOffClaimInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  units: Scalars['String']['input'];
  workedDate: Scalars['NaiveDate']['input'];
};

export type SubmitLeaveRequestInput = {
  fromDate: Scalars['NaiveDate']['input'];
  halfDaySession?: InputMaybe<Scalars['String']['input']>;
  isHalfDay: Scalars['Boolean']['input'];
  leaveTypeId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  supportingDocumentFileStorageId?: InputMaybe<Scalars['ID']['input']>;
  supportingDocumentReference?: InputMaybe<Scalars['String']['input']>;
  toDate: Scalars['NaiveDate']['input'];
};

export type UpsertCompOffPolicyInput = {
  allowApprovedLeaveCancellation: Scalars['Boolean']['input'];
  claimDeadlineDays: Scalars['Int']['input'];
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  enabled: Scalars['Boolean']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  maxUnusedBalance?: InputMaybe<Scalars['String']['input']>;
  monthlyEarningLimit?: InputMaybe<Scalars['String']['input']>;
  validityDays: Scalars['Int']['input'];
  yearlyEarningLimit?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertLeaveBalanceInput = {
  carriedForwardDays: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  entitledDays: Scalars['String']['input'];
  leaveTypeId: Scalars['ID']['input'];
  pendingDays: Scalars['String']['input'];
  usedDays: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type UpsertLeavePolicyInput = {
  accrualDays?: InputMaybe<Scalars['String']['input']>;
  accrualFrequency?: InputMaybe<Scalars['String']['input']>;
  annualEntitlement?: InputMaybe<Scalars['Int']['input']>;
  applicableTo?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  leaveTypeId: Scalars['ID']['input'];
  maxConsecutiveDays?: InputMaybe<Scalars['Int']['input']>;
  minNoticeDays?: InputMaybe<Scalars['Int']['input']>;
};

export type UpsertLeaveTypeInput = {
  carryForward: Scalars['Boolean']['input'];
  code: Scalars['String']['input'];
  halfDayAllowed: Scalars['Boolean']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  isPaid: Scalars['Boolean']['input'];
  maxCarryForwardDays?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  requiresDocument: Scalars['Boolean']['input'];
  sandwichRule: Scalars['Boolean']['input'];
};

export type HrLeaveApprovalBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  balanceYear?: InputMaybe<Scalars['Int']['input']>;
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  needsMyAction?: Scalars['Boolean']['input'];
}>;


export type HrLeaveApprovalBoardQuery = { __typename?: 'QueryRoot', viewerEmployeeId: string, leavePolicies: Array<{ __typename?: 'LeavePolicy', id: string, leaveTypeId: string, applicableTo?: string | null, annualEntitlement?: number | null, accrualFrequency?: string | null, accrualDays?: string | null, maxConsecutiveDays?: number | null, minNoticeDays?: number | null }>, leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string, isPaid: boolean, carryForward: boolean, requiresDocument: boolean, halfDayAllowed: boolean, sandwichRule: boolean }>, leaveBalances: Array<{ __typename?: 'LeaveBalance', id: string, leaveTypeId: string, year: number, entitledDays: string, usedDays: string, pendingDays: string, balanceDays: string, carriedForwardDays: string }>, leaveApprovalQueue: { __typename?: 'LeaveApprovalQueue', totalCount: number, pendingCount: number, actionableCount: number, rows: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, employeeName?: string | null, employeeCode?: string | null, leaveTypeId: string, fromDate: string, toDate: string, daysRequested: string, status: string, reason?: string | null, rejectionReason?: string | null, isHalfDay: boolean, halfDaySession?: string | null, appliedAt: string, workflowInstanceId?: string | null, pendingApprovalStage?: string | null, pendingApprovalStepId?: string | null, viewerMayApprove: boolean, supportingDocumentReference?: string | null, supportingDocumentFileStorageId?: string | null, supportingDocumentFileName?: string | null }> } };


export const HrLeaveApprovalBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HrLeaveApprovalBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"balanceYear"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"needsMyAction"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewerEmployeeId"}},{"kind":"Field","name":{"kind":"Name","value":"leavePolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"applicableTo"}},{"kind":"Field","name":{"kind":"Name","value":"annualEntitlement"}},{"kind":"Field","name":{"kind":"Name","value":"accrualFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"accrualDays"}},{"kind":"Field","name":{"kind":"Name","value":"maxConsecutiveDays"}},{"kind":"Field","name":{"kind":"Name","value":"minNoticeDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPaid"}},{"kind":"Field","name":{"kind":"Name","value":"carryForward"}},{"kind":"Field","name":{"kind":"Name","value":"requiresDocument"}},{"kind":"Field","name":{"kind":"Name","value":"halfDayAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"sandwichRule"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveBalances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"balanceYear"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"entitledDays"}},{"kind":"Field","name":{"kind":"Name","value":"usedDays"}},{"kind":"Field","name":{"kind":"Name","value":"pendingDays"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDays"}},{"kind":"Field","name":{"kind":"Name","value":"carriedForwardDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveApprovalQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"needsMyAction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"needsMyAction"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingCount"}},{"kind":"Field","name":{"kind":"Name","value":"actionableCount"}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRequested"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"isHalfDay"}},{"kind":"Field","name":{"kind":"Name","value":"halfDaySession"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovalStage"}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovalStepId"}},{"kind":"Field","name":{"kind":"Name","value":"viewerMayApprove"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentReference"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentFileStorageId"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentFileName"}}]}}]}}]}}]} as unknown as DocumentNode<HrLeaveApprovalBoardQuery, HrLeaveApprovalBoardQueryVariables>;