import { readFileSync } from 'node:fs';

import { credentials } from './config.mjs';
import { requireDemo } from './contracts.mjs';

export async function jsonResponse(response, code) {
  requireDemo(response.ok(), code, `Demo service request failed with HTTP ${response.status()}.`);
  let parsed;
  try { parsed = JSON.parse((await response.text()).replace(/^\uFEFF/, '')); }
  catch { requireDemo(false, 'INVALID_SERVICE_RESPONSE', 'The demo service did not return JSON.'); }
  return parsed;
}

export async function resolveRuntime(config, request) {
  const runtime = await jsonResponse(await request.get(`${config.baseUrl}/config.json`, { maxRedirects: 0 }), 'CONFIG_UNAVAILABLE');
  const authUrl = new URL(runtime.authUrl, config.baseUrl).href.replace(/\/$/, '');
  const gatewayUrl = new URL(runtime.gatewayUrl, config.baseUrl).href;
  for (const url of [authUrl, gatewayUrl]) {
    const endpoint = new URL(url);
    requireDemo(!endpoint.username && !endpoint.password && config.allowedApiOrigins?.includes(endpoint.origin), 'API_NOT_ALLOWED', 'The runtime API origin is not allowlisted in demo.local.json.');
  }
  const host = new URL(config.baseUrl).hostname;
  const slug = config.tenantSlug ?? host.split('.')[0];
  requireDemo(slug && !['localhost', 'www', 'app'].includes(slug), 'TENANT_REQUIRED', 'Configure the demo tenant slug explicitly.');
  const tenant = await jsonResponse(await request.get(`${authUrl}/auth/client/tenants/${encodeURIComponent(slug)}`, { maxRedirects: 0 }), 'TENANT_UNAVAILABLE');
  requireDemo(typeof tenant.id === 'string' && tenant.subdomain?.toLowerCase() === slug.toLowerCase(), 'TENANT_MISMATCH', 'The resolved tenant does not match the selected demo site.');
  return { authUrl, gatewayUrl, tenantId: tenant.id, timezone: tenant.timezone, origin: config.baseUrl };
}

export async function createRoleSession(role, runtime, request) {
  const account = credentials(role);
  const key = `kabipay.client.refresh.${runtime.tenantId.toLowerCase()}`;
  if (account.stateFile) {
    const storageState = JSON.parse(readFileSync(account.stateFile, 'utf8'));
    requireDemo(storageState.origins?.some(origin => origin.origin === runtime.origin && origin.localStorage?.some(item => item.name === key && item.value)), 'SESSION_MISMATCH', 'The saved session does not belong to this demo tenant.');
    return { role, storageState, owned: false };
  }
  const pair = await jsonResponse(await request.post(`${runtime.authUrl}/auth/client/login`, {
    data: { username: account.username, password: account.password, tenantId: runtime.tenantId },
    maxRedirects: 0,
  }), 'LOGIN_FAILED');
  requireDemo(pair.tenantId === runtime.tenantId && typeof pair.refresh === 'string' && typeof pair.userId === 'string', 'SESSION_MISMATCH', 'Login returned a session for an unexpected tenant.');
  requireDemo(pair.mustChangePassword === false, 'PASSWORD_CHANGE_REQUIRED', 'This demo account requires a password change before it can record unattended.');
  return {
    role, owned: true, userId: pair.userId,
    storageState: { cookies: [], origins: [{ origin: runtime.origin, localStorage: [{ name: key, value: pair.refresh }] }] },
  };
}

export async function revokeRoleSession(session, runtime, request) {
  if (!session.owned) return;
  const token = session.storageState.origins?.find(o => o.origin === runtime.origin)?.localStorage?.find(item => item.name === `kabipay.client.refresh.${runtime.tenantId.toLowerCase()}`)?.value;
  if (!token) return;
  await request.post(`${runtime.authUrl}/auth/client/logout`, { data: { refresh: token }, maxRedirects: 0 }).catch(() => undefined);
}
