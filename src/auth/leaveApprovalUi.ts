import type { ParsedClientSession } from './clientSession';
import { hasBroadDataScopeForResource } from './approvalScope';

/**
 * JWT-backed capability to act as a leave approver for scoped queues:
 * explicit `leave:approve` or TEAM / ALL / DEPARTMENT resource scope on `leave`.
 */
export function hasLeaveApproverJwtCapability(
  can: (permission: string) => boolean,
  clientSession: ParsedClientSession | null
): boolean {
  return can('leave:approve') || hasBroadDataScopeForResource(clientSession, 'leave');
}

/** Whether the leave requests table should include an Approvals column at all. */
export function showLeaveApprovalColumn(opts: {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
  showHrNav: boolean;
  showTenantAdminNav: boolean;
  hasJwtRole: (roleName: string) => boolean;
  managesDirectReports: boolean;
}): boolean {
  if (hasLeaveApproverJwtCapability(opts.can, opts.clientSession)) return true;
  if (opts.showTenantAdminNav) return true;
  if (opts.showHrNav && opts.hasJwtRole('HR_ADMIN')) return true;
  if (opts.managesDirectReports) return true;
  return false;
}

/**
 * Per-row: show Approve/Reject for another employee's pending request when the viewer is
 * allowed to approve (JWT scope/permission, HR admin, tenant admin shell, or direct manager).
 */
export function canApproveLeaveRequestRow(opts: {
  rowEmployeeId: string;
  viewerEmployeeId: string | undefined;
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
  showHrNav: boolean;
  showTenantAdminNav: boolean;
  hasJwtRole: (roleName: string) => boolean;
  directReportIds: ReadonlySet<string>;
}): boolean {
  if (!opts.viewerEmployeeId) return false;
  if (opts.rowEmployeeId === opts.viewerEmployeeId) return false;

  if (hasLeaveApproverJwtCapability(opts.can, opts.clientSession)) return true;
  if (opts.showTenantAdminNav) return true;
  if (opts.showHrNav && opts.hasJwtRole('HR_ADMIN')) return true;
  return opts.directReportIds.has(opts.rowEmployeeId);
}
