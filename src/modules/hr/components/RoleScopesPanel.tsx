import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { RBAC_SCOPE_TYPES, type RbacRoleRow, type RbacScopeRow } from '../rbacTypes';

interface RoleScopesPanelProps {
  loading: boolean;
  roles: RbacRoleRow[];
  rows: RbacScopeRow[];
  selectedRoleId: string | null;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onRoleChange: (id: string | null) => void;
  onSave: () => void;
  onUpdateRow: (index: number, patch: Partial<RbacScopeRow>) => void;
}

const RoleScopesPanel = ({
  loading,
  roles,
  rows,
  selectedRoleId,
  onAddRow,
  onRemoveRow,
  onRoleChange,
  onSave,
  onUpdateRow,
}: RoleScopesPanelProps) => (
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
      <p className="mt-3 text-xs text-gray-500">
        Rows map to <span className="font-mono">permission_scope</span> for list filters.
      </p>
    </Card>
    <Card title="Scope rows">
      {!selectedRoleId ? (
        <p className="text-sm text-gray-500">Select a role.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading scopes...</p>
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
                {rows.map((row, index) => (
                  <tr
                    key={`${row.resource}-${row.action}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                        value={row.resource}
                        onChange={(event) => onUpdateRow(index, { resource: event.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                        value={row.action}
                        onChange={(event) => onUpdateRow(index, { action: event.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
                        value={row.scopeType}
                        onChange={(event) => onUpdateRow(index, { scopeType: event.target.value })}
                      >
                        {RBAC_SCOPE_TYPES.map((scopeType) => (
                          <option key={scopeType} value={scopeType}>
                            {scopeType}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => onRemoveRow(index)}
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
            <Button type="button" variant="outline" onClick={onAddRow}>
              Add row
            </Button>
            <Button type="button" variant="primary" onClick={onSave}>
              Save scopes
            </Button>
          </div>
        </>
      )}
    </Card>
  </div>
);

export default RoleScopesPanel;
