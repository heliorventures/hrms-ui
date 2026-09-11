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
   * ISO 8601 time without timezone.
   * Allows for the nanosecond precision and optional leap second representation.
   * Format: %H:%M:%S%.f
   *
   * # Examples
   *
   * * `08:59:60.123`
   */
  NaiveTime: { input: string; output: string; }
};

export type AddManagedAttendanceSegmentInput = {
  checkInDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkOutTime: Scalars['NaiveTime']['input'];
  employeeId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

/**
 * Log a completed interval inside a historical/current attendance window.
 * Supply both actual dates for after-midnight or otherwise ambiguous wall times.
 */
export type AddManualAttendanceSegmentInput = {
  checkInDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutDate?: InputMaybe<Scalars['NaiveDate']['input']>;
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

export type ScheduleAttendanceDayPolicyInput = {
  /** Tenant-local time in strict HH:mm format. */
  boundaryTime: Scalars['String']['input'];
  effectiveWorkDate: Scalars['NaiveDate']['input'];
  expectedRevision: Scalars['Int']['input'];
};

export type UpdateManagedAttendanceSegmentInput = {
  checkInDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkOutTime: Scalars['NaiveTime']['input'];
  expectedUpdatedAt: Scalars['DateTime']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

/** Correct the original completed or incomplete segment after client-side review. */
export type UpdateManualAttendanceSegmentInput = {
  checkInDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutDate?: InputMaybe<Scalars['NaiveDate']['input']>;
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


export type MyAttendanceBoardQuery = { __typename?: 'QueryRoot', shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: string | null, endTime?: string | null, workHours?: number | null, isNightShift: boolean }>, myAttendanceSummary: { __typename?: 'AttendancePeriodSummary', completedMinutes: number, workedDays: number, averageMinutes?: number | null, incompleteSegments: number }, myAttendance: { __typename?: 'AttendanceConnection', edges: Array<{ __typename?: 'AttendanceEdge', cursor: string, node: { __typename?: 'Attendance', id: string, employeeId: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, status?: string | null, source?: string | null, lateMinutes?: number | null } }>, pageInfo: { __typename?: 'AttendancePageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type AttendanceCurrentDayWindowQueryVariables = Exact<{ [key: string]: never; }>;


export type AttendanceCurrentDayWindowQuery = { __typename?: 'QueryRoot', attendanceDayWindow: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number } };

export type AttendanceCorrectionWindowsQueryVariables = Exact<{
  workDate: Scalars['NaiveDate']['input'];
}>;


export type AttendanceCorrectionWindowsQuery = { __typename?: 'QueryRoot', currentWindow: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number }, selectedWindow: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number } };

export type AttendancePolicySettingsQueryVariables = Exact<{
  slim?: Scalars['Int']['input'];
}>;


export type AttendancePolicySettingsQuery = { __typename?: 'QueryRoot', attendanceDayPolicy: { __typename?: 'AttendanceDayPolicy', revision: number, initialized: boolean, legacyActivationPending: boolean, legacyActivationDate?: string | null, currentPolicy: { __typename?: 'AttendanceDayPolicyVersion', effectiveWorkDate: string, boundaryMinutes: number, timezone: string }, pendingPolicy?: { __typename?: 'AttendanceDayPolicyVersion', effectiveWorkDate: string, boundaryMinutes: number, timezone: string } | null, currentWindow: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number } }, attendancePunchPolicy: { __typename?: 'AttendancePunchPolicy', id?: string | null, tenantId: string, isEnforced: boolean, siteLatitude?: number | null, siteLongitude?: number | null, maxDistanceMeters?: number | null, ipAllowlist?: string | null, updatedAt?: string | null }, shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: string | null, endTime?: string | null, workHours?: number | null, isNightShift: boolean }> };

export type PreviewAttendanceDayPolicyQueryVariables = Exact<{
  input: ScheduleAttendanceDayPolicyInput;
}>;


export type PreviewAttendanceDayPolicyQuery = { __typename?: 'QueryRoot', previewAttendanceDayPolicy: { __typename?: 'AttendanceDayPolicyPreview', revision: number, transition: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number }, following: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number } } };

export type ScheduleAttendanceDayPolicyMutationVariables = Exact<{
  input: ScheduleAttendanceDayPolicyInput;
}>;


export type ScheduleAttendanceDayPolicyMutation = { __typename?: 'MutationRoot', scheduleAttendanceDayPolicy: { __typename?: 'AttendanceDayPolicy', revision: number, initialized: boolean, legacyActivationPending: boolean, legacyActivationDate?: string | null, currentPolicy: { __typename?: 'AttendanceDayPolicyVersion', effectiveWorkDate: string, boundaryMinutes: number, timezone: string }, pendingPolicy?: { __typename?: 'AttendanceDayPolicyVersion', effectiveWorkDate: string, boundaryMinutes: number, timezone: string } | null, currentWindow: { __typename?: 'AttendanceDayWindow', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number } } };

export type AttendancePunchDaySummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type AttendancePunchDaySummaryQuery = { __typename?: 'QueryRoot', punchDaySummary: { __typename?: 'PunchDaySummary', workDate: string, startsAt: string, endsAt: string, timezone: string, boundaryMinutes: number, totalWorkedMinutes: number, openSegment?: { __typename?: 'Attendance', id: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null } | null, segments: Array<{ __typename?: 'Attendance', id: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null }> } };

export type AttendancePunchTodayMutationVariables = Exact<{
  input?: InputMaybe<PunchTodayInput>;
}>;


export type AttendancePunchTodayMutation = { __typename?: 'MutationRoot', punchToday: { __typename?: 'Attendance', id: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null } };

export type AttendanceAddManualSegmentMutationVariables = Exact<{
  input: AddManualAttendanceSegmentInput;
}>;


export type AttendanceAddManualSegmentMutation = { __typename?: 'MutationRoot', addManualAttendanceSegment: { __typename?: 'Attendance', id: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, source?: string | null, status?: string | null } };

export type AttendanceUpdateManualSegmentMutationVariables = Exact<{
  input: UpdateManualAttendanceSegmentInput;
}>;


export type AttendanceUpdateManualSegmentMutation = { __typename?: 'MutationRoot', updateManualAttendanceSegment: { __typename?: 'Attendance', id: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, source?: string | null, status?: string | null } };

export type AttendanceAddManagedSegmentMutationVariables = Exact<{
  input: AddManagedAttendanceSegmentInput;
}>;


export type AttendanceAddManagedSegmentMutation = { __typename?: 'MutationRoot', addManagedAttendanceSegment: { __typename?: 'ManagedAttendance', id: string, employeeId: string, employeeName: string, employeeCode: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, status?: string | null, source?: string | null, regularizationStatus?: string | null, createdAt: string, updatedAt: string } };

export type AttendanceUpdateManagedSegmentMutationVariables = Exact<{
  input: UpdateManagedAttendanceSegmentInput;
}>;


export type AttendanceUpdateManagedSegmentMutation = { __typename?: 'MutationRoot', updateManagedAttendanceSegment: { __typename?: 'ManagedAttendance', id: string, employeeId: string, employeeName: string, employeeCode: string, workDate: string, checkInAt?: string | null, checkOutAt?: string | null, checkInTime?: string | null, checkOutTime?: string | null, status?: string | null, source?: string | null, regularizationStatus?: string | null, createdAt: string, updatedAt: string } };


export const MyAttendanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAttendanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workHours"}},{"kind":"Field","name":{"kind":"Name","value":"isNightShift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myAttendanceSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"workedDays"}},{"kind":"Field","name":{"kind":"Name","value":"averageMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"incompleteSegments"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myAttendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"lateMinutes"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<MyAttendanceBoardQuery, MyAttendanceBoardQueryVariables>;
export const AttendanceCurrentDayWindowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceCurrentDayWindow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attendanceDayWindow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}}]}}]} as unknown as DocumentNode<AttendanceCurrentDayWindowQuery, AttendanceCurrentDayWindowQueryVariables>;
export const AttendanceCorrectionWindowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceCorrectionWindows"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"currentWindow"},"name":{"kind":"Name","value":"attendanceDayWindow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedWindow"},"name":{"kind":"Name","value":"attendanceDayWindow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}}]}}]} as unknown as DocumentNode<AttendanceCorrectionWindowsQuery, AttendanceCorrectionWindowsQueryVariables>;
export const AttendancePolicySettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendancePolicySettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attendanceDayPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"initialized"}},{"kind":"Field","name":{"kind":"Name","value":"legacyActivationPending"}},{"kind":"Field","name":{"kind":"Name","value":"legacyActivationDate"}},{"kind":"Field","name":{"kind":"Name","value":"currentPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"effectiveWorkDate"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"effectiveWorkDate"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentWindow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attendancePunchPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"isEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"siteLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"siteLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"maxDistanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"ipAllowlist"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workHours"}},{"kind":"Field","name":{"kind":"Name","value":"isNightShift"}}]}}]}}]} as unknown as DocumentNode<AttendancePolicySettingsQuery, AttendancePolicySettingsQueryVariables>;
export const PreviewAttendanceDayPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewAttendanceDayPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleAttendanceDayPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewAttendanceDayPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"transition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"following"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewAttendanceDayPolicyQuery, PreviewAttendanceDayPolicyQueryVariables>;
export const ScheduleAttendanceDayPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScheduleAttendanceDayPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleAttendanceDayPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleAttendanceDayPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"initialized"}},{"kind":"Field","name":{"kind":"Name","value":"legacyActivationPending"}},{"kind":"Field","name":{"kind":"Name","value":"legacyActivationDate"}},{"kind":"Field","name":{"kind":"Name","value":"currentPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"effectiveWorkDate"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"effectiveWorkDate"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentWindow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}}]}}]}}]}}]} as unknown as DocumentNode<ScheduleAttendanceDayPolicyMutation, ScheduleAttendanceDayPolicyMutationVariables>;
export const AttendancePunchDaySummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendancePunchDaySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"punchDaySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"boundaryMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"totalWorkedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"openSegment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<AttendancePunchDaySummaryQuery, AttendancePunchDaySummaryQueryVariables>;
export const AttendancePunchTodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttendancePunchToday"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PunchTodayInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"punchToday"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AttendancePunchTodayMutation, AttendancePunchTodayMutationVariables>;
export const AttendanceAddManualSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttendanceAddManualSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddManualAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addManualAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AttendanceAddManualSegmentMutation, AttendanceAddManualSegmentMutationVariables>;
export const AttendanceUpdateManualSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttendanceUpdateManualSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateManualAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateManualAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AttendanceUpdateManualSegmentMutation, AttendanceUpdateManualSegmentMutationVariables>;
export const AttendanceAddManagedSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttendanceAddManagedSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddManagedAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addManagedAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"regularizationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AttendanceAddManagedSegmentMutation, AttendanceAddManagedSegmentMutationVariables>;
export const AttendanceUpdateManagedSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttendanceUpdateManagedSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateManagedAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateManagedAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"regularizationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AttendanceUpdateManagedSegmentMutation, AttendanceUpdateManagedSegmentMutationVariables>;