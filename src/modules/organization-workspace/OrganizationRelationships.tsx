import { useState } from 'react';

import {
  EndOrganizationRelationshipDocument,
  OrganizationRelationshipsDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { createCommandIntent } from './organizationCommand';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import OrganizationRelationshipEditor from './OrganizationRelationshipEditor';
import OrganizationRelationshipManagerEditor from './OrganizationRelationshipManagerEditor';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationPage } from './useOrganizationPage';

const OrganizationRelationships = ({ scope }: { scope: OrganizationScope }) => {
  const [replacement, setReplacement] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationPage(
    `${organizationScopeKey(scope)}|relationships`,
    async (after) =>
      (
        await scope.client.request(OrganizationRelationshipsDocument, {
          organizationId: scope.organization.id,
          after,
          first: 50,
        })
      ).organizationRelationships
  );
  const action = useOrganizationAction(scope.refreshAccess);
  const end = (row: OrganizationRecord) => {
    const graph = query.data?.graphVersion;
    if (graph !== undefined)
      void action.run(() =>
        scope.client.request(EndOrganizationRelationshipDocument, {
          organizationId: scope.organization.id,
          assignmentId: requiredString(row, 'id'),
          expectedVersion: sourceVersion(row),
          expectedGraphVersion: graph,
        })
      );
  };
  const install = (row: OrganizationRecord) => {
    const membershipId = requiredString(row, 'membership_id');
    const company = scope.companies.find((item) => item.membershipId === membershipId);
    if (company)
      void scope.commands.submit(
        scope.organization.id,
        company.name,
        createCommandIntent(
          membershipId,
          'install_relationship',
          requiredString(row, 'id'),
          sourceVersion(row),
          {}
        )
      );
  };
  return (
    <div className="space-y-4">
      <Card title="Manager relationships">
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Organization manager relationships"
            rows={query.data?.items ?? []}
            fields={[
              { key: 'company_name', label: 'Subject source company' },
              { key: 'subject_display_name', label: 'Employee' },
              { key: 'manager_display_name', label: 'Manager' },
              { key: 'manager_company_name', label: 'Manager employment company' },
              { key: 'relationship_type', label: 'Purpose' },
              { key: 'status', label: 'Status' },
              { key: 'effective_from', label: 'Effective from' },
              { key: 'effective_to', label: 'Effective until' },
            ]}
            renderAction={
              scope.organization.canManage
                ? (row) => (
                    <div className="space-y-2">
                      {row.status !== 'ENDED' ? (
                        <Button variant="outline" size="sm" onClick={() => setReplacement(row)}>
                          Change manager
                        </Button>
                      ) : null}
                      {row.status !== 'ENDED' ? (
                        <ConfirmOrganizationAction
                          label="End relationship"
                          description="End this manager assignment and its authority?"
                          busy={action.busy}
                          onConfirm={() => end(row)}
                        />
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => install(row)}>
                        Install current state in source company
                      </Button>
                    </div>
                  )
                : undefined
            }
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
          />
        </OrganizationQueryState>
        {action.error ? <p role="alert">{action.error}</p> : null}
      </Card>
      {replacement && query.data ? (
        <OrganizationRelationshipManagerEditor
          key={requiredString(replacement, 'id')}
          scope={scope}
          assignment={replacement}
          graphVersion={query.data.graphVersion}
          onClose={() => setReplacement(null)}
        />
      ) : null}
      {scope.organization.canManage && query.data ? (
        <OrganizationRelationshipEditor scope={scope} graphVersion={query.data.graphVersion} />
      ) : null}
    </div>
  );
};

export default OrganizationRelationships;
