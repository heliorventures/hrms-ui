/**
 * Client JWT session shape (`kabipay-common` `ClientClaims`) for RBAC in the UI.
 */

export type ClientPersona = 'ADMIN' | 'HR' | 'EMPLOYEE';

/** Full tenant-administrator shell (configuration, ops-style admin nav). */
const TENANT_ADMIN_SHELL_ROLES = new Set([
  'TENANT_ADMIN',
  'ORG_ADMIN',
  'PAYROLL_ADMIN',
  'ADMIN',
]);

/** HR workbench (`/hr/*`) — people operations without full tenant-admin shell. */
const HR_SHELL_ROLES = new Set(['HR_ADMIN', 'HR', 'HR_MANAGER', 'PEOPLE_OPS']);

/**
 * Any legacy elevated role (admin or HR). Used only where we still need a single “not employee” bucket.
 */
const ANY_ELEVATED_ROLE_NAMES = new Set([
  ...TENANT_ADMIN_SHELL_ROLES,
  ...HR_SHELL_ROLES,
]);

interface ClientJwtPayload {
  roles?: string[];
  permissions?: string[];
  resource_scopes?: Record<string, string>;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function derivePersonaFromJwtRoles(jwtRoles: string[]): ClientPersona {
  const upper = jwtRoles.map((r) => r.trim().toUpperCase()).filter(Boolean);
  if (upper.some((r) => TENANT_ADMIN_SHELL_ROLES.has(r))) return 'ADMIN';
  if (upper.some((r) => HR_SHELL_ROLES.has(r))) return 'HR';
  return 'EMPLOYEE';
}

/** True when JWT should see **Admin** sidebar (`/admin/*`, payroll admin, …). */
export function deriveShowTenantAdminNav(jwtRoles: string[]): boolean {
  const upper = jwtRoles.map((r) => r.trim().toUpperCase()).filter(Boolean);
  return upper.some((r) => TENANT_ADMIN_SHELL_ROLES.has(r));
}

/** True when JWT should see **HR** sidebar (`/hr/*`). Tenant admins may use both. */
export function deriveShowHrNav(jwtRoles: string[]): boolean {
  const upper = jwtRoles.map((r) => r.trim().toUpperCase()).filter(Boolean);
  return upper.some((r) => HR_SHELL_ROLES.has(r));
}

/** Elevated for legacy “admin vs employee” UX (`User.role`, payroll self-service gates, …). */
export function deriveLegacyElevated(jwtRoles: string[]): boolean {
  const upper = jwtRoles.map((r) => r.trim().toUpperCase()).filter(Boolean);
  return upper.some((r) => ANY_ELEVATED_ROLE_NAMES.has(r));
}

export interface ParsedClientSession {
  jwtRoles: string[];
  permissions: ReadonlySet<string>;
  resourceScopes: Readonly<Record<string, string>>;
  persona: ClientPersona;
}

export function parseClientAccessToken(accessToken: string): ParsedClientSession | null {
  const raw = decodeJwtPayload(accessToken);
  if (!raw) return null;

  const claims = raw as ClientJwtPayload;
  const rolesRaw = claims.roles;
  const jwtRoles = Array.isArray(rolesRaw)
    ? rolesRaw.filter((r): r is string => typeof r === 'string')
    : [];

  const permsRaw = claims.permissions;
  const permList = Array.isArray(permsRaw)
    ? permsRaw.filter((p): p is string => typeof p === 'string')
    : [];
  const permissions = new Set(permList);

  const scopes = claims.resource_scopes;
  const resourceScopes =
    scopes != null && typeof scopes === 'object' && !Array.isArray(scopes)
      ? (scopes as Record<string, string>)
      : {};

  return {
    jwtRoles,
    permissions,
    resourceScopes,
    persona: derivePersonaFromJwtRoles(jwtRoles),
  };
}

export function personaToLegacyUserRole(persona: ClientPersona): 'admin' | 'employee' {
  return persona === 'ADMIN' || persona === 'HR' ? 'admin' : 'employee';
}
