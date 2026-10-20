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

export enum EmployeeScope {
  All = 'ALL',
  Department = 'DEPARTMENT',
  SelfOnly = 'SELF_ONLY',
  Team = 'TEAM'
}

export type OrganizationCommandInput = {
  commandId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  operation: OrganizationOperation;
  payload: Scalars['JSON']['input'];
  resourceId: Scalars['UUID']['input'];
};

export enum OrganizationConfigurationKind {
  Bindings = 'BINDINGS',
  Companies = 'COMPANIES',
  Roles = 'ROLES'
}

export enum OrganizationOperation {
  AccountAccess = 'ACCOUNT_ACCESS',
  AccountCreate = 'ACCOUNT_CREATE',
  AccountList = 'ACCOUNT_LIST',
  AccountRoles = 'ACCOUNT_ROLES',
  AccountUpdate = 'ACCOUNT_UPDATE',
  CancelCommand = 'CANCEL_COMMAND',
  ClearanceUpdate = 'CLEARANCE_UPDATE',
  Directory = 'DIRECTORY',
  EmployeeCreate = 'EMPLOYEE_CREATE',
  EmployeeDetail = 'EMPLOYEE_DETAIL',
  EmployeeEmployment = 'EMPLOYEE_EMPLOYMENT',
  EmployeeList = 'EMPLOYEE_LIST',
  EmployeeLoginProvision = 'EMPLOYEE_LOGIN_PROVISION',
  EmployeeReferences = 'EMPLOYEE_REFERENCES',
  EmployeeUpdate = 'EMPLOYEE_UPDATE',
  FeedbackCreate = 'FEEDBACK_CREATE',
  InstallGrant = 'INSTALL_GRANT',
  InstallMembership = 'INSTALL_MEMBERSHIP',
  InstallRelationship = 'INSTALL_RELATIONSHIP',
  LeaveDecision = 'LEAVE_DECISION',
  LeaveDetail = 'LEAVE_DETAIL',
  PayrollDetail = 'PAYROLL_DETAIL',
  PayrollDraft = 'PAYROLL_DRAFT',
  PayrollFinalize = 'PAYROLL_FINALIZE',
  PayrollJobCancelBeforeExecution = 'PAYROLL_JOB_CANCEL_BEFORE_EXECUTION',
  PayrollJobDetail = 'PAYROLL_JOB_DETAIL',
  PayrollJobList = 'PAYROLL_JOB_LIST',
  PayrollList = 'PAYROLL_LIST',
  ReadReceipt = 'READ_RECEIPT',
  ReviewDetail = 'REVIEW_DETAIL',
  ReviewSubmit = 'REVIEW_SUBMIT',
  SeparationCancelApproval = 'SEPARATION_CANCEL_APPROVAL',
  SeparationCreate = 'SEPARATION_CREATE',
  SeparationDetail = 'SEPARATION_DETAIL',
  SeparationList = 'SEPARATION_LIST',
  SeparationReject = 'SEPARATION_REJECT',
  TimesheetDecision = 'TIMESHEET_DECISION',
  TimesheetDetail = 'TIMESHEET_DETAIL',
  WorkflowActivation = 'WORKFLOW_ACTIVATION',
  WorkflowDetail = 'WORKFLOW_DETAIL',
  WorkflowList = 'WORKFLOW_LIST',
  WorkflowSave = 'WORKFLOW_SAVE'
}

export type RoleCapability = {
  code: Scalars['String']['input'];
  employeeScope: EmployeeScope;
};

export type OrganizationPageFieldsFragment = { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number };

export type OrganizationOutcomeFieldsFragment = { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown };

export type CancelPendingOrganizationCommandMutationVariables = Exact<{
  commandId: Scalars['UUID']['input'];
}>;


export type CancelPendingOrganizationCommandMutation = { __typename?: 'MutationRoot', cancelPendingOrganizationCommand: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type OrganizationChangeFieldsFragment = { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number };

export type OrganizationWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationWorkspacesQuery = { __typename?: 'QueryRoot', organizationWorkspaces: Array<{ __typename?: 'OrganizationWorkspace', id: string, name: string, version: number, canManage: boolean, canDelegate: boolean, canApprove: boolean, canReview: boolean, canReport: boolean, canHistory: boolean, canPayroll: boolean }> };

export type OrganizationIdentityQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationIdentityQuery = { __typename?: 'QueryRoot', myOrganizationIdentity: { __typename?: 'OrganizationIdentity', principalId: string, loginLinkId: string, loginLinkVersion: number } };

export type OrganizationAuditHistoryQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationAuditHistoryQuery = { __typename?: 'QueryRoot', organizationAuditHistory: unknown };

export type OrganizationCompaniesQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
}>;


export type OrganizationCompaniesQuery = { __typename?: 'QueryRoot', organizationCompanies: Array<{ __typename?: 'OrganizationCompany', membershipId: string, tenantId: string, name: string, status: string, version: number, capabilities: Array<string>, runtimeStatus: string, installedVersion?: number | null, directorySyncStatus: string }> };

export type OrganizationInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationInvitationsQuery = { __typename?: 'QueryRoot', organizationInvitations: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type OrganizationConfigurationQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  kind: OrganizationConfigurationKind;
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationConfigurationQuery = { __typename?: 'QueryRoot', organizationConfiguration: { __typename?: 'OrganizationConfigurationPage', schemaVersion: number, items: unknown, nextCursor?: string | null, organizationVersion: number } };

export type OrganizationCapabilityCatalogQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationCapabilityCatalogQuery = { __typename?: 'QueryRoot', organizationCapabilityCatalog: Array<string> };

export type OrganizationDirectoryQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationDirectoryQuery = { __typename?: 'QueryRoot', organizationDirectory: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type OrganizationRelationshipsQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationRelationshipsQuery = { __typename?: 'QueryRoot', organizationRelationships: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type OrganizationApprovalsQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId?: InputMaybe<Scalars['UUID']['input']>;
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationApprovalsQuery = { __typename?: 'QueryRoot', organizationApprovals: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type OrganizationTeamQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId?: InputMaybe<Scalars['UUID']['input']>;
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationTeamQuery = { __typename?: 'QueryRoot', organizationTeam: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type OrganizationResourceQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  operation: OrganizationOperation;
  resourceId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
}>;


export type OrganizationResourceQuery = { __typename?: 'QueryRoot', organizationResource: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type OrganizationCommandStatusQueryVariables = Exact<{
  commandId: Scalars['UUID']['input'];
}>;


export type OrganizationCommandStatusQuery = { __typename?: 'QueryRoot', organizationCommandStatus: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type OrganizationProgressQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipIds?: InputMaybe<Array<Scalars['UUID']['input']> | Scalars['UUID']['input']>;
  from: Scalars['NaiveDate']['input'];
  to: Scalars['NaiveDate']['input'];
}>;


export type OrganizationProgressQuery = { __typename?: 'QueryRoot', organizationProgress: unknown };

export type OrganizationOperationalProgressQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipIds?: InputMaybe<Array<Scalars['UUID']['input']> | Scalars['UUID']['input']>;
  from: Scalars['NaiveDate']['input'];
  to: Scalars['NaiveDate']['input'];
}>;


export type OrganizationOperationalProgressQuery = { __typename?: 'QueryRoot', organizationOperationalProgress: unknown };

export type ExportOrganizationHistoryArchiveMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  archiveId: Scalars['UUID']['input'];
  from: Scalars['DateTime']['input'];
  through: Scalars['DateTime']['input'];
}>;


export type ExportOrganizationHistoryArchiveMutation = { __typename?: 'MutationRoot', exportOrganizationHistoryArchive: unknown };

export type OrganizationHistoryArchiveQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  archiveId: Scalars['UUID']['input'];
}>;


export type OrganizationHistoryArchiveQuery = { __typename?: 'QueryRoot', organizationHistoryArchive: unknown };

export type OrganizationHistoryQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipIds?: InputMaybe<Array<Scalars['UUID']['input']> | Scalars['UUID']['input']>;
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationHistoryQuery = { __typename?: 'QueryRoot', organizationHistory: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type ExecuteOrganizationCommandMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  command: OrganizationCommandInput;
}>;


export type ExecuteOrganizationCommandMutation = { __typename?: 'MutationRoot', executeOrganizationCommand: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type RegisterOrganizationIdentityMutationVariables = Exact<{ [key: string]: never; }>;


export type RegisterOrganizationIdentityMutation = { __typename?: 'MutationRoot', registerOrganizationIdentity: string };

export type RevokeOrganizationIdentityMutationVariables = Exact<{
  expectedLinkVersion: Scalars['Int']['input'];
}>;


export type RevokeOrganizationIdentityMutation = { __typename?: 'MutationRoot', revokeMyOrganizationIdentity: string };

export type InviteOrganizationCompanyMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  tenantId: Scalars['UUID']['input'];
}>;


export type InviteOrganizationCompanyMutation = { __typename?: 'MutationRoot', inviteOrganizationCompany: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type AcceptOrganizationCompanyMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  membershipId: Scalars['UUID']['input'];
  expectedMembershipVersion: Scalars['Int']['input'];
}>;


export type AcceptOrganizationCompanyMutation = { __typename?: 'MutationRoot', acceptOrganizationCompany: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type SuspendOrganizationCompanyMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  membershipId: Scalars['UUID']['input'];
  expectedMembershipVersion: Scalars['Int']['input'];
}>;


export type SuspendOrganizationCompanyMutation = { __typename?: 'MutationRoot', suspendOrganizationCompany: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type ResumeOrganizationCompanyMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  membershipId: Scalars['UUID']['input'];
  expectedMembershipVersion: Scalars['Int']['input'];
}>;


export type ResumeOrganizationCompanyMutation = { __typename?: 'MutationRoot', resumeOrganizationCompany: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type BeginOrganizationCompanyDetachMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  membershipId: Scalars['UUID']['input'];
  expectedMembershipVersion: Scalars['Int']['input'];
}>;


export type BeginOrganizationCompanyDetachMutation = { __typename?: 'MutationRoot', beginOrganizationCompanyDetach: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type InstallOrganizationMembershipMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  commandId: Scalars['UUID']['input'];
}>;


export type InstallOrganizationMembershipMutation = { __typename?: 'MutationRoot', installOrganizationMembership: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type CreateOrganizationRoleMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  capabilities: Array<RoleCapability> | RoleCapability;
}>;


export type CreateOrganizationRoleMutation = { __typename?: 'MutationRoot', createOrganizationRole: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type ReplaceOrganizationRoleMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  roleId: Scalars['UUID']['input'];
  expectedRoleVersion: Scalars['Int']['input'];
  capabilities: Array<RoleCapability> | RoleCapability;
}>;


export type ReplaceOrganizationRoleMutation = { __typename?: 'MutationRoot', replaceOrganizationRoleCapabilities: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type GrantOrganizationRoleMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  principalId: Scalars['UUID']['input'];
  roleId: Scalars['UUID']['input'];
  companyMembershipIds: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
}>;


export type GrantOrganizationRoleMutation = { __typename?: 'MutationRoot', grantOrganizationRole: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type RevokeOrganizationRoleMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  bindingId: Scalars['UUID']['input'];
  expectedBindingVersion: Scalars['Int']['input'];
}>;


export type RevokeOrganizationRoleMutation = { __typename?: 'MutationRoot', revokeOrganizationRoleBinding: { __typename?: 'ChangeResult', id: string, status: string, version: number, organizationVersion: number } };

export type InstallOrganizationGrantMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  bindingId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  commandId: Scalars['UUID']['input'];
}>;


export type InstallOrganizationGrantMutation = { __typename?: 'MutationRoot', installOrganizationGrant: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type SyncOrganizationDirectoryMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SyncOrganizationDirectoryMutation = { __typename?: 'MutationRoot', syncOrganizationDirectory: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export type ProposeOrganizationRelationshipMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  expectedGraphVersion: Scalars['Int']['input'];
  subjectEmploymentRefId: Scalars['UUID']['input'];
  managerEmploymentRefId: Scalars['UUID']['input'];
  relationshipType: Scalars['String']['input'];
  effectiveFrom: Scalars['DateTime']['input'];
  effectiveTo?: InputMaybe<Scalars['DateTime']['input']>;
  capabilities: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ProposeOrganizationRelationshipMutation = { __typename?: 'MutationRoot', proposeOrganizationRelationship: unknown };

export type EndOrganizationRelationshipMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  assignmentId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  expectedGraphVersion: Scalars['Int']['input'];
}>;


export type EndOrganizationRelationshipMutation = { __typename?: 'MutationRoot', endOrganizationRelationship: unknown };

export type ChangeOrganizationRelationshipManagerMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  assignmentId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  expectedGraphVersion: Scalars['Int']['input'];
  managerEmploymentRefId: Scalars['UUID']['input'];
}>;


export type ChangeOrganizationRelationshipManagerMutation = { __typename?: 'MutationRoot', changeOrganizationRelationshipManager: unknown };

export type InstallOrganizationRelationshipMutationVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId: Scalars['UUID']['input'];
  assignmentId: Scalars['UUID']['input'];
  expectedVersion: Scalars['Int']['input'];
  commandId: Scalars['UUID']['input'];
}>;


export type InstallOrganizationRelationshipMutation = { __typename?: 'MutationRoot', installOrganizationRelationship: { __typename?: 'CommandOutcome', commandId: string, resourceId: string, status: string, resourceVersion: number, result: unknown } };

export type OrganizationPendingCommandsQueryVariables = Exact<{
  organizationId: Scalars['UUID']['input'];
  membershipId?: InputMaybe<Scalars['UUID']['input']>;
  after?: InputMaybe<Scalars['UUID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganizationPendingCommandsQuery = { __typename?: 'QueryRoot', organizationPendingCommands: { __typename?: 'OrganizationDocumentPage', schemaVersion: number, items: unknown, endCursor?: string | null, hasNextPage: boolean, graphVersion: number } };

export const OrganizationPageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationPageFieldsFragment, unknown>;
export const OrganizationOutcomeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<OrganizationOutcomeFieldsFragment, unknown>;
export const OrganizationChangeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<OrganizationChangeFieldsFragment, unknown>;
export const CancelPendingOrganizationCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelPendingOrganizationCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelPendingOrganizationCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<CancelPendingOrganizationCommandMutation, CancelPendingOrganizationCommandMutationVariables>;
export const OrganizationWorkspacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"canManage"}},{"kind":"Field","name":{"kind":"Name","value":"canDelegate"}},{"kind":"Field","name":{"kind":"Name","value":"canApprove"}},{"kind":"Field","name":{"kind":"Name","value":"canReview"}},{"kind":"Field","name":{"kind":"Name","value":"canReport"}},{"kind":"Field","name":{"kind":"Name","value":"canHistory"}},{"kind":"Field","name":{"kind":"Name","value":"canPayroll"}}]}}]}}]} as unknown as DocumentNode<OrganizationWorkspacesQuery, OrganizationWorkspacesQueryVariables>;
export const OrganizationIdentityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizationIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"principalId"}},{"kind":"Field","name":{"kind":"Name","value":"loginLinkId"}},{"kind":"Field","name":{"kind":"Name","value":"loginLinkVersion"}}]}}]}}]} as unknown as DocumentNode<OrganizationIdentityQuery, OrganizationIdentityQueryVariables>;
export const OrganizationAuditHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationAuditHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationAuditHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}]}]}}]} as unknown as DocumentNode<OrganizationAuditHistoryQuery, OrganizationAuditHistoryQueryVariables>;
export const OrganizationCompaniesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationCompanies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationCompanies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"membershipId"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"runtimeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"installedVersion"}},{"kind":"Field","name":{"kind":"Name","value":"directorySyncStatus"}}]}}]}}]} as unknown as DocumentNode<OrganizationCompaniesQuery, OrganizationCompaniesQueryVariables>;
export const OrganizationInvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationInvitations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationInvitations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationInvitationsQuery, OrganizationInvitationsQueryVariables>;
export const OrganizationConfigurationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationConfiguration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationConfigurationKind"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationConfiguration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]}}]} as unknown as DocumentNode<OrganizationConfigurationQuery, OrganizationConfigurationQueryVariables>;
export const OrganizationCapabilityCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationCapabilityCatalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationCapabilityCatalog"}}]}}]} as unknown as DocumentNode<OrganizationCapabilityCatalogQuery, OrganizationCapabilityCatalogQueryVariables>;
export const OrganizationDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationDirectory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationDirectoryQuery, OrganizationDirectoryQueryVariables>;
export const OrganizationRelationshipsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationRelationships"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationRelationships"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationRelationshipsQuery, OrganizationRelationshipsQueryVariables>;
export const OrganizationApprovalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationApprovals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationApprovals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationApprovalsQuery, OrganizationApprovalsQueryVariables>;
export const OrganizationTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationTeamQuery, OrganizationTeamQueryVariables>;
export const OrganizationResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationOperation"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"operation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operation"}}},{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<OrganizationResourceQuery, OrganizationResourceQueryVariables>;
export const OrganizationCommandStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationCommandStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationCommandStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<OrganizationCommandStatusQuery, OrganizationCommandStatusQueryVariables>;
export const OrganizationProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}]}]}}]} as unknown as DocumentNode<OrganizationProgressQuery, OrganizationProgressQueryVariables>;
export const OrganizationOperationalProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationOperationalProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationOperationalProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}]}]}}]} as unknown as DocumentNode<OrganizationOperationalProgressQuery, OrganizationOperationalProgressQueryVariables>;
export const ExportOrganizationHistoryArchiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExportOrganizationHistoryArchive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"archiveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"through"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportOrganizationHistoryArchive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"archiveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"archiveId"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"through"},"value":{"kind":"Variable","name":{"kind":"Name","value":"through"}}}]}]}}]} as unknown as DocumentNode<ExportOrganizationHistoryArchiveMutation, ExportOrganizationHistoryArchiveMutationVariables>;
export const OrganizationHistoryArchiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationHistoryArchive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"archiveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationHistoryArchive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"archiveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"archiveId"}}}]}]}}]} as unknown as DocumentNode<OrganizationHistoryArchiveQuery, OrganizationHistoryArchiveQueryVariables>;
export const OrganizationHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationHistoryQuery, OrganizationHistoryQueryVariables>;
export const ExecuteOrganizationCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteOrganizationCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationCommandInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeOrganizationCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<ExecuteOrganizationCommandMutation, ExecuteOrganizationCommandMutationVariables>;
export const RegisterOrganizationIdentityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterOrganizationIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOrganizationIdentity"}}]}}]} as unknown as DocumentNode<RegisterOrganizationIdentityMutation, RegisterOrganizationIdentityMutationVariables>;
export const RevokeOrganizationIdentityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeOrganizationIdentity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedLinkVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeMyOrganizationIdentity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expectedLinkVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedLinkVersion"}}}]}]}}]} as unknown as DocumentNode<RevokeOrganizationIdentityMutation, RevokeOrganizationIdentityMutationVariables>;
export const InviteOrganizationCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteOrganizationCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteOrganizationCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<InviteOrganizationCompanyMutation, InviteOrganizationCompanyMutationVariables>;
export const AcceptOrganizationCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptOrganizationCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptOrganizationCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedMembershipVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<AcceptOrganizationCompanyMutation, AcceptOrganizationCompanyMutationVariables>;
export const SuspendOrganizationCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SuspendOrganizationCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suspendOrganizationCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedMembershipVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<SuspendOrganizationCompanyMutation, SuspendOrganizationCompanyMutationVariables>;
export const ResumeOrganizationCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeOrganizationCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeOrganizationCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedMembershipVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<ResumeOrganizationCompanyMutation, ResumeOrganizationCompanyMutationVariables>;
export const BeginOrganizationCompanyDetachDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BeginOrganizationCompanyDetach"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beginOrganizationCompanyDetach"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedMembershipVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedMembershipVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<BeginOrganizationCompanyDetachMutation, BeginOrganizationCompanyDetachMutationVariables>;
export const InstallOrganizationMembershipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallOrganizationMembership"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installOrganizationMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<InstallOrganizationMembershipMutation, InstallOrganizationMembershipMutationVariables>;
export const CreateOrganizationRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganizationRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCapability"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganizationRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"capabilities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<CreateOrganizationRoleMutation, CreateOrganizationRoleMutationVariables>;
export const ReplaceOrganizationRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReplaceOrganizationRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedRoleVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCapability"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceOrganizationRoleCapabilities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedRoleVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedRoleVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"capabilities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<ReplaceOrganizationRoleMutation, ReplaceOrganizationRoleMutationVariables>;
export const GrantOrganizationRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GrantOrganizationRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"principalId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyMembershipIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grantOrganizationRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"principalId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"principalId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"companyMembershipIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyMembershipIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<GrantOrganizationRoleMutation, GrantOrganizationRoleMutationVariables>;
export const RevokeOrganizationRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeOrganizationRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bindingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedBindingVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeOrganizationRoleBinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"bindingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bindingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedBindingVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedBindingVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationChangeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"organizationVersion"}}]}}]} as unknown as DocumentNode<RevokeOrganizationRoleMutation, RevokeOrganizationRoleMutationVariables>;
export const InstallOrganizationGrantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallOrganizationGrant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bindingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installOrganizationGrant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"bindingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bindingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<InstallOrganizationGrantMutation, InstallOrganizationGrantMutationVariables>;
export const SyncOrganizationDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncOrganizationDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncOrganizationDirectory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<SyncOrganizationDirectoryMutation, SyncOrganizationDirectoryMutationVariables>;
export const ProposeOrganizationRelationshipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProposeOrganizationRelationship"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subjectEmploymentRefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"managerEmploymentRefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"relationshipType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"effectiveFrom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"effectiveTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"proposeOrganizationRelationship"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedGraphVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"subjectEmploymentRefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subjectEmploymentRefId"}}},{"kind":"Argument","name":{"kind":"Name","value":"managerEmploymentRefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"managerEmploymentRefId"}}},{"kind":"Argument","name":{"kind":"Name","value":"relationshipType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"relationshipType"}}},{"kind":"Argument","name":{"kind":"Name","value":"effectiveFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"effectiveFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"effectiveTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"effectiveTo"}}},{"kind":"Argument","name":{"kind":"Name","value":"capabilities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"capabilities"}}}]}]}}]} as unknown as DocumentNode<ProposeOrganizationRelationshipMutation, ProposeOrganizationRelationshipMutationVariables>;
export const EndOrganizationRelationshipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EndOrganizationRelationship"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endOrganizationRelationship"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assignmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedGraphVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}}}]}]}}]} as unknown as DocumentNode<EndOrganizationRelationshipMutation, EndOrganizationRelationshipMutationVariables>;
export const ChangeOrganizationRelationshipManagerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeOrganizationRelationshipManager"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"managerEmploymentRefId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeOrganizationRelationshipManager"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assignmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedGraphVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedGraphVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"managerEmploymentRefId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"managerEmploymentRefId"}}}]}]}}]} as unknown as DocumentNode<ChangeOrganizationRelationshipManagerMutation, ChangeOrganizationRelationshipManagerMutationVariables>;
export const InstallOrganizationRelationshipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallOrganizationRelationship"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installOrganizationRelationship"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assignmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}},{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationOutcomeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationOutcomeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommandOutcome"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resourceVersion"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<InstallOrganizationRelationshipMutation, InstallOrganizationRelationshipMutationVariables>;
export const OrganizationPendingCommandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationPendingCommands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationPendingCommands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationDocumentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaVersion"}},{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"graphVersion"}}]}}]} as unknown as DocumentNode<OrganizationPendingCommandsQuery, OrganizationPendingCommandsQueryVariables>;