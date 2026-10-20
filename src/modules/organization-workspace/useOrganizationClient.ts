import { useMemo } from 'react';

import { createGraphClient } from '../../api/client';
import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export function useOrganizationClient() {
  const { tenantId, user, clientSession, expireClientSession, isAuthenticated } = useAuth();
  const { currentTenant } = useTenant();
  const sourceCompanyId = tenantId ?? '';
  const ownerKey = JSON.stringify([
    user?.id,
    sourceCompanyId,
    currentTenant.id,
    authorizationStateKey(clientSession),
  ]);
  const client = useMemo(
    () =>
      createGraphClient('client', {
        tenantId: sourceCompanyId,
        loginCompanyId: sourceCompanyId,
        onUnauthenticated: expireClientSession,
      }),
    [expireClientSession, sourceCompanyId]
  );
  return {
    client,
    ownerKey,
    sourceCompanyId,
    sourceCompanyName: currentTenant.name,
    sourceReady: isAuthenticated && sourceCompanyId !== '' && currentTenant.id === sourceCompanyId,
  };
}
