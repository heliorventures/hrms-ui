/**
 * Dual-plane tokens for the tenant app and operator portal.
 *
 * Access tokens stay in memory only.
 * Refresh tokens are tenant-keyed and persisted so the active tenant session can be restored
 * after a browser refresh without crossing into a different tenant workspace.
 *
 * A future hardening step is to replace localStorage with httpOnly cookies.
 */

const LEGACY_CLIENT_REFRESH_KEY = 'kabipay.client.refresh';
const CLIENT_REFRESH_PREFIX = 'kabipay.client.refresh.';
const OPS_REFRESH_KEY = 'kabipay.ops.refresh';

let clientAccessToken: string | null = null;
let operatorAccessToken: string | null = null;

export function setClientAccessToken(token: string | null) {
  clientAccessToken = token;
}

export function getClientAccessToken() {
  return clientAccessToken;
}

export function setOperatorAccessToken(token: string | null) {
  operatorAccessToken = token;
}

export function getOperatorAccessToken() {
  return operatorAccessToken;
}

function tryStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function clientRefreshKey(tenantId: string): string {
  return `${CLIENT_REFRESH_PREFIX}${tenantId.toLowerCase()}`;
}

export function setClientRefreshToken(tenantId: string, token: string | null) {
  const s = tryStorage();
  if (!s) return;
  const key = clientRefreshKey(tenantId);
  if (token) s.setItem(key, token);
  else s.removeItem(key);
}

export function getClientRefreshToken(tenantId: string): string | null {
  return tryStorage()?.getItem(clientRefreshKey(tenantId)) ?? null;
}

export function clearLegacyClientRefreshToken(): void {
  tryStorage()?.removeItem(LEGACY_CLIENT_REFRESH_KEY);
}

export function setOperatorRefreshToken(token: string | null) {
  const s = tryStorage();
  if (!s) return;
  if (token) s.setItem(OPS_REFRESH_KEY, token);
  else s.removeItem(OPS_REFRESH_KEY);
}

export function getOperatorRefreshToken(): string | null {
  return tryStorage()?.getItem(OPS_REFRESH_KEY) ?? null;
}

export function clearAllTokens() {
  clientAccessToken = null;
  operatorAccessToken = null;
  const s = tryStorage();
  if (s) {
    s.removeItem(LEGACY_CLIENT_REFRESH_KEY);
    const keys: string[] = [];
    for (let i = 0; i < s.length; i += 1) {
      const key = s.key(i);
      if (key?.startsWith(CLIENT_REFRESH_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => s.removeItem(key));
  }
  setOperatorRefreshToken(null);
}

/** Clear only the tenant (employee) app session. */
export function clearClientSession(tenantId: string | null) {
  clientAccessToken = null;
  if (tenantId) setClientRefreshToken(tenantId, null);
}

/** Clear only the operator console session. */
export function clearOperatorSession() {
  operatorAccessToken = null;
  setOperatorRefreshToken(null);
}
