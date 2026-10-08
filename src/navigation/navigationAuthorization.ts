import type { createPermissionService } from '../auth/permissionService';

import type { NavigationDestination } from './navigationModel';

export function hasDestinationPermission(
  destination: NavigationDestination,
  permissions: ReturnType<typeof createPermissionService>
): boolean {
  if (
    destination.permission &&
    !permissions.canScopedPermission(destination.permission, destination.scopes)
  )
    return false;
  return (
    !destination.anyPermissions ||
    destination.anyPermissions.some((permission) => permissions.canPermission(permission))
  );
}
