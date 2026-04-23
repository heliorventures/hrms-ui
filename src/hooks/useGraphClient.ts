import { useMemo } from 'react';
import { createGraphClient, type KabiPayGraphPlane } from '@/api/client';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Hook that returns a GraphQL client pre-configured with the current
 * tenant id (for the `x-tenant-id` header) and the caller's access
 * token. Use this instead of `createGraphClient` directly inside
 * React components so tenant switches propagate automatically.
 */
export function useGraphClient(plane: KabiPayGraphPlane = 'client') {
  const { currentTenant } = useTenant();
  return useMemo(
    () => createGraphClient(plane, { tenantId: currentTenant?.id }),
    [plane, currentTenant?.id]
  );
}
