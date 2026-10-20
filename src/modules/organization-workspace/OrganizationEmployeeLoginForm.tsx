import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';

import OrganizationAccountFields from './OrganizationAccountFields';
import { accountFields } from './organizationAccountModel';
import { createCommandIntent } from './organizationCommand';
import { records } from './organizationHrModel';
import OrganizationQueryState from './OrganizationQueryState';
import { resourcePending } from './organizationResource';
import OrganizationSourceForm from './OrganizationSourceForm';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationSourceList } from './useOrganizationSourceList';

const OrganizationEmployeeLoginForm = ({
  scope,
  employeeId,
  version,
  onSaved,
}: {
  scope: OrganizationScope;
  employeeId: string;
  version: number;
  onSaved: () => void;
}) => {
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const query = useOrganizationSourceList(scope, OrganizationOperation.AccountList, 'accounts');
  const { company } = scope;
  const submit = async (values: Record<string, string>) => {
    if (!company || !roleIds.length) return;
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(company.membershipId, 'employee_login_provision', employeeId, version, {
        username: values.username,
        email: values.email || null,
        initial_password: values.initial_password,
        role_ids: roleIds,
      })
    );
    onSaved();
  };
  return (
    <fieldset className="space-y-3 rounded-lg border border-line p-3">
      <legend>Create this employee&apos;s source login</legend>
      <p className="text-sm">
        Creates and links a new source account to this employee. The employee must change the
        initial password at first login.
      </p>
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        {query.data ? (
          <>
            <OrganizationAccountFields
              roles={records(query.data.record.available_roles)}
              selected={roleIds}
              onChange={setRoleIds}
            />
            {!roleIds.length ? <p role="status">Choose at least one source company role.</p> : null}
            <OrganizationSourceForm
              fields={accountFields(null)}
              label="Create and link employee login"
              disabled={!roleIds.length}
              busy={company ? resourcePending(scope, company.membershipId, employeeId) : true}
              onSubmit={submit}
            />
          </>
        ) : null}
      </OrganizationQueryState>
    </fieldset>
  );
};

export default OrganizationEmployeeLoginForm;
