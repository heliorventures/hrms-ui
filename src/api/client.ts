import { GraphQLClient } from 'graphql-request';
import { getAppConfig } from '@/config';
import { getClientAccessToken, getOperatorAccessToken } from '@/auth/tokenStore';

export type KabiPayGraphPlane = 'client' | 'operator';

const TENANT_HEADER = 'x-tenant-id';

/** Full HTTP URL of the federated GraphQL endpoint (include `/graphql` if your gateway uses a path). */
function graphqlHttpUrl() {
  return getAppConfig().gatewayUrl;
}

function devTenantIdFromConfig(): string | undefined {
  const v = getAppConfig().devTenantId;
  return v.length > 0 ? v : undefined;
}

/**
 * Build HTTP headers for an outgoing GraphQL request.
 *
 * `Authorization` comes from the in-memory token store; `x-tenant-id` is
 * read from the runtime-supplied `tenantId` (if any) or falls back to
 * `config.devTenantId` so the dev experience works before auth
 * is fully wired.
 */
function buildHeaders(plane: KabiPayGraphPlane, tenantId?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = plane === 'operator' ? getOperatorAccessToken() : getClientAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const resolvedTenant = tenantId ?? devTenantIdFromConfig();
  if (resolvedTenant && plane === 'client') {
    headers[TENANT_HEADER] = resolvedTenant;
  }
  return headers;
}

export interface GraphClientOptions {
  tenantId?: string;
}

export function createGraphClient(
  plane: KabiPayGraphPlane = 'client',
  opts: GraphClientOptions = {}
) {
  return new GraphQLClient(graphqlHttpUrl(), {
    headers: () => buildHeaders(plane, opts.tenantId),
  });
}
