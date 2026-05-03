import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  PermissionIdsForRoleDocument,
  PermissionScopesForRoleDocument,
  RbacAdminBoardDocument,
  RoleIdsForUserDocument,
  SetRolePermissionsDocument,
  SetRolePermissionScopesDocument,
  SetUserRolesDocument,
  type PermissionIdsForRoleQuery,
  type PermissionScopesForRoleQuery,
  type RbacAdminBoardQuery,
  type RoleIdsForUserQuery,
} from '../../api/graphql/graphql';

const HrAccessManagementPage = () => {
  const client = useGraphClient('client');
  const [tab, setTab] = useState<'users' | 'roles' | 'scopes'>('users');
  const [board, setBoard] = useState<RbacAdminBoardQuery | null>(null);
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
  const [scopeRows, setScopeRows] = useState<
    Array<{ resource: string; action: string; scopeType: string }>
  >([]);
  const [scopeLoading, setScopeLoading] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.request<RbacAdminBoardQuery>(RbacAdminBoardDocument, {
        uLim: 120,
        rLim: 80,
        pLim: 400,
      });
      setBoard(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load RBAC catalog');
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
    (async () => {
      setUserRolesLoading(true);
      try {
        const data = await client.request<RoleIdsForUserQuery>(RoleIdsForUserDocument, {
          userId: selectedUserId,
        });
        if (!cancelled) setUserRoleIds(new Set(data.roleIdsForUser));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load user roles');
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
    (async () => {
      setPermLoading(true);
      try {
        const data = await client.request<PermissionIdsForRoleQuery>(PermissionIdsForRoleDocument, {
          roleId: selectedRoleId,
        });
        if (!cancelled) setPermIds(new Set(data.permissionIdsForRole));
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load role permissions');
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
    (async () => {
      setScopeLoading(true);
      try {
        const data = await client.request<PermissionScopesForRoleQuery>(
          PermissionScopesForRoleDocument,
          {
            roleId: scopeRoleId,
          }
        );
        if (!cancelled)
          setScopeRows(
            data.permissionScopesForRole.map((r) => ({
              resource: r.resource,
              action: r.action,
              scopeType: r.scopeType,
            }))
          );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load scopes');
      } finally {
        if (!cancelled) setScopeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, scopeRoleId]);

  const permsByResource = useMemo(() => {
    const m = new Map<string, RbacAdminBoardQuery['tenantCatalogPermissions']>();
    for (const p of board?.tenantCatalogPermissions ?? []) {
      const k = p.resource;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    return m;
  }, [board]);

  const toggleUserRole = (roleId: string) => {
    setUserRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const togglePerm = (pid: string) => {
    setPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const saveUserRoles = async () => {
    if (!selectedUserId) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetUserRolesDocument, {
        userId: selectedUserId,
        roleIds: Array.from(userRoleIds),
      });
      setInfo('Saved. Ask the user to sign out and back in so their JWT picks up new roles.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const saveRolePerms = async () => {
    if (!selectedRoleId) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetRolePermissionsDocument, {
        roleId: selectedRoleId,
        permissionIds: Array.from(permIds),
      });
      setInfo('Permissions updated. Users must refresh login to see permission changes.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const saveScopes = async () => {
    if (!scopeRoleId) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetRolePermissionScopesDocument, {
        roleId: scopeRoleId,
        scopes: scopeRows.map((r) => ({
          resource: r.resource.trim(),
          action: r.action.trim(),
          scopeType: r.scopeType.trim().toUpperCase(),
        })),
      });
      setInfo('Scopes saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const addScopeRow = () => {
    setScopeRows((rows) => [...rows, { resource: 'employee', action: 'write', scopeType: 'TEAM' }]);
  };

  const updateScopeRow = (
    i: number,
    patch: Partial<{ resource: string; action: string; scopeType: string }>
  ) => {
    setScopeRows((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  const removeScopeRow = (i: number) => {
    setScopeRows((rows) => rows.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & permissions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage tenant RBAC. Changes to roles or permissions require users to obtain a fresh token
          (sign out / in) to apply.
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

      <div className="flex flex-wrap gap-2">
        {(['users', 'roles', 'scopes'] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={tab === t ? 'primary' : 'outline'}
            className="!py-1.5 !text-xs"
            onClick={() => {
              setTab(t);
              setInfo(null);
            }}
          >
            {t === 'users' ? 'User ↔ roles' : t === 'roles' ? 'Role permissions' : 'Data scopes'}
          </Button>
        ))}
        <Button type="button" variant="outline" className="!py-1.5 !text-xs" onClick={() => void loadBoard()}>
          Reload catalog
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading directory…</p>
      ) : tab === 'users' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Users">
            <ul className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto text-sm dark:divide-gray-800">
              {(board?.tenantDirectoryUsers ?? []).map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className={`flex w-full flex-col items-start py-2 text-left ${
                      selectedUserId === u.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{u.email}</span>
                    <span className="text-xs text-gray-500">{u.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={selectedUserId ? 'Assigned roles' : 'Select a user'}>
            {!selectedUserId ? (
              <p className="text-sm text-gray-500">Choose a user on the left.</p>
            ) : userRolesLoading ? (
              <p className="text-sm text-gray-500">Loading roles…</p>
            ) : (
              <>
                <div className="max-h-[22rem] space-y-2 overflow-y-auto">
                  {(board?.tenantDirectoryRoles ?? []).map((r) => (
                    <label key={r.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={userRoleIds.has(r.id)}
                        onChange={() => toggleUserRole(r.id)}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{r.name}</span>
                      {r.isSystemRole ? (
                        <span className="text-xs text-gray-400">system</span>
                      ) : null}
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <Button type="button" variant="primary" onClick={() => void saveUserRoles()}>
                    Save user roles
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : tab === 'roles' ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card title="Role">
            <select
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              value={selectedRoleId ?? ''}
              onChange={(e) => setSelectedRoleId(e.target.value || null)}
            >
              <option value="">Select…</option>
              {(board?.tenantDirectoryRoles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Card>
          <Card title="Permissions">
            {!selectedRoleId ? (
              <p className="text-sm text-gray-500">Select a role.</p>
            ) : permLoading ? (
              <p className="text-sm text-gray-500">Loading permissions…</p>
            ) : (
              <>
                <div className="max-h-[32rem] space-y-4 overflow-y-auto">
                  {Array.from(permsByResource.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([resource, plist]) => (
                      <div key={resource}>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {resource}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {plist.map((p) => (
                            <label key={p.id} className="flex cursor-pointer items-start gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={permIds.has(p.id)}
                                onChange={() => togglePerm(p.id)}
                              />
                              <span>
                                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                                  {p.action}
                                </span>
                                {p.description ? (
                                  <span className="ml-2 text-xs text-gray-500">{p.description}</span>
                                ) : null}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4">
                  <Button type="button" variant="primary" onClick={() => void saveRolePerms()}>
                    Save permissions
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card title="Role">
            <select
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              value={scopeRoleId ?? ''}
              onChange={(e) => setScopeRoleId(e.target.value || null)}
            >
              <option value="">Select…</option>
              {(board?.tenantDirectoryRoles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-gray-500">
              Rows map to <span className="font-mono">permission_scope</span> for list filters (e.g.
              TEAM on leave:approve).
            </p>
          </Card>
          <Card title="Scope rows">
            {!scopeRoleId ? (
              <p className="text-sm text-gray-500">Select a role.</p>
            ) : scopeLoading ? (
              <p className="text-sm text-gray-500">Loading scopes…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 pr-2">Resource</th>
                        <th className="py-2 pr-2">Action</th>
                        <th className="py-2 pr-2">Scope</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {scopeRows.map((row, i) => (
                        <tr key={`${row.resource}-${row.action}-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 pr-2">
                            <input
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                              value={row.resource}
                              onChange={(e) => updateScopeRow(i, { resource: e.target.value })}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                              value={row.action}
                              onChange={(e) => updateScopeRow(i, { action: e.target.value })}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                              value={row.scopeType}
                              onChange={(e) => updateScopeRow(i, { scopeType: e.target.value })}
                            >
                              {(['SELF', 'TEAM', 'DEPARTMENT', 'ALL'] as const).map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              className="text-xs text-red-600 hover:underline"
                              onClick={() => removeScopeRow(i)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={addScopeRow}>
                    Add row
                  </Button>
                  <Button type="button" variant="primary" onClick={() => void saveScopes()}>
                    Save scopes
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default HrAccessManagementPage;
