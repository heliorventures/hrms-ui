import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export function useReportOwner() {
  const { currentTenant } = useTenant();
  const { clientSession } = useAuth();
  return `${currentTenant.id}|${authorizationStateKey(clientSession)}`;
}
