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
    "query MyAttendanceBoard($fromDate: NaiveDate!, $toDate: NaiveDate!, $first: Int = 50, $after: String) {\n  shifts(limit: 100) {\n    id\n    name\n    startTime\n    endTime\n    workHours\n    isNightShift\n  }\n  myAttendanceSummary(fromDate: $fromDate, toDate: $toDate) {\n    completedMinutes\n    workedDays\n    averageMinutes\n    incompleteSegments\n  }\n  myAttendance(fromDate: $fromDate, toDate: $toDate, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        id\n        employeeId\n        workDate\n        checkInAt\n        checkOutAt\n        checkInTime\n        checkOutTime\n        checkInLat\n        checkInLng\n        checkOutLat\n        checkOutLng\n        status\n        source\n        lateMinutes\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": typeof types.MyAttendanceBoardDocument,
};
const documents: Documents = {
    "query MyAttendanceBoard($fromDate: NaiveDate!, $toDate: NaiveDate!, $first: Int = 50, $after: String) {\n  shifts(limit: 100) {\n    id\n    name\n    startTime\n    endTime\n    workHours\n    isNightShift\n  }\n  myAttendanceSummary(fromDate: $fromDate, toDate: $toDate) {\n    completedMinutes\n    workedDays\n    averageMinutes\n    incompleteSegments\n  }\n  myAttendance(fromDate: $fromDate, toDate: $toDate, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        id\n        employeeId\n        workDate\n        checkInAt\n        checkOutAt\n        checkInTime\n        checkOutTime\n        checkInLat\n        checkInLng\n        checkOutLat\n        checkOutLng\n        status\n        source\n        lateMinutes\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": types.MyAttendanceBoardDocument,
};

/**
 * The attendanceGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = attendanceGraphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function attendanceGraphql(source: string): unknown;

/**
 * The attendanceGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function attendanceGraphql(source: "query MyAttendanceBoard($fromDate: NaiveDate!, $toDate: NaiveDate!, $first: Int = 50, $after: String) {\n  shifts(limit: 100) {\n    id\n    name\n    startTime\n    endTime\n    workHours\n    isNightShift\n  }\n  myAttendanceSummary(fromDate: $fromDate, toDate: $toDate) {\n    completedMinutes\n    workedDays\n    averageMinutes\n    incompleteSegments\n  }\n  myAttendance(fromDate: $fromDate, toDate: $toDate, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        id\n        employeeId\n        workDate\n        checkInAt\n        checkOutAt\n        checkInTime\n        checkOutTime\n        checkInLat\n        checkInLng\n        checkOutLat\n        checkOutLng\n        status\n        source\n        lateMinutes\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"): (typeof documents)["query MyAttendanceBoard($fromDate: NaiveDate!, $toDate: NaiveDate!, $first: Int = 50, $after: String) {\n  shifts(limit: 100) {\n    id\n    name\n    startTime\n    endTime\n    workHours\n    isNightShift\n  }\n  myAttendanceSummary(fromDate: $fromDate, toDate: $toDate) {\n    completedMinutes\n    workedDays\n    averageMinutes\n    incompleteSegments\n  }\n  myAttendance(fromDate: $fromDate, toDate: $toDate, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        id\n        employeeId\n        workDate\n        checkInAt\n        checkOutAt\n        checkInTime\n        checkOutTime\n        checkInLat\n        checkInLng\n        checkOutLat\n        checkOutLng\n        status\n        source\n        lateMinutes\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"];

export function attendanceGraphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;