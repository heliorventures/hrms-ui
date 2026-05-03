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

/** Full leave-admin capabilities (configuration + acting on others’ requests in UI). */
function hasLeaveAdminJwtCapability(can: (permission: string) => boolean): boolean {
  return can('leave:manage');
}

/** Whether the leave requests table should include an Approvals column at all. */
export function showLeaveApprovalColumn(opts: {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
  managesDirectReports: boolean;
}): boolean {
  if (hasLeaveApproverJwtCapability(opts.can, opts.clientSession)) return true;
  if (hasLeaveAdminJwtCapability(opts.can)) return true;
  if (opts.managesDirectReports) return true;
  return false;
}

/**
 * Per-row: show Approve/Reject for another employee's pending request when the viewer is
 * allowed to approve (JWT scope/permission, leave manage, or direct manager).
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
  if (hasLeaveAdminJwtCapability(opts.can)) return true;
  return opts.directReportIds.has(opts.rowEmployeeId);
}
