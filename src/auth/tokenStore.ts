/**
 * Dual-plane tokens for the tenant app and operator portal.
 *
 * Access tokens stay in memory only.
 * Refresh tokens are persisted so the UI can silently refresh after reload.
 *
 * A future hardening step is to replace localStorage with httpOnly cookies.
 */

const CLIENT_REFRESH_KEY = 'kabipay.client.refresh';
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

export function setClientRefreshToken(token: string | null) {
  const s = tryStorage();
  if (!s) return;
  if (token) s.setItem(CLIENT_REFRESH_KEY, token);
  else s.removeItem(CLIENT_REFRESH_KEY);
}

export function getClientRefreshToken(): string | null {
  return tryStorage()?.getItem(CLIENT_REFRESH_KEY) ?? null;
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
  setClientRefreshToken(null);
  setOperatorRefreshToken(null);
}

/** Clear only the tenant (employee) app session. */
export function clearClientSession() {
  clientAccessToken = null;
  setClientRefreshToken(null);
}

/** Clear only the operator console session. */
export function clearOperatorSession() {
  operatorAccessToken = null;
  setOperatorRefreshToken(null);
}
