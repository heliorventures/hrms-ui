import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import type { RbacPermissionRow, RbacRoleRow } from '../rbacTypes';

interface RolePermissionsPanelProps {
  loading: boolean;
  permissionIds: Set<string>;
  permissionsByResource: Map<string, RbacPermissionRow[]>;
  roles: RbacRoleRow[];
  selectedRoleId: string | null;
  onRoleChange: (id: string | null) => void;
  onSave: () => void;
  onTogglePermission: (permissionId: string) => void;
}

const RolePermissionsPanel = ({
  loading,
  permissionIds,
  permissionsByResource,
  roles,
  selectedRoleId,
  onRoleChange,
  onSave,
  onTogglePermission,
}: RolePermissionsPanelProps) => (
  <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
    <Card title="Role">
      <select
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
    <Card title="Permissions">
      {!selectedRoleId ? (
        <p className="text-sm text-gray-500">Select A Role.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading Permissions...</p>
      ) : (
        <>
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
                      <label key={permission.id} className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={permissionIds.has(permission.id)}
                          onChange={() => onTogglePermission(permission.id)}
                        />
                        <span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {permission.action}
                          </span>
                          {permission.description ? (
                            <span className="ml-2 text-xs text-gray-500">{permission.description}</span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4">
            <Button type="button" variant="primary" onClick={onSave}>
              Save Permissions
            </Button>
          </div>
        </>
      )}
    </Card>
  </div>
);

export default RolePermissionsPanel;
