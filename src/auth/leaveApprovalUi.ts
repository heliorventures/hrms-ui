import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

/**
 * JWT-backed capability to act as a leave approver for scoped queues:
 * explicit leave approval or TEAM / ALL / DEPARTMENT resource scope on leave.
 */
export function hasLeaveApproverJwtCapability(
  _can: (permission: string) => boolean,
  clientSession: ParsedClientSession | null
): boolean {
  return createPermissionService(clientSession).canCapability('action.leave.approve');
}

/** Full leave-admin capabilities for configuration and acting on other requests. */
function hasLeaveAdminJwtCapability(clientSession: ParsedClientSession | null): boolean {
  return createPermissionService(clientSession).canCapability('action.leave.manage');
}

/** Whether the leave requests table should include an Approvals column at all. */
export function showLeaveApprovalColumn(opts: {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
  managesDirectReports: boolean;
}): boolean {
  if (hasLeaveApproverJwtCapability(opts.can, opts.clientSession)) return true;
  if (hasLeaveAdminJwtCapability(opts.clientSession)) return true;
  if (opts.managesDirectReports) return true;
  return false;
}

/**
 * Per-row: show Approve/Reject for another employee's pending request when the viewer is
 * allowed to approve by JWT scope, leave management, or direct manager relationship.
 */
export function canApproveLeaveRequestRow(opts: {
  rowEmployeeId: string;
  viewerEmployeeId: string | undefined;
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
  directReportIds: ReadonlySet<string>;
}): boolean {
  if (!opts.viewerEmployeeId) return false;
  if (opts.rowEmployeeId === opts.viewerEmployeeId) return false;

  if (hasLeaveApproverJwtCapability(opts.can, opts.clientSession)) return true;
  if (hasLeaveAdminJwtCapability(opts.clientSession)) return true;
  return opts.directReportIds.has(opts.rowEmployeeId);
}
