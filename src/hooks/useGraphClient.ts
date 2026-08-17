import { useMemo } from 'react';

import { createGraphClient, type HeliorGraphPlane } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Hook that returns a GraphQL client pre-configured with the current
 * tenant id (for the `x-tenant-id` header) and the caller's access
 * token. Use this instead of `createGraphClient` directly inside
 * React components so tenant switches propagate automatically.
 */
export function useGraphClient(plane: HeliorGraphPlane = 'client') {
  const { currentTenant } = useTenant();
  const { expireClientSession } = useAuth();
  return useMemo(
    () =>
      createGraphClient(plane, {
        tenantId: currentTenant.id,
        onUnauthenticated: plane === 'client' ? expireClientSession : undefined,
      }),
    [expireClientSession, plane, currentTenant.id]
  );
}
