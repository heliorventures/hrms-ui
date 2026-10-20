import { useState } from 'react';

import {
  InviteOrganizationCompanyDocument,
  OrganizationConfigurationKind,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

import OrganizationCompanyActions from './OrganizationCompanyActions';
import { requiredString } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationConfiguration } from './useOrganizationConfiguration';

const OrganizationCompaniesAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [tenantId, setTenantId] = useState('');
  const query = useOrganizationConfiguration(scope, OrganizationConfigurationKind.Companies);
  const action = useOrganizationAction(scope.refreshAccess);
  const rows =
    query.data?.items.map((row) => ({
      ...row,
      company_name:
        scope.companies.find((item) => item.membershipId === row.id)?.name ??
        requiredString(row, 'tenant_id'),
      directory_sync_status:
        scope.companies.find((item) => item.membershipId === row.id)?.directorySyncStatus ??
        'Unavailable',
    })) ?? [];
  const invite = () => {
    const version = query.data?.organizationVersion;
    if (version !== undefined)
      void action.run(() =>
        scope.client.request(InviteOrganizationCompanyDocument, {
          organizationId: scope.organization.id,
          expectedVersion: version,
          tenantId,
        })
      );
  };
  return (
    <Card title="Company membership">
      <p className="mb-3 text-sm text-content-secondary">
        Membership configuration and source runtime state are confirmed separately. Accepted and
        resumed companies need source installation. Suspension preserves reporting ownership;
        detachment releases it only after source confirmation.
      </p>
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        <OrganizationRecordTable
          label="Organization companies"
          rows={rows}
          fields={[
            { key: 'company_name', label: 'Company' },
            { key: 'status', label: 'Membership status' },
            { key: 'runtime_status', label: 'Source runtime status' },
            { key: 'version', label: 'Configuration version' },
            { key: 'installed_version', label: 'Source confirmed version' },
            { key: 'directory_sync_status', label: 'Directory baseline' },
          ]}
          renderAction={(row) =>
            query.data ? (
              <OrganizationCompanyActions
                scope={scope}
                row={row}
                organizationVersion={query.data.organizationVersion}
                busy={action.busy}
                run={action.run}
              />
            ) : null
          }
        />
        <OrganizationPager
          {...query}
          busy={query.loading}
          hasNext={query.data?.hasNextPage ?? false}
        />
        <Button variant="outline" className="mt-3" onClick={scope.refreshAccess}>
          Refresh membership source status
        </Button>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            invite();
          }}
        >
          <Input
            label="Company tenant reference"
            required
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            pattern="[0-9a-fA-F-]{36}"
            description="The invited company's administrator must accept from that company's login."
          />
          <Button type="submit" busy={action.busy}>
            Invite company
          </Button>
        </form>
      </OrganizationQueryState>
      {action.error ? <p role="alert">{action.error}</p> : null}
    </Card>
  );
};

export default OrganizationCompaniesAdmin;
