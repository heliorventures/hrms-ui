import { GraphQLClient } from 'graphql-request';
import { getAppConfig } from '@/config';
import { getClientAccessToken, getOperatorAccessToken } from '@/auth/tokenStore';

export type HeliorGraphPlane = 'client' | 'operator';

const TENANT_HEADER = 'x-tenant-id';

/** Full HTTP URL of the federated GraphQL endpoint (include `/graphql` if your gateway uses a path). */
function graphqlHttpUrl() {
  return getAppConfig().gatewayUrl;
}

/**
 * Build HTTP headers for an outgoing GraphQL request.
 *
 * `Authorization` comes from the in-memory token store; `x-tenant-id` is
 * read from the runtime-supplied tenant context. Production requests must not
 * fall back to a config tenant.
 */
function buildHeaders(plane: HeliorGraphPlane, tenantId?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = plane === 'operator' ? getOperatorAccessToken() : getClientAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId && plane === 'client') {
    headers[TENANT_HEADER] = tenantId;
  }
  return headers;
}

export interface GraphClientOptions {
  tenantId?: string;
}

export function createGraphClient(
  plane: HeliorGraphPlane = 'client',
  opts: GraphClientOptions = {}
) {
  return new GraphQLClient(graphqlHttpUrl(), {
    headers: () => buildHeaders(plane, opts.tenantId),
  });
}
