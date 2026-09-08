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
  DateTime: { input: any; output: any; }
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: { input: any; output: any; }
  /**
   * ISO 8601 time without timezone.
   * Allows for the nanosecond precision and optional leap second representation.
   * Format: %H:%M:%S%.f
   *
   * # Examples
   *
   * * `08:59:60.123`
   */
  NaiveTime: { input: any; output: any; }
};

export type AddManagedAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  employeeId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

/**
 * Log a **completed** check-in and check-out for a **past or today** `workDate` when both
 * live punches were missed. Same calendar day only: check-in time must be before check-out.
 */
export type AddManualAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

export type CreateTimesheetEntryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hoursWorked: Scalars['String']['input'];
  projectCode?: InputMaybe<Scalars['String']['input']>;
  workDate: Scalars['NaiveDate']['input'];
};

/** Optional client GPS (browser / mobile) for the **current** punch (in or out). */
export type PunchTodayInput = {
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateManagedAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  expectedUpdatedAt: Scalars['DateTime']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

/** Update an existing completed attendance segment after client-side review. */
export type UpdateManualAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  id: Scalars['ID']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

export type UpdateTimesheetEntryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hoursWorked: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  projectCode?: InputMaybe<Scalars['String']['input']>;
  workDate: Scalars['NaiveDate']['input'];
};

export type UpsertAttendanceAdjustmentPolicyInput = {
  maxSelfAdjustDays: Scalars['Int']['input'];
};

export type UpsertAttendancePunchPolicyInput = {
  ipAllowlist?: InputMaybe<Scalars['String']['input']>;
  isEnforced: Scalars['Boolean']['input'];
  maxDistanceMeters?: InputMaybe<Scalars['Int']['input']>;
  siteLatitude?: InputMaybe<Scalars['Float']['input']>;
  siteLongitude?: InputMaybe<Scalars['Float']['input']>;
};

export type UpsertHolidayCalendarInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  locationId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type UpsertHolidayDayInput = {
  calendarId: Scalars['ID']['input'];
  holidayDate: Scalars['NaiveDate']['input'];
  holidayType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type UpsertTimesheetLockPolicyInput = {
  editableWeekSpan: Scalars['Int']['input'];
  lockApprovedEntries: Scalars['Boolean']['input'];
};

export type MyAttendanceBoardQueryVariables = Exact<{
  fromDate: Scalars['NaiveDate']['input'];
  toDate: Scalars['NaiveDate']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyAttendanceBoardQuery = { __typename?: 'QueryRoot', shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: any | null, endTime?: any | null, workHours?: number | null, isNightShift: boolean }>, myAttendanceSummary: { __typename?: 'AttendancePeriodSummary', completedMinutes: number, workedDays: number, averageMinutes?: number | null, incompleteSegments: number }, myAttendance: { __typename?: 'AttendanceConnection', edges: Array<{ __typename?: 'AttendanceEdge', cursor: string, node: { __typename?: 'Attendance', id: string, employeeId: string, workDate: any, checkInAt?: any | null, checkOutAt?: any | null, checkInTime?: any | null, checkOutTime?: any | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, status?: string | null, source?: string | null, lateMinutes?: number | null } }>, pageInfo: { __typename?: 'AttendancePageInfo', endCursor?: string | null, hasNextPage: boolean } } };


export const MyAttendanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAttendanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workHours"}},{"kind":"Field","name":{"kind":"Name","value":"isNightShift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myAttendanceSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"workedDays"}},{"kind":"Field","name":{"kind":"Name","value":"averageMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"incompleteSegments"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myAttendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"lateMinutes"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<MyAttendanceBoardQuery, MyAttendanceBoardQueryVariables>;