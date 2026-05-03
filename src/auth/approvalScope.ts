import type { ParsedClientSession } from './clientSession';

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
