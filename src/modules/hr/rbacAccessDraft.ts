import type { ConfirmOptions } from '../../contexts/DialogContext';

import type { RbacPermissionRow, RbacScopeRow } from './rbacTypes';

export function roleAccessConfirmation(roleLabel: string, scopes: RbacScopeRow[]): ConfirmOptions {
  const includesAll = scopes.some((row) => row.scopeType === 'ALL');
  return {
    title: 'Update role access',
    message:
      `This replaces permissions and scopes together for ${roleLabel}.` +
      (includesAll ? ' ALL applies across the company.' : '') +
      ' Existing grants without scopes remain inactive. Assigned users must sign in again.',
    confirmLabel: 'Save permissions and scopes',
    variant: includesAll ? 'danger' : 'default',
  };
}

export function toggleRbacId(previous: Set<string>, id: string): Set<string> {
  const next = new Set(previous);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function grantedScopes(
  catalog: RbacPermissionRow[],
  ids: Set<string>,
  rows: RbacScopeRow[]
) {
  const keys = new Set(
    catalog
      .filter((permission) => ids.has(permission.id))
      .map((permission) => `${permission.resource}:${permission.action}`)
  );
  return rows.filter((row) => keys.has(`${row.resource}:${row.action}`));
}

export function roleAccessDraft(
  catalog: RbacPermissionRow[],
  ids: Set<string>,
  rows: RbacScopeRow[],
  inactive: Set<string>
): { error: string } | { permissionIds: string[]; scopes: RbacScopeRow[] } {
  const selected = catalog.filter((permission) => ids.has(permission.id));
  if (selected.length !== ids.size)
    return { error: 'The permission catalog is incomplete. Reload before saving.' };
  const scopes = rows.filter((row) =>
    selected.some(
      (permission) => permission.resource === row.resource && permission.action === row.action
    )
  );
  for (const permission of selected) {
    const scope = scopes.find(
      (row) => row.resource === permission.resource && row.action === permission.action
    );
    if (!scope && inactive.has(permission.id)) continue;
    if (!scope || !permission.supportedScopeTypes.includes(scope.scopeType)) {
      return { error: `Select a supported scope for ${permission.resource}:${permission.action}.` };
    }
  }
  return { permissionIds: Array.from(ids), scopes };
}
