import type { GraphQLClient } from 'graphql-request';

import {
  CancelPendingOrganizationCommandDocument,
  ExecuteOrganizationCommandDocument,
  InstallOrganizationGrantDocument,
  InstallOrganizationMembershipDocument,
  InstallOrganizationRelationshipDocument,
  OrganizationCommandStatusDocument,
  OrganizationOperation,
  OrganizationResourceDocument,
  type OrganizationResourceQueryVariables,
} from '../../api/organization/graphql';

import { organizationAccessDenied } from './organizationAccessError';
import {
  commandSourceCode,
  type BusinessOperation,
  type CommandOutcome,
} from './organizationCommand';
import type { OrganizationCommandTransport } from './organizationCommandTransport';

const OPERATIONS: Record<BusinessOperation, OrganizationOperation> = {
  install_membership: OrganizationOperation.InstallMembership,
  install_grant: OrganizationOperation.InstallGrant,
  install_relationship: OrganizationOperation.InstallRelationship,
  leave_decision: OrganizationOperation.LeaveDecision,
  feedback_create: OrganizationOperation.FeedbackCreate,
  review_submit: OrganizationOperation.ReviewSubmit,
  timesheet_decision: OrganizationOperation.TimesheetDecision,
  payroll_draft: OrganizationOperation.PayrollDraft,
  payroll_finalize: OrganizationOperation.PayrollFinalize,
  payroll_job_cancel_before_execution: OrganizationOperation.PayrollJobCancelBeforeExecution,
  employee_create: OrganizationOperation.EmployeeCreate,
  employee_update: OrganizationOperation.EmployeeUpdate,
  employee_employment: OrganizationOperation.EmployeeEmployment,
  employee_login_provision: OrganizationOperation.EmployeeLoginProvision,
  account_create: OrganizationOperation.AccountCreate,
  account_update: OrganizationOperation.AccountUpdate,
  account_access: OrganizationOperation.AccountAccess,
  account_roles: OrganizationOperation.AccountRoles,
  workflow_save: OrganizationOperation.WorkflowSave,
  workflow_activation: OrganizationOperation.WorkflowActivation,
  separation_create: OrganizationOperation.SeparationCreate,
  separation_reject: OrganizationOperation.SeparationReject,
  separation_cancel_approval: OrganizationOperation.SeparationCancelApproval,
  clearance_update: OrganizationOperation.ClearanceUpdate,
};

export function readOrganizationResource(
  client: GraphQLClient,
  variables: OrganizationResourceQueryVariables,
  refreshAccess: () => void
): Promise<CommandOutcome> {
  return guardedRequest(
    async () =>
      (await client.request(OrganizationResourceDocument, variables)).organizationResource,
    refreshAccess
  );
}

export function organizationCommandTransport(
  client: GraphQLClient,
  refreshAccess: () => void = () => undefined
): OrganizationCommandTransport {
  return {
    execute: async (organizationId, intent) =>
      guardedRequest(async () => {
        const variables = {
          organizationId,
          membershipId: intent.membershipId,
          expectedVersion: intent.expectedVersion,
          commandId: intent.commandId,
        };
        if (intent.operation === 'install_membership') {
          return (await client.request(InstallOrganizationMembershipDocument, variables))
            .installOrganizationMembership;
        }
        if (intent.operation === 'install_grant') {
          return (
            await client.request(InstallOrganizationGrantDocument, {
              ...variables,
              bindingId: intent.resourceId,
            })
          ).installOrganizationGrant;
        }
        if (intent.operation === 'install_relationship') {
          return (
            await client.request(InstallOrganizationRelationshipDocument, {
              ...variables,
              assignmentId: intent.resourceId,
            })
          ).installOrganizationRelationship;
        }
        const result = await client.request(ExecuteOrganizationCommandDocument, {
          organizationId,
          membershipId: intent.membershipId,
          command: {
            commandId: intent.commandId,
            resourceId: intent.resourceId,
            expectedVersion: intent.expectedVersion,
            operation: OPERATIONS[intent.operation],
            payload: intent.payload,
          },
        });
        return result.executeOrganizationCommand;
      }, refreshAccess),
    status: async (commandId) =>
      guardedRequest(
        async () =>
          (await client.request(OrganizationCommandStatusDocument, { commandId }))
            .organizationCommandStatus,
        refreshAccess
      ),
    cancel: async (commandId) => {
      const result = await guardedRequest(
        async () =>
          (await client.request(CancelPendingOrganizationCommandDocument, { commandId }))
            .cancelPendingOrganizationCommand,
        refreshAccess
      );
      if (result.status === 'CANCELLED_NOT_EXECUTED') refreshAccess();
      return result;
    },
  };
}

async function guardedRequest<T extends CommandOutcome>(
  request: () => Promise<T>,
  refreshAccess: () => void
): Promise<T> {
  try {
    const result = await request();
    if (result.status === 'REJECTED' && commandSourceCode(result.result) === 'AUTHORITY_CHANGED')
      refreshAccess();
    return result;
  } catch (error) {
    if (organizationAccessDenied(error)) refreshAccess();
    throw error;
  }
}
