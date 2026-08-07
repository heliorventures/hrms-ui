import { createPermissionService } from './permissionService';
import type { ParsedClientSession } from './clientSession';

export type NavAccessOptions = {
  can: (permission: string) => boolean;
  clientSession: ParsedClientSession | null;
};

export function canManageNotifications(opts: NavAccessOptions): boolean {
  return createPermissionService(opts.clientSession).canCapability('action.notifications.manage');
}

export function canAccessTenantPath(path: string, opts: NavAccessOptions): boolean {
  return createPermissionService(opts.clientSession).canRoute(path);
}
