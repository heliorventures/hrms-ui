import { getAppConfig } from '@/config';

/**
 * REST client for the `kabipay-auth` service.
 *
 * All endpoints return a `TokenPair` shape (see `crates/kabipay-auth/src/handlers.rs`).
 * This module keeps the network surface tiny and typed so contexts can
 * just call `loginClient(...)` without re-implementing fetch + error handling.
 */

export interface TokenPair {
  access: string;
  refresh: string;
  tokenType: 'Bearer';
  expiresIn: number;
  tenantId?: string;
  username?: string;
  email: string;
  userId: string;
  mustChangePassword: boolean;
}

export interface ResolvedTenant {
  id: string;
  name: string;
  status: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface AuthErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

function authBaseUrl(): string {
  return getAppConfig().authUrl;
}

async function postJson<TOut>(
  path: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<TOut> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const res = await fetch(`${authBaseUrl()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 204) {
    return undefined as unknown as TOut;
  }
  const raw = await res.text();
  let parsed: unknown = undefined;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { error: { code: 'BAD_RESPONSE', message: raw } };
    }
  }
  if (!res.ok) {
    const err = (parsed as AuthErrorPayload | undefined)?.error ?? {
      code: 'UNKNOWN',
      message: res.statusText,
    };
    throw new AuthError(res.status, err.code, err.message);
  }
  return parsed as TOut;
}

async function getJson<TOut>(path: string, options?: { signal?: AbortSignal }): Promise<TOut> {
  const res = await fetch(`${authBaseUrl()}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options?.signal,
  });
  const raw = await res.text();
  let parsed: unknown = undefined;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { error: { code: 'BAD_RESPONSE', message: raw } };
    }
  }
  if (!res.ok) {
    const err = (parsed as AuthErrorPayload | undefined)?.error ?? {
      code: 'UNKNOWN',
      message: res.statusText,
    };
    throw new AuthError(res.status, err.code, err.message);
  }
  return parsed as TOut;
}

export async function resolveTenantBySlug(
  slug: string,
  options?: { signal?: AbortSignal }
): Promise<ResolvedTenant> {
  return getJson<ResolvedTenant>(`/auth/client/tenants/${encodeURIComponent(slug)}`, options);
}

export async function loginClient(
  username: string,
  password: string,
  tenantId: string
): Promise<TokenPair> {
  return postJson<TokenPair>('/auth/client/login', { username, password, tenantId });
}

export async function refreshClient(refresh: string): Promise<TokenPair> {
  return postJson<TokenPair>('/auth/client/refresh', { refresh });
}

export async function logoutClient(refresh: string): Promise<void> {
  await postJson<void>('/auth/client/logout', { refresh });
}

export async function loginOps(email: string, password: string): Promise<TokenPair> {
  return postJson<TokenPair>('/auth/ops/login', { email, password });
}

export async function refreshOps(refresh: string): Promise<TokenPair> {
  return postJson<TokenPair>('/auth/ops/refresh', { refresh });
}

export async function logoutOps(refresh: string): Promise<void> {
  await postJson<void>('/auth/ops/logout', { refresh });
}

export interface IntrospectResult {
  active: boolean;
  userId?: string;
  tenantId?: string;
  issuer?: string;
  email?: string;
  exp?: number;
}

export async function introspect(token: string): Promise<IntrospectResult> {
  return postJson<IntrospectResult>('/auth/introspect', { token });
}

/** Requires a valid client access token (`Authorization: Bearer` on the wire). */
export async function changeClientPassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await postJson<void>(
    '/auth/client/change-password',
    { currentPassword, newPassword },
    { Authorization: `Bearer ${accessToken}` }
  );
}
