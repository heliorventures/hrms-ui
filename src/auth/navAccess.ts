/**
 * Tenant route + sidebar gates from JWT permissions (`resource:action`).
 * Roles are not consulted here — admins define roles, attach permissions, assign roles to users;
 * the access token carries effective permissions only.
 */

import { hasBroadDataScopeForResource } from './approvalScope';
import type { ParsedClientSession } from './clientSession';

export type NavAccessOptions = {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
};

function canApproveLeaveForNav(opts: NavAccessOptions): boolean {
  return (
    opts.can('leave:approve') || hasBroadDataScopeForResource(opts.clientSession, 'leave')
  );
}

function canUseHrWorkbench(opts: NavAccessOptions): boolean {
  return (
    opts.can('employee:write') ||
    canApproveLeaveForNav(opts) ||
    opts.can('leave:manage')
  );
}

/** Sidebar / deep-link guard for admin, HR workbench, workplace feature routes, and gated paths. */
export function canAccessTenantPath(path: string, opts: NavAccessOptions): boolean {
  if (path === '/hr' || path.startsWith('/hr/')) {
    if (!canUseHrWorkbench(opts)) return false;
    if (path === '/hr') return true;
    switch (path) {
      case '/hr/people':
        return opts.can('employee:write');
      case '/hr/leaves':
        return canApproveLeaveForNav(opts) || opts.can('leave:manage');
      default:
        return false;
    }
  }

  if (path.startsWith('/admin/')) {
    switch (path) {
      case '/admin/employees':
        return opts.can('employee:write');
      case '/admin/attendance-policy':
        return opts.can('attendance:punch_policy');
      case '/admin/leave-settings':
        return opts.can('leave:manage');
      case '/admin/reports':
        return opts.can('payroll:statutory_export') || opts.can('employee:write');
      case '/admin/access':
        return opts.can('role:manage');
      case '/admin/settings':
      case '/admin/module-health':
        return opts.can('role:manage');
      default:
        return false;
    }
  }

  if (path.startsWith('/workplace/')) {
    switch (path) {
      case '/workplace/workflows':
        return opts.can('workflow:manage');
      case '/workplace/benefits':
        return opts.can('benefits:manage') || opts.can('benefits:self');
      case '/workplace/recruitment':
        return opts.can('recruitment:manage');
      case '/workplace/onboarding':
        return opts.can('onboarding:manage') || opts.can('onboarding:self');
      case '/workplace/performance':
        return opts.can('performance:manage');
      case '/workplace/succession':
        return opts.can('succession:manage');
      case '/workplace/compensation':
        return opts.can('compensation:manage');
      case '/workplace/learning':
        return opts.can('learning:manage');
      case '/workplace/assets':
        return opts.can('assets:manage');
      case '/workplace/grievance':
        return opts.can('grievance:manage') || opts.can('grievance:self');
      default:
        return false;
    }
  }

  if (path === '/insights') {
    return opts.can('analytics:read');
  }

  return true;
}
