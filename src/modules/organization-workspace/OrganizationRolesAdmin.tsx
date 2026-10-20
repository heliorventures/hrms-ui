import { useState } from 'react';

import {
  OrganizationCapabilityCatalogDocument,
  OrganizationConfigurationKind,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import OrganizationBindings from './OrganizationBindings';
import type { OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import OrganizationRoleEditor from './OrganizationRoleEditor';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationConfiguration } from './useOrganizationConfiguration';
import { useOrganizationQuery } from './useOrganizationQuery';

const OrganizationRolesAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [editor, setEditor] = useState<OrganizationRecord | 'new' | null>(null);
  const roles = useOrganizationConfiguration(scope, OrganizationConfigurationKind.Roles);
  const catalog = useOrganizationQuery(
    `${organizationScopeKey(scope)}|catalog`,
    async () =>
      (await scope.client.request(OrganizationCapabilityCatalogDocument))
        .organizationCapabilityCatalog
  );
  return (
    <div className="space-y-4">
      <Card title="Organization roles">
        <OrganizationQueryState {...roles} onRetry={roles.refresh}>
          <OrganizationRecordTable
            label="Organization role definitions"
            rows={roles.data?.items ?? []}
            fields={[
              { key: 'name', label: 'Role' },
              { key: 'status', label: 'Status' },
            ]}
            renderAction={
              scope.organization.canManage
                ? (row) => (
                    <Button variant="outline" size="sm" onClick={() => setEditor(row)}>
                      Review capabilities
                    </Button>
                  )
                : undefined
            }
          />
          <OrganizationPager
            {...roles}
            busy={roles.loading}
            hasNext={roles.data?.hasNextPage ?? false}
          />
          {scope.organization.canManage ? (
            <Button className="mt-3" onClick={() => setEditor('new')}>
              Create role
            </Button>
          ) : null}
        </OrganizationQueryState>
      </Card>
      {editor && roles.data ? (
        <OrganizationQueryState {...catalog} onRetry={catalog.refresh}>
          <OrganizationRoleEditor
            scope={scope}
            version={roles.data.organizationVersion}
            catalog={catalog.data ?? []}
            role={editor === 'new' ? undefined : editor}
            onClose={() => setEditor(null)}
          />
        </OrganizationQueryState>
      ) : null}
      <OrganizationBindings scope={scope} roles={roles.data?.items ?? []} />
    </div>
  );
};

export default OrganizationRolesAdmin;
