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
   * The `_Any` scalar is used to pass representations of entities from external
   * services into the root `_entities` field for execution.
   */
  _Any: { input: any; output: any; }
};

export type AssignEmployeeLocationInput = {
  effectiveDate: Scalars['NaiveDate']['input'];
  employeeId: Scalars['ID']['input'];
  expectedRevision: Scalars['Int']['input'];
  locationId?: InputMaybe<Scalars['ID']['input']>;
};

export type ConfirmPrejoiningInput = {
  candidateId: Scalars['ID']['input'];
  dateOfJoining: Scalars['NaiveDate']['input'];
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employeeCode: Scalars['String']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  initialPassword: Scalars['String']['input'];
  reportingManagerId?: InputMaybe<Scalars['ID']['input']>;
  revision: Scalars['Int']['input'];
  roleIds: Array<Scalars['ID']['input']>;
  username: Scalars['String']['input'];
};

export type CreateCompanyDocumentInput = {
  category: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  stagedUploadId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  visibleToEmployees?: Scalars['Boolean']['input'];
};

export type CreateEmployeeInput = {
  dateOfJoining: Scalars['NaiveDate']['input'];
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employeeCode: Scalars['String']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  loginAccount?: InputMaybe<EmployeeLoginAccountInput>;
  /** Must be another active employee in the tenant; cannot be self (enforced after id is chosen). */
  reportingManagerId?: InputMaybe<Scalars['ID']['input']>;
  /** Defaults to `ACTIVE` when omitted. */
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type EmployeeLoginAccountInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  initialPassword: Scalars['String']['input'];
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  username: Scalars['String']['input'];
};

/** Page + per_page input. Clamp with `clamp()` before use. */
export type PageInput = {
  page?: Scalars['Int']['input'];
  perPage?: Scalars['Int']['input'];
};

export type PermissionScopeAssignmentInput = {
  action: Scalars['String']['input'];
  resource: Scalars['String']['input'];
  scopeType: Scalars['String']['input'];
};

export type ProvisionEmployeeLoginInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  initialPassword: Scalars['String']['input'];
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  username: Scalars['String']['input'];
};

export type ResetEmployeePasswordInput = {
  employeeId: Scalars['ID']['input'];
  newPassword: Scalars['String']['input'];
};

export type SaveCompanyLocationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  expectedUpdatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
};

export type SetEmployeeCompensationInput = {
  changeReason?: InputMaybe<Scalars['String']['input']>;
  effectiveFrom: Scalars['NaiveDate']['input'];
  employeeId: Scalars['ID']['input'];
  /** Monthly gross (BASIC) for payroll — must match Decimal string (e.g. `65000` or `65000.00`). */
  monthlySalary: Scalars['String']['input'];
};

export type SetEmployeeEsicNumberInput = {
  employeeId: Scalars['ID']['input'];
  /** Exactly 10 digits, or an empty string to explicitly clear the stored number. */
  esicNumber: Scalars['String']['input'];
};

export type SetEmployeeUanNumberInput = {
  employeeId: Scalars['ID']['input'];
  /** Exactly 12 digits, or an empty string to explicitly clear the stored number. */
  uanNumber: Scalars['String']['input'];
};

export type SubmitEmployeeProfileChangeInput = {
  aadhaarNumber?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  accountType?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  ifscCode?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  panNumber?: InputMaybe<Scalars['String']['input']>;
  requestType: Scalars['String']['input'];
  supportingDocumentId?: InputMaybe<Scalars['ID']['input']>;
};

export type SubmitSeparationInput = {
  /** When omitted, the JWT-linked employee is used (self-service exit request). */
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  lastWorkingDate: Scalars['NaiveDate']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  resignationDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  separationType: Scalars['String']['input'];
};

export type UpdateEmployeeInput = {
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employmentType?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Optional linked login email. Omit to leave unchanged; pass an empty string to clear it. */
  linkedUserEmail?: InputMaybe<Scalars['String']['input']>;
  /** Omitted = leave unchanged; `null` = clear manager; id = set manager (cycle-safe). */
  reportingManagerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateEmployeePersonalProfileInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyContactRelation?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  maritalStatus?: InputMaybe<Scalars['String']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmployeeSelfServiceProfileInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyContactRelation?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  maritalStatus?: InputMaybe<Scalars['String']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  personalPhone?: InputMaybe<Scalars['String']['input']>;
};

export type UploadCompanyDocumentFileInput = {
  /** Standard base64 (not data-URL). Max ~6MB decoded. */
  contentBase64: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type UploadEmployeeDocumentInput = {
  /** Standard base64 (not data-URL). Max ~6MB decoded. */
  contentBase64: Scalars['String']['input'];
  documentTypeId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type UploadTenantFileInput = {
  /** Standard base64 (not data-URL). Max ~6MB decoded. */
  contentBase64: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertEmployeeEducationInput = {
  boardUniversity?: InputMaybe<Scalars['String']['input']>;
  completionYear: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  educationLevel: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  fieldOfStudy?: InputMaybe<Scalars['String']['input']>;
  gradeScore?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  institution: Scalars['String']['input'];
  qualification: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type UpsertEmployeePrimaryAadhaarInput = {
  /** Last 4 digits, or full 12-digit number (spaces allowed); only last 4 are stored. */
  aadhaarNumber: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
};

export type UpsertEmployeePrimaryBankInput = {
  accountNumber: Scalars['String']['input'];
  accountType?: InputMaybe<Scalars['String']['input']>;
  bankName: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  ifscCode: Scalars['String']['input'];
};

export type UpsertEmployeePrimaryPanInput = {
  employeeId: Scalars['ID']['input'];
  /** 10-character Indian PAN (letters + digits), case-insensitive. */
  panNumber: Scalars['String']['input'];
};

export type UpsertEmployeeWorkExperienceInput = {
  company: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isCurrent: Scalars['Boolean']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  roleTitle: Scalars['String']['input'];
  startDate: Scalars['NaiveDate']['input'];
};

export type OrganizationEmployeeChartQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationEmployeeChartQuery = { __typename?: 'QueryRoot', organizationDirectoryChart: Array<{ __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, reportingManagerId?: string | null, reportingManagerName?: string | null, reportingManagerPrincipalId?: string | null, reportingManagerTenantId?: string | null, reportingManagerOrganizationManaged: boolean, departmentName?: string | null, designationTitle?: string | null }> };

export type OrganizationEmployeeDirectoryQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrganizationEmployeeDirectoryQuery = { __typename?: 'QueryRoot', employeeDirectoryPage: { __typename?: 'EmployeeDirectoryPage', nextCursor?: string | null, hasMore: boolean, rows: Array<{ __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: string, departmentName?: string | null, designationTitle?: string | null, reportingManagerId?: string | null, reportingManagerName?: string | null, reportingManagerPrincipalId?: string | null, reportingManagerTenantId?: string | null, reportingManagerOrganizationManaged: boolean }> } };

export type OrganizationEmployeeAccessQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type OrganizationEmployeeAccessQuery = { __typename?: 'QueryRoot', employeeProfileAccess?: { __typename?: 'EmployeeProfileAccess', isSelf: boolean, canViewPrivateProfile: boolean, canViewPayrollSensitive: boolean, canEditPersonalProfile: boolean, canManageOrganizationFields: boolean, canReviewProfileChanges: boolean, directoryEntry: { __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: string, departmentName?: string | null, designationTitle?: string | null, reportingManagerId?: string | null, reportingManagerName?: string | null, reportingManagerPrincipalId?: string | null, reportingManagerTenantId?: string | null, reportingManagerOrganizationManaged: boolean } } | null };

export type OrganizationEmployeeAdminListQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type OrganizationEmployeeAdminListQuery = { __typename?: 'QueryRoot', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: string, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null, reportingManagerPrincipalId?: string | null, reportingManagerTenantId?: string | null, reportingManagerOrganizationManaged: boolean }> };

export type OrganizationEmployeePrivateProfileQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type OrganizationEmployeePrivateProfileQuery = { __typename?: 'QueryRoot', employee?: { __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: string, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, locationId?: string | null, locationName?: string | null, locationAssignmentEffectiveFrom?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null, personalPhone?: string | null, currentAddress?: string | null, permanentAddress?: string | null, dateOfBirth?: string | null, gender?: string | null, maritalStatus?: string | null, nationality?: string | null, bloodGroup?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null, createdAt: string, updatedAt: string, reportingManagerPrincipalId?: string | null, reportingManagerTenantId?: string | null, reportingManagerOrganizationManaged: boolean } | null, employeeDocuments: Array<{ __typename?: 'EmployeeDocument', id: string, documentTypeId: string, status: string, uploadedAt: string, originalFileName?: string | null, mimeType?: string | null, uploadedByUserId?: string | null, documentTypeName?: string | null, documentTypeCategory?: string | null }>, documentTypes: Array<{ __typename?: 'DocumentType', id: string, name: string, category?: string | null, systemKey?: string | null }>, employeePrimaryBank?: { __typename?: 'EmployeeBankAccount', id: string, bankName: string, accountNumberMasked: string, ifscCode: string, accountType?: string | null, isVerified: boolean } | null, employeeIdentityProfile: { __typename?: 'EmployeeIdentityProfile', pan?: { __typename?: 'EmployeePanRecord', id: string, maskedPan: string, isVerified: boolean } | null, aadhaar?: { __typename?: 'EmployeeAadhaarRecord', id: string, maskedAadhaar: string, isVerified: boolean } | null }, employeeProfileChangeRequests: Array<{ __typename?: 'EmployeeProfileChangeRequest', id: string, requestType: string, status: string, requestedSummary: string, supportingDocumentId?: string | null, reviewedAt?: string | null, rejectionReason?: string | null, createdAt: string, updatedAt: string }>, employeeEducationRecords: Array<{ __typename?: 'EmployeeEducation', id: string, employeeId: string, educationLevel: string, qualification: string, fieldOfStudy?: string | null, institution: string, boardUniversity?: string | null, startDate?: string | null, completionYear: number, gradeScore?: string | null, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: string }>, employeeWorkExperienceRecords: Array<{ __typename?: 'EmployeeWorkExperience', id: string, employeeId: string, company: string, roleTitle: string, employmentType?: string | null, location?: string | null, startDate: string, endDate?: string | null, isCurrent: boolean, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: string }> };


export const OrganizationEmployeeChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationEmployeeChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationDirectoryChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerPrincipalId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerTenantId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerOrganizationManaged"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}}]}}]}}]} as unknown as DocumentNode<OrganizationEmployeeChartQuery, OrganizationEmployeeChartQueryVariables>;
export const OrganizationEmployeeDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationEmployeeDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeDirectoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerPrincipalId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerTenantId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerOrganizationManaged"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}}]} as unknown as DocumentNode<OrganizationEmployeeDirectoryQuery, OrganizationEmployeeDirectoryQueryVariables>;
export const OrganizationEmployeeAccessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationEmployeeAccess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeProfileAccess"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"canViewPrivateProfile"}},{"kind":"Field","name":{"kind":"Name","value":"canViewPayrollSensitive"}},{"kind":"Field","name":{"kind":"Name","value":"canEditPersonalProfile"}},{"kind":"Field","name":{"kind":"Name","value":"canManageOrganizationFields"}},{"kind":"Field","name":{"kind":"Name","value":"canReviewProfileChanges"}},{"kind":"Field","name":{"kind":"Name","value":"directoryEntry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerPrincipalId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerTenantId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerOrganizationManaged"}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationEmployeeAccessQuery, OrganizationEmployeeAccessQueryVariables>;
export const OrganizationEmployeeAdminListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationEmployeeAdminList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerPrincipalId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerTenantId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerOrganizationManaged"}}]}}]}}]} as unknown as DocumentNode<OrganizationEmployeeAdminListQuery, OrganizationEmployeeAdminListQueryVariables>;
export const OrganizationEmployeePrivateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationEmployeePrivateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"locationAssignmentEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"personalPhone"}},{"kind":"Field","name":{"kind":"Name","value":"currentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"permanentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"maritalStatus"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerPrincipalId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerTenantId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerOrganizationManaged"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeCategory"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documentTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"systemKey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeePrimaryBank"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumberMasked"}},{"kind":"Field","name":{"kind":"Name","value":"ifscCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeIdentityProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedPan"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"aadhaar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedAadhaar"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeProfileChangeRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeEducationRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"educationLevel"}},{"kind":"Field","name":{"kind":"Name","value":"qualification"}},{"kind":"Field","name":{"kind":"Name","value":"fieldOfStudy"}},{"kind":"Field","name":{"kind":"Name","value":"institution"}},{"kind":"Field","name":{"kind":"Name","value":"boardUniversity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"completionYear"}},{"kind":"Field","name":{"kind":"Name","value":"gradeScore"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeWorkExperienceRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"roleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<OrganizationEmployeePrivateProfileQuery, OrganizationEmployeePrivateProfileQueryVariables>;