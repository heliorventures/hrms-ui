import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export function useNotificationOwnerKey() {
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  return `${currentTenant.id}|${authorizationStateKey(clientSession)}`;
}
