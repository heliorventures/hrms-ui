import { organizationEnabled } from '../modules/organization-workspace/organizationFeature';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

export type NavAccessOptions = {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
};

export function canManageNotifications(opts: NavAccessOptions): boolean {
  return createPermissionService(opts.clientSession).canCapability('action.notifications.manage');
}

export function canAccessTenantPath(path: string, opts: NavAccessOptions): boolean {
  if (path === '/organization-workspace') {
    return organizationEnabled() && opts.clientSession !== null;
  }
  return createPermissionService(opts.clientSession).canRoute(path);
}
