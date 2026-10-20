import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { readHrResource, text } from './organizationHrModel';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import { latestSourceVersion } from './organizationResource';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import OrganizationWorkflowEditor from './OrganizationWorkflowEditor';
import { useOrganizationQuery } from './useOrganizationQuery';
import { useOrganizationSourceList } from './useOrganizationSourceList';

const OrganizationWorkflowsAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const query = useOrganizationSourceList(scope, OrganizationOperation.WorkflowList, 'workflows');
  const id = selected ? text(selected, 'workflow_id') : '';
  const version =
    selected && scope.company
      ? latestSourceVersion(scope, scope.company.membershipId, id, sourceVersion(selected))
      : 1;
  const detail = useOrganizationQuery(
    id ? `${organizationScopeKey(scope)}|workflow-detail|${id}|${version}` : null,
    () => readHrResource(scope, OrganizationOperation.WorkflowDetail, id, version)
  );
  const editor = creating ? { record: {}, version: 1 } : detail.data;
  const saved = () => {
    setSelected(null);
    setCreating(false);
    query.refresh();
  };
  return (
    <div className="space-y-4">
      <Card title="Source approval workflows">
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Source approval workflow definitions"
            idKey="workflow_id"
            rows={query.data?.rows ?? []}
            fields={[
              { key: 'name', label: 'Workflow' },
              { key: 'entity_type', label: 'Request type' },
              { key: 'is_active', label: 'Active' },
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
                Manage workflow
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
        </OrganizationQueryState>
        <Button
          variant="outline"
          onClick={() => {
            setSelected(null);
            setCreating(true);
          }}
        >
          New source workflow
        </Button>
      </Card>
      <OrganizationQueryState {...detail} onRetry={detail.refresh}>
        {editor ? (
          <Card title="Source workflow definition">
            <OrganizationWorkflowEditor
              key={`${id}|${editor.version}`}
              scope={scope}
              record={editor.record}
              version={editor.version}
              onSaved={saved}
            />
          </Card>
        ) : null}
      </OrganizationQueryState>
    </div>
  );
};

export default OrganizationWorkflowsAdmin;
