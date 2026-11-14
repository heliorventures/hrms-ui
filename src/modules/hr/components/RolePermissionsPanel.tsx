import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import type { RbacPermissionRow, RbacRoleRow, RbacScopeRow } from '../rbacTypes';

import PermissionScopeControl from './PermissionScopeControl';

interface RolePermissionsPanelProps {
  loading: boolean;
  permissionIds: Set<string>;
  permissionsByResource: Map<string, RbacPermissionRow[]>;
  roles: RbacRoleRow[];
  selectedRoleId: string | null;
  scopeRows: RbacScopeRow[];
  saving: boolean;
  onRoleChange: (id: string | null) => void;
  onSave: () => void;
  onTogglePermission: (permissionId: string) => void;
  onScopeChange: (permission: RbacPermissionRow, scope: string) => void;
}

const RolePermissionsPanel = ({
  loading,
  permissionIds,
  permissionsByResource,
  roles,
  selectedRoleId,
  scopeRows,
  saving,
  onRoleChange,
  onSave,
  onTogglePermission,
  onScopeChange,
}: RolePermissionsPanelProps) => (
  <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
    <Card title="Role">
      <select
        aria-label="Role to configure"
        disabled={saving}
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        value={selectedRoleId ?? ''}
        onChange={(event) => onRoleChange(event.target.value || null)}
      >
        <option value="">Select...</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </Card>
    <Card title="Permissions and data scopes">
      {!selectedRoleId && <p className="text-sm text-gray-500">Select A Role.</p>}
      {selectedRoleId && loading && <p className="text-sm text-gray-500">Loading Permissions...</p>}
      {selectedRoleId && !loading && (
        <>
          <p className="mb-3 text-sm text-gray-500">
            Save permissions and their exact scopes together. Existing grants without a scope are
            inactive. Select a supported scope deliberately to enable them.
          </p>
          <div className="max-h-[32rem] space-y-4 overflow-y-auto">
            {Array.from(permissionsByResource.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([resource, permissions]) => (
                <div key={resource}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {resource}
                  </h3>
                  <div className="mt-2 space-y-1">
                    {permissions.map((permission) => (
                      <PermissionScopeControl
                        key={permission.id}
                        permission={permission}
                        selected={permissionIds.has(permission.id)}
                        saving={saving}
                        scope={
                          scopeRows.find(
                            (row) =>
                              row.resource === permission.resource &&
                              row.action === permission.action
                          )?.scopeType ?? ''
                        }
                        onToggle={onTogglePermission}
                        onScopeChange={onScopeChange}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4">
            <Button type="button" variant="primary" disabled={saving} onClick={onSave}>
              {saving ? 'Saving...' : 'Save permissions and scopes'}
            </Button>
          </div>
        </>
      )}
    </Card>
  </div>
);

export default RolePermissionsPanel;
