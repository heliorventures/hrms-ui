import { useState } from 'react';

import Card from '../../components/common/Card';
import FeedbackToast from '../../components/common/FeedbackToast';
import PageHeader from '../../components/common/PageHeader';
import PageInformation from '../../components/common/PageInformation';
import { useFeedbackState } from '../../hooks/useFeedbackState';
import { useGraphClient } from '../../hooks/useGraphClient';

import RbacAccessTabs from './components/RbacAccessTabs';
import RolePermissionsPanel from './components/RolePermissionsPanel';
import UserRolesPanel from './components/UserRolesPanel';
import type { RbacAccessTab } from './rbacTypes';
import { useRbacDirectory } from './useRbacDirectory';
import { useRbacRoleAccess } from './useRbacRoleAccess';
import { useRbacUserRoles } from './useRbacUserRoles';

const HrAccessManagementPage = () => {
  const client = useGraphClient('client');
  const [tab, setTab] = useState<RbacAccessTab>('users');
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [info, setInfo] = useFeedbackState<string | null>(null, 'success');
  const { board, loading, reload } = useRbacDirectory(client, setError);
  const users = useRbacUserRoles(client, board, setError, setInfo);
  const access = useRbacRoleAccess(client, board, setError, setInfo);
  const roles = board?.tenantDirectoryRoles ?? [];

  return (
    <div className="space-y-4">
      <div>
        <PageHeader title="Roles & Permissions" />
        <PageInformation title="Roles and permissions">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage company roles and exact permission scopes together. Changes require a fresh
            sign-in.
          </p>
        </PageInformation>
      </div>
      {error && (
        <FeedbackToast variant="error" messageKey={error}>
          {error}
        </FeedbackToast>
      )}
      {info && (
        <Card>
          <FeedbackToast variant="success">{info}</FeedbackToast>
        </Card>
      )}
      <RbacAccessTabs
        activeTab={tab}
        onReload={() => {
          if (!access.saving) void reload();
        }}
        onTabChange={(nextTab) => {
          setTab(nextTab);
          setInfo(null);
        }}
      />
      {loading && <p className="text-sm text-gray-500">Loading Directory...</p>}
      {!loading && tab === 'users' && (
        <UserRolesPanel
          loading={users.loading}
          roles={roles}
          selectedRoleIds={users.roleIds}
          selectedUserId={users.selectedUserId}
          users={board?.tenantDirectoryUsers ?? []}
          onSave={() => void users.save()}
          onSelectUser={users.selectUser}
          onToggleRole={users.toggle}
        />
      )}
      {!loading && tab !== 'users' && (
        <RolePermissionsPanel
          loading={access.loading}
          permissionIds={access.permissionIds}
          permissionsByResource={access.permissionsByResource}
          roles={roles}
          selectedRoleId={access.selectedRoleId}
          scopeRows={access.scopeRows}
          saving={access.saving}
          onRoleChange={access.selectRole}
          onSave={() => void access.save()}
          onTogglePermission={access.toggle}
          onScopeChange={access.changeScope}
        />
      )}
    </div>
  );
};

export default HrAccessManagementPage;
