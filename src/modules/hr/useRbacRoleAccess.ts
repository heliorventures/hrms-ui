import { useEffect, useMemo, useState } from 'react';

import {
  RoleAccessConfigurationDocument,
  SetRoleAccessDocument,
  type RbacAccessBoardQuery,
} from '../../api/rbac/graphql';
import { useDialogs } from '../../contexts/DialogContext';
import type { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  grantedScopes,
  roleAccessConfirmation,
  roleAccessDraft,
  toggleRbacId,
} from './rbacAccessDraft';
import type { RbacPermissionRow, RbacScopeRow } from './rbacTypes';

export function useRbacRoleAccess(
  client: ReturnType<typeof useGraphClient>,
  board: RbacAccessBoardQuery | null,
  setError: (message: string | null) => void,
  setInfo: (message: string | null) => void
) {
  const { confirm } = useDialogs();
  const [selectedRoleId, selectRole] = useState<string | null>(null);
  const [permissionIds, setPermissionIds] = useState<Set<string>>(new Set());
  const [scopeRows, setScopeRows] = useState<RbacScopeRow[]>([]);
  const [inactiveIds, setInactiveIds] = useState<Set<string>>(new Set());
  const [loadedRoleId, setLoadedRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setLoadedRoleId(null);
    setPermissionIds(new Set());
    setScopeRows([]);
    setInactiveIds(new Set());
    if (!selectedRoleId) return;
    let cancelled = false;
    void client
      .request(RoleAccessConfigurationDocument, { roleId: selectedRoleId })
      .then((data) => {
        if (cancelled) return;
        const scopes = grantedScopes(
          board?.tenantCatalogPermissions ?? [],
          new Set(data.permissionIdsForRole),
          data.permissionScopesForRole
        );
        setPermissionIds(new Set(data.permissionIdsForRole));
        setScopeRows(scopes);
        setInactiveIds(
          new Set(
            data.permissionIdsForRole.filter((id) => {
              const permission = board?.tenantCatalogPermissions.find((row) => row.id === id);
              return (
                permission &&
                !scopes.some(
                  (scope) =>
                    scope.resource === permission.resource && scope.action === permission.action
                )
              );
            })
          )
        );
        setLoadedRoleId(selectedRoleId);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(graphQlUserMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [client, selectedRoleId, board, revision, setError]);
  const permissionsByResource = useMemo(() => {
    const result = new Map<string, RbacPermissionRow[]>();
    for (const permission of board?.tenantCatalogPermissions ?? []) {
      if (!result.has(permission.resource)) result.set(permission.resource, []);
      result.get(permission.resource)?.push(permission);
    }
    return result;
  }, [board]);
  const toggle = (id: string) => setPermissionIds((previous) => toggleRbacId(previous, id));
  const changeScope = (permission: RbacPermissionRow, scopeType: string) =>
    setScopeRows((previous) => [
      ...previous.filter(
        (row) => row.resource !== permission.resource || row.action !== permission.action
      ),
      ...(scopeType
        ? [{ resource: permission.resource, action: permission.action, scopeType }]
        : []),
    ]);
  const save = async () => {
    if (!selectedRoleId || loadedRoleId !== selectedRoleId || saving) return;
    setSaving(true);
    try {
      const draft = roleAccessDraft(
        board?.tenantCatalogPermissions ?? [],
        permissionIds,
        scopeRows,
        inactiveIds
      );
      if ('error' in draft) {
        setError(draft.error);
        return;
      }
      const role = board?.tenantDirectoryRoles.find((row) => row.id === selectedRoleId);
      const confirmed = await confirm(
        roleAccessConfirmation(role?.name ?? selectedRoleId, draft.scopes)
      );
      if (!confirmed) return;
      setInfo(null);
      setError(null);
      await client.request(SetRoleAccessDocument, { roleId: selectedRoleId, ...draft });
      setInfo('Permissions and scopes saved together. Assigned users must sign in again.');
      setRevision((value) => value + 1);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return {
    selectedRoleId,
    selectRole,
    permissionIds,
    scopeRows,
    saving,
    loading: loadedRoleId !== selectedRoleId,
    permissionsByResource,
    toggle,
    changeScope,
    save,
  };
}
