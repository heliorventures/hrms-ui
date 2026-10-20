import {
  OrganizationConfigurationKind,
  RevokeOrganizationRoleDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import OrganizationBindingEditor from './OrganizationBindingEditor';
import { createCommandIntent } from './organizationCommand';
import {
  asRecord,
  requiredString,
  sourceVersion,
  type OrganizationRecord,
} from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationConfiguration } from './useOrganizationConfiguration';

const BindingCompanies = ({
  scope,
  binding,
}: {
  scope: OrganizationScope;
  binding: OrganizationRecord;
}) => {
  if (!Array.isArray(binding.company_scopes))
    return <p>Company scope unavailable. Refresh configuration.</p>;
  return (
    <ul className="space-y-2">
      {binding.company_scopes.map((value) => {
        const item = asRecord(value);
        const id = requiredString(item, 'organization_company_id');
        const company = scope.companies.find((entry) => entry.membershipId === id);
        const install = () => {
          if (company)
            void scope.commands.submit(
              scope.organization.id,
              company.name,
              createCommandIntent(
                company.membershipId,
                'install_grant',
                requiredString(binding, 'id'),
                sourceVersion(binding),
                {}
              )
            );
        };
        return (
          <li key={id} className="space-y-1">
            <p>
              {company?.name ?? id}: {requiredString(item, 'activation_status')}
            </p>
            {scope.organization.canDelegate &&
            company?.status === 'ACTIVE' &&
            item.activation_status !== 'ACTIVE' &&
            binding.status !== 'REVOKED' ? (
              <Button variant="outline" size="sm" onClick={install}>
                Install grant in {company.name}
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

const OrganizationBindings = ({
  scope,
  roles,
}: {
  scope: OrganizationScope;
  roles: OrganizationRecord[];
}) => {
  const query = useOrganizationConfiguration(scope, OrganizationConfigurationKind.Bindings);
  const action = useOrganizationAction(scope.refreshAccess);
  const revoke = (row: OrganizationRecord) => {
    const version = query.data?.organizationVersion;
    if (version !== undefined)
      void action.run(() =>
        scope.client.request(RevokeOrganizationRoleDocument, {
          organizationId: scope.organization.id,
          expectedVersion: version,
          bindingId: requiredString(row, 'id'),
          expectedBindingVersion: sourceVersion(row),
        })
      );
  };
  return (
    <div className="space-y-4">
      <Card title="Organization role bindings">
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Organization role bindings"
            rows={query.data?.items ?? []}
            fields={[
              { key: 'principal_id', label: 'Organization principal' },
              { key: 'role_id', label: 'Role reference' },
              { key: 'status', label: 'Central status' },
            ]}
            renderAction={(row) => (
              <div className="space-y-2">
                <BindingCompanies scope={scope} binding={row} />
                {scope.organization.canDelegate && row.status !== 'REVOKED' ? (
                  <ConfirmOrganizationAction
                    label="Revoke role"
                    description="Revoke this principal's role and its company scopes?"
                    busy={action.busy}
                    onConfirm={() => revoke(row)}
                  />
                ) : null}
              </div>
            )}
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
          />
        </OrganizationQueryState>
        {action.error ? <p role="alert">{action.error}</p> : null}
      </Card>
      {scope.organization.canDelegate && query.data ? (
        <OrganizationBindingEditor
          scope={scope}
          roles={roles}
          version={query.data.organizationVersion}
        />
      ) : null}
    </div>
  );
};

export default OrganizationBindings;
