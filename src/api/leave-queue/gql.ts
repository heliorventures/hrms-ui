/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query HrLeaveApprovalBoard($limit: Int! = 20, $offset: Int! = 0, $balanceYear: Int, $fromDate: NaiveDate, $toDate: NaiveDate, $status: String, $needsMyAction: Boolean! = false) {\n  viewerEmployeeId\n  leavePolicies(limit: 200) {\n    id\n    leaveTypeId\n    applicableTo\n    annualEntitlement\n    accrualFrequency\n    accrualDays\n    maxConsecutiveDays\n    minNoticeDays\n  }\n  leaveTypes(limit: 200) {\n    id\n    name\n    code\n    isPaid\n    carryForward\n    requiresDocument\n    halfDayAllowed\n    sandwichRule\n  }\n  leaveBalances(limit: 200, year: $balanceYear) {\n    id\n    leaveTypeId\n    year\n    entitledDays\n    usedDays\n    pendingDays\n    balanceDays\n    carriedForwardDays\n  }\n  leaveApprovalQueue(\n    limit: $limit\n    offset: $offset\n    fromDate: $fromDate\n    toDate: $toDate\n    status: $status\n    needsMyAction: $needsMyAction\n  ) {\n    totalCount\n    pendingCount\n    actionableCount\n    rows {\n      id\n      employeeId\n      employeeName\n      employeeCode\n      leaveTypeId\n      fromDate\n      toDate\n      daysRequested\n      status\n      reason\n      rejectionReason\n      isHalfDay\n      halfDaySession\n      appliedAt\n      workflowInstanceId\n      pendingApprovalStage\n      pendingApprovalStepId\n      viewerMayApprove\n      supportingDocumentReference\n      supportingDocumentFileStorageId\n      supportingDocumentFileName\n    }\n  }\n}": typeof types.HrLeaveApprovalBoardDocument,
};
const documents: Documents = {
    "query HrLeaveApprovalBoard($limit: Int! = 20, $offset: Int! = 0, $balanceYear: Int, $fromDate: NaiveDate, $toDate: NaiveDate, $status: String, $needsMyAction: Boolean! = false) {\n  viewerEmployeeId\n  leavePolicies(limit: 200) {\n    id\n    leaveTypeId\n    applicableTo\n    annualEntitlement\n    accrualFrequency\n    accrualDays\n    maxConsecutiveDays\n    minNoticeDays\n  }\n  leaveTypes(limit: 200) {\n    id\n    name\n    code\n    isPaid\n    carryForward\n    requiresDocument\n    halfDayAllowed\n    sandwichRule\n  }\n  leaveBalances(limit: 200, year: $balanceYear) {\n    id\n    leaveTypeId\n    year\n    entitledDays\n    usedDays\n    pendingDays\n    balanceDays\n    carriedForwardDays\n  }\n  leaveApprovalQueue(\n    limit: $limit\n    offset: $offset\n    fromDate: $fromDate\n    toDate: $toDate\n    status: $status\n    needsMyAction: $needsMyAction\n  ) {\n    totalCount\n    pendingCount\n    actionableCount\n    rows {\n      id\n      employeeId\n      employeeName\n      employeeCode\n      leaveTypeId\n      fromDate\n      toDate\n      daysRequested\n      status\n      reason\n      rejectionReason\n      isHalfDay\n      halfDaySession\n      appliedAt\n      workflowInstanceId\n      pendingApprovalStage\n      pendingApprovalStepId\n      viewerMayApprove\n      supportingDocumentReference\n      supportingDocumentFileStorageId\n      supportingDocumentFileName\n    }\n  }\n}": types.HrLeaveApprovalBoardDocument,
};

/**
 * The leaveQueueGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = leaveQueueGraphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function leaveQueueGraphql(source: string): unknown;

/**
 * The leaveQueueGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function leaveQueueGraphql(source: "query HrLeaveApprovalBoard($limit: Int! = 20, $offset: Int! = 0, $balanceYear: Int, $fromDate: NaiveDate, $toDate: NaiveDate, $status: String, $needsMyAction: Boolean! = false) {\n  viewerEmployeeId\n  leavePolicies(limit: 200) {\n    id\n    leaveTypeId\n    applicableTo\n    annualEntitlement\n    accrualFrequency\n    accrualDays\n    maxConsecutiveDays\n    minNoticeDays\n  }\n  leaveTypes(limit: 200) {\n    id\n    name\n    code\n    isPaid\n    carryForward\n    requiresDocument\n    halfDayAllowed\n    sandwichRule\n  }\n  leaveBalances(limit: 200, year: $balanceYear) {\n    id\n    leaveTypeId\n    year\n    entitledDays\n    usedDays\n    pendingDays\n    balanceDays\n    carriedForwardDays\n  }\n  leaveApprovalQueue(\n    limit: $limit\n    offset: $offset\n    fromDate: $fromDate\n    toDate: $toDate\n    status: $status\n    needsMyAction: $needsMyAction\n  ) {\n    totalCount\n    pendingCount\n    actionableCount\n    rows {\n      id\n      employeeId\n      employeeName\n      employeeCode\n      leaveTypeId\n      fromDate\n      toDate\n      daysRequested\n      status\n      reason\n      rejectionReason\n      isHalfDay\n      halfDaySession\n      appliedAt\n      workflowInstanceId\n      pendingApprovalStage\n      pendingApprovalStepId\n      viewerMayApprove\n      supportingDocumentReference\n      supportingDocumentFileStorageId\n      supportingDocumentFileName\n    }\n  }\n}"): (typeof documents)["query HrLeaveApprovalBoard($limit: Int! = 20, $offset: Int! = 0, $balanceYear: Int, $fromDate: NaiveDate, $toDate: NaiveDate, $status: String, $needsMyAction: Boolean! = false) {\n  viewerEmployeeId\n  leavePolicies(limit: 200) {\n    id\n    leaveTypeId\n    applicableTo\n    annualEntitlement\n    accrualFrequency\n    accrualDays\n    maxConsecutiveDays\n    minNoticeDays\n  }\n  leaveTypes(limit: 200) {\n    id\n    name\n    code\n    isPaid\n    carryForward\n    requiresDocument\n    halfDayAllowed\n    sandwichRule\n  }\n  leaveBalances(limit: 200, year: $balanceYear) {\n    id\n    leaveTypeId\n    year\n    entitledDays\n    usedDays\n    pendingDays\n    balanceDays\n    carriedForwardDays\n  }\n  leaveApprovalQueue(\n    limit: $limit\n    offset: $offset\n    fromDate: $fromDate\n    toDate: $toDate\n    status: $status\n    needsMyAction: $needsMyAction\n  ) {\n    totalCount\n    pendingCount\n    actionableCount\n    rows {\n      id\n      employeeId\n      employeeName\n      employeeCode\n      leaveTypeId\n      fromDate\n      toDate\n      daysRequested\n      status\n      reason\n      rejectionReason\n      isHalfDay\n      halfDaySession\n      appliedAt\n      workflowInstanceId\n      pendingApprovalStage\n      pendingApprovalStepId\n      viewerMayApprove\n      supportingDocumentReference\n      supportingDocumentFileStorageId\n      supportingDocumentFileName\n    }\n  }\n}"];

export function leaveQueueGraphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;