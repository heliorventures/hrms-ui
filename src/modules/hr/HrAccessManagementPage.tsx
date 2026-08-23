import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useDialogs } from '../../contexts/DialogContext';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  PermissionIdsForRoleDocument,
  PermissionScopesForRoleDocument,
  RoleIdsForUserDocument,
  SetRolePermissionsDocument,
  SetRolePermissionScopesDocument,
  SetUserRolesDocument,
  type PermissionIdsForRoleQuery,
  type PermissionScopesForRoleQuery,
  type RbacAdminBoardQuery,
  type RoleIdsForUserQuery,
} from '../../api/graphql/graphql';
import RbacAccessTabs from './components/RbacAccessTabs';
import RolePermissionsPanel from './components/RolePermissionsPanel';
import RoleScopesPanel from './components/RoleScopesPanel';
import UserRolesPanel from './components/UserRolesPanel';
import { RBAC_SCOPE_TYPES, type RbacAccessTab, type RbacScopeRow } from './rbacTypes';

const DEFAULT_SCOPE_ROW: RbacScopeRow = {
  resource: 'employee',
  action: 'write',
  scopeType: 'TEAM',
};

type RbacAdminBoardData = Omit<RbacAdminBoardQuery, 'tenantDirectoryUsers'> & {
  tenantDirectoryUsers: Array<{
    id: string;
    username: string;
    email?: string | null;
    isActive: boolean;
  }>;
};

const RbacAdminBoardWithUsernameDocument = `
  query RbacAdminBoardWithUsername($uLim: Int! = 120, $rLim: Int! = 80, $pLim: Int! = 400) {
    tenantDirectoryUsers(limit: $uLim) {
      id
      username
      email
      isActive
    }
    tenantDirectoryRoles(limit: $rLim) {
      id
      name
      description
      isSystemRole
    }
    tenantCatalogPermissions(limit: $pLim) {
      id
      resource
      action
      description
    }
  }
`;

const HrAccessManagementPage = () => {
  const client = useGraphClient('client');
  const { confirm } = useDialogs();
  const [tab, setTab] = useState<RbacAccessTab>('users');
  const [board, setBoard] = useState<RbacAdminBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userRoleIds, setUserRoleIds] = useState<Set<string>>(new Set());
  const [userRolesLoading, setUserRolesLoading] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permIds, setPermIds] = useState<Set<string>>(new Set());
  const [permLoading, setPermLoading] = useState(false);

  const [scopeRoleId, setScopeRoleId] = useState<string | null>(null);
  const [scopeRows, setScopeRows] = useState<RbacScopeRow[]>([]);
  const [scopeLoading, setScopeLoading] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoard(
        await client.request<RbacAdminBoardData>(RbacAdminBoardWithUsernameDocument, {
          uLim: 120,
          rLim: 80,
          pLim: 400,
        })
      );
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!selectedUserId) {
      setUserRoleIds(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      setUserRolesLoading(true);
      try {
        const data = await client.request<RoleIdsForUserQuery>(RoleIdsForUserDocument, {
          userId: selectedUserId,
        });
        if (!cancelled) setUserRoleIds(new Set(data.roleIdsForUser));
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setUserRolesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, selectedUserId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setPermIds(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      setPermLoading(true);
      try {
        const data = await client.request<PermissionIdsForRoleQuery>(PermissionIdsForRoleDocument, {
          roleId: selectedRoleId,
        });
        if (!cancelled) setPermIds(new Set(data.permissionIdsForRole));
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setPermLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, selectedRoleId]);

  useEffect(() => {
    if (!scopeRoleId) {
      setScopeRows([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setScopeLoading(true);
      try {
        const data = await client.request<PermissionScopesForRoleQuery>(
          PermissionScopesForRoleDocument,
          { roleId: scopeRoleId }
        );
        if (!cancelled) {
          setScopeRows(
            data.permissionScopesForRole.map((row) => ({
              resource: row.resource,
              action: row.action,
              scopeType: row.scopeType,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setScopeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, scopeRoleId]);

  const permsByResource = useMemo(() => {
    const result = new Map<string, RbacAdminBoardData['tenantCatalogPermissions']>();
    for (const permission of board?.tenantCatalogPermissions ?? []) {
      if (!result.has(permission.resource)) result.set(permission.resource, []);
      result.get(permission.resource)!.push(permission);
    }
    return result;
  }, [board]);

  const toggleUserRole = (roleId: string) => {
    setUserRoleIds((previous) => {
      const next = new Set(previous);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });
  };

  const togglePerm = (permissionId: string) => {
    setPermIds((previous) => {
      const next = new Set(previous);
      next.has(permissionId) ? next.delete(permissionId) : next.add(permissionId);
      return next;
    });
  };

  const saveUserRoles = async () => {
    if (!selectedUserId) return;
    const user = board?.tenantDirectoryUsers.find((row) => row.id === selectedUserId);
    const confirmed = await confirm({
      title: 'Update assigned roles',
      message: `This replaces the role list for ${user?.username ?? selectedUserId}. Affected users may need to sign out and sign in again for new permissions to apply.`,
      confirmLabel: `Save ${userRoleIds.size} role(s)`,
      variant: 'default',
    });
    if (!confirmed) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetUserRolesDocument, {
        userId: selectedUserId,
        roleIds: Array.from(userRoleIds),
      });
      setInfo('Saved. Ask the user to sign out and back in so their JWT picks up new roles.');
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const saveRolePerms = async () => {
    if (!selectedRoleId) return;
    const role = board?.tenantDirectoryRoles.find((row) => row.id === selectedRoleId);
    const confirmed = await confirm({
      title: 'Update role permissions',
      message: `This replaces all permissions for ${role?.name ?? selectedRoleId}. Review once before saving because access for that role changes immediately.`,
      confirmLabel: `Save ${permIds.size} permission(s)`,
      variant: 'default',
    });
    if (!confirmed) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetRolePermissionsDocument, {
        roleId: selectedRoleId,
        permissionIds: Array.from(permIds),
      });
      setInfo('Permissions updated. Users must refresh login to see permission changes.');
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const saveScopes = async () => {
    if (!scopeRoleId) return;
    const catalogKeys = new Set(
      (board?.tenantCatalogPermissions ?? []).map(
        (permission) => `${permission.resource.trim()}:${permission.action.trim()}`
      )
    );
    const normalizedScopes = scopeRows.map((row) => ({
      resource: row.resource.trim(),
      action: row.action.trim(),
      scopeType: row.scopeType.trim().toUpperCase(),
    }));
    const duplicateCheck = new Set<string>();
    for (const row of normalizedScopes) {
      if (!row.resource || !row.action) {
        setError('Scope resource and action are required.');
        return;
      }
      if (!catalogKeys.has(`${row.resource}:${row.action}`)) {
        setError(`Scope ${row.resource}:${row.action} is not in the tenant permission catalog.`);
        return;
      }
      if (!RBAC_SCOPE_TYPES.includes(row.scopeType as (typeof RBAC_SCOPE_TYPES)[number])) {
        setError(`Scope type ${row.scopeType} is invalid.`);
        return;
      }
      const duplicateKey = `${row.resource}:${row.action}:${row.scopeType}`;
      if (duplicateCheck.has(duplicateKey)) {
        setError(`Duplicate scope ${duplicateKey} is not allowed.`);
        return;
      }
      duplicateCheck.add(duplicateKey);
    }
    const role = board?.tenantDirectoryRoles.find((row) => row.id === scopeRoleId);
    const hasAllScope = normalizedScopes.some((row) => row.scopeType === 'ALL');
    const confirmed = await confirm({
      title: 'Update permission scopes',
      message:
        `This replaces all permission scope rules for ${role?.name ?? scopeRoleId}.` +
        (hasAllScope ? ' This includes ALL-scope, which applies tenant-wide.' : ''),
      confirmLabel: `Save ${normalizedScopes.length} scope row(s)`,
      variant: hasAllScope ? 'danger' : 'default',
    });
    if (!confirmed) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetRolePermissionScopesDocument, {
        roleId: scopeRoleId,
        scopes: normalizedScopes,
      });
      setInfo('Scopes saved.');
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const updateScopeRow = (index: number, patch: Partial<RbacScopeRow>) => {
    setScopeRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const roles = board?.tenantDirectoryRoles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage tenant RBAC. Changes to roles or permissions require users to obtain a fresh token.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {info && (
        <Card>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>
        </Card>
      )}

      <RbacAccessTabs
        activeTab={tab}
        onReload={() => void loadBoard()}
        onTabChange={(nextTab) => {
          setTab(nextTab);
          setInfo(null);
        }}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading Directory...</p>
      ) : tab === 'users' ? (
        <UserRolesPanel
          loading={userRolesLoading}
          roles={roles}
          selectedRoleIds={userRoleIds}
          selectedUserId={selectedUserId}
          users={board?.tenantDirectoryUsers ?? []}
          onSave={() => void saveUserRoles()}
          onSelectUser={setSelectedUserId}
          onToggleRole={toggleUserRole}
        />
      ) : tab === 'roles' ? (
        <RolePermissionsPanel
          loading={permLoading}
          permissionIds={permIds}
          permissionsByResource={permsByResource}
          roles={roles}
          selectedRoleId={selectedRoleId}
          onRoleChange={setSelectedRoleId}
          onSave={() => void saveRolePerms()}
          onTogglePermission={togglePerm}
        />
      ) : (
        <RoleScopesPanel
          loading={scopeLoading}
          roles={roles}
          rows={scopeRows}
          selectedRoleId={scopeRoleId}
          onAddRow={() => setScopeRows((rows) => [...rows, DEFAULT_SCOPE_ROW])}
          onRemoveRow={(index) => setScopeRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
          onRoleChange={setScopeRoleId}
          onSave={() => void saveScopes()}
          onUpdateRow={updateScopeRow}
        />
      )}
    </div>
  );
};

export default HrAccessManagementPage;
