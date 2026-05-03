/**
 * Permission-aware nav and route gates. When the JWT has **no** permission strings
 * but the user is still elevated (legacy / mis-seeded tenants), allow matching paths.
 */

import { hasBroadDataScopeForResource } from './approvalScope';
import type { ParsedClientSession } from './clientSession';

export type NavAccessOptions = {
  isElevated: boolean;
  can: (permission: string) => boolean;
  /** Number of `resource:action` strings on the current client JWT. */
  jwtPermissionCount: number;
  /** Tenant-administrator shell (`TENANT_ADMIN`, …) — `/admin/*`. */
  showTenantAdminNav: boolean;
  /** HR workbench shell (`HR_ADMIN`, …) — `/hr/*`. */
  showHrNav: boolean;
  /** JWT session for resource-scope checks (leave / expense queues). */
  clientSession: ParsedClientSession | null;
};

function canApproveLeaveForNav(opts: NavAccessOptions): boolean {
  return (
    opts.can('leave:approve') ||
    (opts.isElevated && opts.jwtPermissionCount === 0) ||
    hasBroadDataScopeForResource(opts.clientSession, 'leave')
  );
}

/** Mirrors backend `ClientClaims::can_manage_leave_configuration`. */
function canManageLeaveConfiguration(opts: NavAccessOptions): boolean {
  if (opts.can('leave:manage')) return true;
  const roles = opts.clientSession?.jwtRoles ?? [];
  return roles.some((r) => {
    const u = r.trim().toUpperCase();
    return u === 'HR_ADMIN' || u === 'TENANT_ADMIN' || u === 'ORG_ADMIN';
  });
}
function allowWithLegacy(
  opts: NavAccessOptions,
  permission: string | undefined
): boolean {
  if (!opts.isElevated) return false;
  if (opts.jwtPermissionCount === 0) return true;
  if (permission == null) return true;
  return opts.can(permission);
}

/** Sidebar / deep-link guard for tenant admin, HR, and gated workplace paths. */
export function canAccessTenantPath(path: string, opts: NavAccessOptions): boolean {
  if (path === '/hr' || path.startsWith('/hr/')) {
    if (!opts.showHrNav && !opts.showTenantAdminNav) return false;
    if (path === '/hr') return true;
    switch (path) {
      case '/hr/people':
        return allowWithLegacy(opts, 'employee:write');
      case '/hr/access':
        return allowWithLegacy(opts, 'role:manage');
      case '/hr/leaves':
        if (opts.showTenantAdminNav) return true;
        return canApproveLeaveForNav(opts);
      case '/hr/leave-settings':
        if (!opts.showHrNav && !opts.showTenantAdminNav) return false;
        return canManageLeaveConfiguration(opts);
      default:
        return true;
    }
  }

  if (path.startsWith('/admin/')) {
    if (path === '/admin/leave-settings') {
      if (opts.showTenantAdminNav) {
        return allowWithLegacy(opts, 'leave:manage') || canManageLeaveConfiguration(opts);
      }
      if (opts.showHrNav) {
        return canManageLeaveConfiguration(opts);
      }
      return false;
    }
    if (!opts.showTenantAdminNav) return false;
    switch (path) {
      case '/admin/employees':
        return allowWithLegacy(opts, 'employee:write');
      case '/admin/attendance-policy':
        return allowWithLegacy(opts, 'attendance:punch_policy');
      case '/admin/leave-settings':
        return allowWithLegacy(opts, 'leave:manage');
      case '/admin/reports':
      case '/admin/settings':
      case '/admin/module-health':
        return true;
      default:
        return true;
    }
  }

  if (path === '/workplace/workflows') {
    if (!opts.showHrNav && !opts.showTenantAdminNav) return false;
    return allowWithLegacy(opts, 'workflow:manage');
  }

  return true;
}
