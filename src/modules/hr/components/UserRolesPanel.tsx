import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import type { RbacRoleRow, RbacUserRow } from '../rbacTypes';

interface UserRolesPanelProps {
  loading: boolean;
  roles: RbacRoleRow[];
  selectedRoleIds: Set<string>;
  selectedUserId: string | null;
  users: RbacUserRow[];
  onSave: () => void;
  onSelectUser: (id: string) => void;
  onToggleRole: (roleId: string) => void;
}

const UserRolesPanel = ({
  loading,
  roles,
  selectedRoleIds,
  selectedUserId,
  users,
  onSave,
  onSelectUser,
  onToggleRole,
}: UserRolesPanelProps) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <Card title="Users">
      <ul className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto text-sm dark:divide-gray-800">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              className={`flex w-full flex-col items-start py-2 text-left ${
                selectedUserId === user.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => onSelectUser(user.id)}
            >
              <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
              <span className="text-xs text-gray-500">
                {user.email ? `${user.email} - ` : ''}
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
    <Card title={selectedUserId ? 'Assigned Roles' : 'Select A User'}>
      {!selectedUserId ? (
        <p className="text-sm text-gray-500">Choose A User On The Left.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading Roles...</p>
      ) : (
        <>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto">
            {roles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.has(role.id)}
                  onChange={() => onToggleRole(role.id)}
                />
                <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                {role.isSystemRole ? <span className="text-xs text-gray-400">system</span> : null}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Button type="button" variant="primary" onClick={onSave}>
              Save User Roles
            </Button>
          </div>
        </>
      )}
    </Card>
  </div>
);

export default UserRolesPanel;
