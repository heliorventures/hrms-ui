import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export function useLoanAccess() {
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  return {
    permissions: createPermissionService(clientSession),
    ownerKey: `${currentTenant.id}|${authorizationStateKey(clientSession)}`,
  };
}
