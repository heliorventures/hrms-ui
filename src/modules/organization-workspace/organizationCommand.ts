import { OrganizationDataError, organizationCodeMessage } from './organizationDataError';

export type BusinessOperation =
  | 'install_membership'
  | 'install_grant'
  | 'install_relationship'
  | 'leave_decision'
  | 'feedback_create'
  | 'review_submit'
  | 'timesheet_decision'
  | 'payroll_draft'
  | 'payroll_finalize'
  | 'payroll_job_cancel_before_execution'
  | 'employee_create'
  | 'employee_update'
  | 'employee_employment'
  | 'employee_login_provision'
  | 'account_create'
  | 'account_update'
  | 'account_access'
  | 'account_roles'
  | 'workflow_save'
  | 'workflow_activation'
  | 'separation_create'
  | 'separation_reject'
  | 'separation_cancel_approval'
  | 'clearance_update';

export interface CommandIntent {
  commandId: string;
  membershipId: string;
  resourceId: string;
  expectedVersion: number;
  operation: BusinessOperation;
  payload: Record<string, unknown>;
}

export interface CommandOutcome {
  commandId: string;
  resourceId: string;
  status: string;
  resourceVersion: number;
  result: unknown;
}

export type CommandReference = Omit<CommandIntent, 'payload'>;

export function commandReference(intent: CommandIntent): CommandReference {
  return {
    commandId: intent.commandId,
    membershipId: intent.membershipId,
    resourceId: intent.resourceId,
    expectedVersion: intent.expectedVersion,
    operation: intent.operation,
  };
}

const CAPABILITIES: Record<BusinessOperation, string> = {
  install_membership: 'organization:manage',
  install_grant: 'organization:delegate',
  install_relationship: 'organization:manage',
  leave_decision: 'leave:approve',
  feedback_create: 'feedback:write',
  review_submit: 'performance:evaluate',
  timesheet_decision: 'timesheet:approve',
  payroll_draft: 'payroll:manage',
  payroll_finalize: 'payroll:manage',
  payroll_job_cancel_before_execution: 'payroll:manage',
  employee_create: 'employee:manage',
  employee_update: 'employee:manage',
  employee_employment: 'employee:manage',
  employee_login_provision: 'role:manage',
  account_create: 'role:manage',
  account_update: 'role:manage',
  account_access: 'role:manage',
  account_roles: 'role:manage',
  workflow_save: 'workflow:manage',
  workflow_activation: 'workflow:manage',
  separation_create: 'onboarding:manage',
  separation_reject: 'onboarding:manage',
  separation_cancel_approval: 'onboarding:manage',
  clearance_update: 'onboarding:manage',
};

export const commandCapability = (operation: BusinessOperation) => CAPABILITIES[operation];

export function commandSourceCode(result: unknown): string | null {
  if (result === null || typeof result !== 'object' || Array.isArray(result)) return null;
  const { code } = result as Record<string, unknown>;
  return typeof code === 'string' ? code : null;
}

export function commandRecoveryMessage(result: unknown): string | null {
  const code = commandSourceCode(result);
  if (code === 'AUTHORITY_CHANGED')
    return 'Source company authority changed. Refresh organization access.';
  if (code === 'SOURCE_VERSION_CHANGED')
    return 'The source record changed. Refresh source records before making another decision.';
  if (code === 'SOURCE_VALIDATION_FAILED')
    return 'The source company could not accept these details. Review the source record before trying again.';
  return organizationCodeMessage(code);
}

export function createCommandIntent(
  membershipId: string,
  operation: BusinessOperation,
  resourceId: string,
  expectedVersion: number,
  payload: Record<string, unknown>
): CommandIntent {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion <= 0) {
    throw new OrganizationDataError('Refresh the source record before trying again.');
  }
  return {
    commandId: crypto.randomUUID(),
    membershipId,
    resourceId,
    expectedVersion,
    operation,
    payload: structuredClone(payload),
  };
}

/** A retry must retain the exact original intent, including source version and command ID. */
export function sameCommand(intent: CommandIntent): CommandIntent {
  return { ...intent, payload: structuredClone(intent.payload) };
}

export function commandPresentation(status: string) {
  if (status === 'ACCEPTED')
    return {
      confirmed: false,
      pending: false,
      label: 'Source company accepted the payroll job; check its processing status',
    };
  if (status === 'CANCELLED_NOT_EXECUTED')
    return {
      confirmed: false,
      pending: false,
      label: 'Source company confirmed cancellation before execution',
    };
  if (status === 'COMMITTED') {
    return { confirmed: true, pending: false, label: 'Source company confirmed the change' };
  }
  if (status === 'REJECTED') {
    return { confirmed: false, pending: false, label: 'Source company rejected the command' };
  }
  if (status === 'SUBMITTED') {
    return { confirmed: false, pending: true, label: 'Submitted; awaiting source confirmation' };
  }
  return { confirmed: false, pending: true, label: 'Awaiting source confirmation' };
}
