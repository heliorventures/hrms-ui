import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import OrganizationAccountFields from './OrganizationAccountFields';
import { accountFields, initialAccountRoles } from './organizationAccountModel';
import { createCommandIntent, type BusinessOperation } from './organizationCommand';
import { sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { records, text } from './organizationHrModel';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import { resourcePending } from './organizationResource';
import OrganizationSourceForm from './OrganizationSourceForm';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationSourceList } from './useOrganizationSourceList';

const AccountEditor = ({
  scope,
  record,
  roles,
  onSaved,
}: {
  scope: OrganizationScope;
  record: OrganizationRecord | null;
  roles: OrganizationRecord[];
  onSaved: () => void;
}) => {
  const [roleIds, setRoleIds] = useState<string[]>(() => initialAccountRoles(record));
  const { company } = scope;
  if (!company) return null;
  const id = record ? text(record, 'user_id') : '';
  const version = record ? sourceVersion(record) : 1;
  const busy = id ? resourcePending(scope, company.membershipId, id) : false;
  const send = async (operation: BusinessOperation, payload: OrganizationRecord) => {
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(
        company.membershipId,
        operation,
        id || crypto.randomUUID(),
        version,
        payload
      )
    );
    onSaved();
  };
  const submit = (values: Record<string, string>) => {
    const payload: OrganizationRecord = { username: values.username, email: values.email || null };
    if (!record) {
      payload.initial_password = values.initial_password;
      payload.role_ids = roleIds;
    }
    return send(record ? 'account_update' : 'account_create', payload);
  };
  return (
    <Card
      title={record ? `Edit source account: ${text(record, 'username')}` : 'New source account'}
    >
      <p className="mb-3 text-sm">
        Source company account safety checks apply. New accounts must change their initial password.
      </p>
      <OrganizationSourceForm
        busy={busy}
        label={record ? 'Save source account' : 'Create source account'}
        onSubmit={submit}
        fields={accountFields(record)}
      />
      <OrganizationAccountFields roles={roles} selected={roleIds} onChange={setRoleIds} />
      {record ? (
        <div className="flex flex-wrap gap-2">
          <ConfirmOrganizationAction
            label="Replace source account roles"
            description="Replace this account's roles with the selected source company roles. Administrator and session safety checks apply."
            busy={busy}
            onConfirm={() => {
              void send('account_roles', { role_ids: roleIds });
            }}
          />
          <ConfirmOrganizationAction
            label={
              record.is_active === true ? 'Deactivate source account' : 'Activate source account'
            }
            description="Change this source company's account access. The source checks employment eligibility and protects required administrators."
            busy={busy}
            onConfirm={() => {
              void send('account_access', { is_active: record.is_active !== true });
            }}
          />
        </div>
      ) : null}
    </Card>
  );
};

const OrganizationAccountsAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const query = useOrganizationSourceList(scope, OrganizationOperation.AccountList, 'accounts');
  const saved = () => {
    setSelected(null);
    setCreating(false);
    query.refresh();
  };
  return (
    <div className="space-y-4">
      <Card title="Source accounts and roles">
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Source company accounts"
            idKey="user_id"
            rows={query.data?.rows ?? []}
            fields={[
              { key: 'username', label: 'Username' },
              { key: 'email', label: 'Email' },
              { key: 'is_active', label: 'Login enabled' },
            ]}
            renderAction={(record) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelected(record);
                  setCreating(false);
                }}
              >
                Manage account
              </Button>
            )}
          />
          <OrganizationPager
            canPrevious={query.hasPrevious}
            hasNext={query.data?.record.has_more === true}
            busy={query.loading}
            previous={query.previous}
            next={query.next}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSelected(null);
              setCreating(true);
            }}
          >
            New source account
          </Button>
        </OrganizationQueryState>
      </Card>
      {query.data && (selected || creating) ? (
        <AccountEditor
          key={selected ? `${text(selected, 'user_id')}|${sourceVersion(selected)}` : 'new'}
          scope={scope}
          record={selected}
          roles={records(query.data.record.available_roles)}
          onSaved={saved}
        />
      ) : null}
    </div>
  );
};

export default OrganizationAccountsAdmin;
