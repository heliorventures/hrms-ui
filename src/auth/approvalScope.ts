import type { ParsedClientSession } from './clientSession';

export type PermissionScope = 'SELF' | 'TEAM' | 'DEPARTMENT' | 'ALL';

export function scopeForPermission(
  session: ParsedClientSession | null,
  permission: string
): PermissionScope {
  const raw = session?.permissionScopes?.[permission.trim().toLowerCase()];
  const normalized = String(raw ?? '').trim().toUpperCase();
  return normalized === 'TEAM' || normalized === 'DEPARTMENT' || normalized === 'ALL'
    ? normalized
    : 'SELF';
}

export function hasBroadDataScopeForPermission(
  session: ParsedClientSession | null,
  permission: string
): boolean {
  return scopeForPermission(session, permission) !== 'SELF';
}

/**
 * True when the JWT grants TEAM, ALL, or DEPARTMENT list scope on `resource`
 * (from `resource_scopes`, e.g. leave / expense approve rows for managers).
 */
export function hasBroadDataScopeForResource(
  session: ParsedClientSession | null,
  resource: string
): boolean {
  if (!session) return false;
  const raw =
    session.resourceScopes[resource] ??
    session.resourceScopes[resource.toLowerCase()] ??
    '';
  const v = String(raw).trim().toUpperCase();
  return v === 'TEAM' || v === 'ALL' || v === 'DEPARTMENT';
}
