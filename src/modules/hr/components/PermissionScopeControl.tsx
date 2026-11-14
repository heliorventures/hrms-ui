import type { RbacPermissionRow } from '../rbacTypes';

interface Props {
  permission: RbacPermissionRow;
  selected: boolean;
  scope: string;
  saving: boolean;
  onToggle: (id: string) => void;
  onScopeChange: (permission: RbacPermissionRow, scope: string) => void;
}

const PermissionScopeControl = ({
  permission,
  selected,
  scope,
  saving,
  onToggle,
  onScopeChange,
}: Props) => (
  <div className="flex flex-wrap items-center gap-2 py-1 text-sm">
    <label className="flex min-w-48 flex-1 cursor-pointer items-start gap-2">
      <input
        type="checkbox"
        disabled={saving || (!selected && permission.supportedScopeTypes.length === 0)}
        checked={selected}
        onChange={() => onToggle(permission.id)}
      />
      <span>
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {permission.action}
        </span>
        {permission.description && (
          <span className="ml-2 text-xs text-gray-500">{permission.description}</span>
        )}
      </span>
    </label>
    {selected && (
      <>
        {!scope && (
          <span className="text-xs text-amber-700 dark:text-amber-300">Inactive: no scope</span>
        )}
        <select
          aria-label={`Scope for ${permission.resource}:${permission.action}`}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
          value={scope}
          disabled={saving}
          onChange={(event) => onScopeChange(permission, event.target.value)}
        >
          <option value="">Select scope...</option>
          {scope && !permission.supportedScopeTypes.includes(scope) && (
            <option value={scope}>Unsupported: {scope}</option>
          )}
          {permission.supportedScopeTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </>
    )}
    {permission.supportedScopeTypes.length === 0 && (
      <span className="text-xs text-gray-500">
        No supported scope is configured for this action.
      </span>
    )}
  </div>
);

export default PermissionScopeControl;
