import { useState } from 'react';

import {
  OrganizationApprovalsDocument,
  OrganizationTeamDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { companyBusinessReady } from './organizationCompanyLifecycle';
import { documentItems, requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationFeedbackForm from './OrganizationFeedbackForm';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import {
  detailOperation,
  resourceReference,
  type OrganizationResourceReference,
} from './organizationResource';
import OrganizationResourcePanel from './OrganizationResourcePanel';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';

interface SelectionProps {
  scope: OrganizationScope;
  selected: OrganizationResourceReference | null;
  feedback: OrganizationRecord | null;
  closeResource: () => void;
  closeFeedback: () => void;
}
const ManagerSelectionPanels = ({
  scope,
  selected,
  feedback,
  closeResource,
  closeFeedback,
}: SelectionProps) => (
  <>
    {selected ? (
      <OrganizationResourcePanel
        key={`${selected.membershipId}|${selected.resourceId}`}
        scope={scope}
        reference={selected}
        onClose={closeResource}
      />
    ) : null}
    {feedback ? (
      <OrganizationFeedbackForm
        key={requiredString(feedback, 'id')}
        scope={scope}
        employee={feedback}
        onClose={closeFeedback}
      />
    ) : null}
  </>
);

const OrganizationManagerRecords = ({
  scope,
  mode,
}: {
  scope: OrganizationScope;
  mode: 'inbox' | 'team';
}) => {
  const [selected, setSelected] = useState<OrganizationResourceReference | null>(null);
  const [feedback, setFeedback] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationPage(`${organizationScopeKey(scope)}|${mode}`, async (after) => {
    const variables = {
      organizationId: scope.organization.id,
      membershipId: scope.company?.membershipId,
      after,
      first: 50,
    };
    if (mode === 'team')
      return (await scope.client.request(OrganizationTeamDocument, variables)).organizationTeam;
    return (await scope.client.request(OrganizationApprovalsDocument, variables))
      .organizationApprovals;
  });
  const actions = (row: OrganizationRecord) => {
    if (mode === 'inbox')
      return detailOperation(requiredString(row, 'resource_type')) ? (
        <Button variant="outline" size="sm" onClick={() => setSelected(resourceReference(row))}>
          Open source details
        </Button>
      ) : null;
    const company = scope.companies.find((item) => item.membershipId === row.membership_id);
    return company?.capabilities.includes('feedback:write') ? (
      <Button variant="outline" size="sm" onClick={() => setFeedback(row)}>
        Add employee-visible feedback
      </Button>
    ) : null;
  };
  const rows = query.data
    ? documentItems(query.data.schemaVersion, query.data.items).filter((row) =>
        scope.companies.some(
          (company) => company.membershipId === row.membership_id && companyBusinessReady(company)
        )
      )
    : [];
  const fields = [
    { key: 'company_name', label: 'Source company' },
    { key: 'display_name', label: 'Employee' },
    { key: 'status', label: mode === 'team' ? 'Employment status' : 'Source status' },
  ];
  if (mode === 'inbox')
    fields.push({ key: 'resource_type', label: 'Work item' }, { key: 'summary', label: 'Summary' });
  return (
    <div className="space-y-4">
      <Card title={mode === 'team' ? 'My team across companies' : 'Manager inbox across companies'}>
        <p className="mb-3 text-sm text-content-secondary">
          {mode === 'team'
            ? 'Employees shown are within your current installed relationships or explicit company grants.'
            : 'The inbox reflects source projections. Open current source details before approving or rejecting.'}
        </p>
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label={
              mode === 'team'
                ? 'Authorized cross-company team'
                : 'Authorized cross-company manager inbox'
            }
            rows={rows}
            fields={fields}
            renderAction={actions}
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
          />
        </OrganizationQueryState>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            setSelected(null);
            setFeedback(null);
            query.refresh();
          }}
        >
          Refresh records
        </Button>
      </Card>
      {query.data ? (
        <ManagerSelectionPanels
          scope={scope}
          selected={selected}
          feedback={feedback}
          closeResource={() => setSelected(null)}
          closeFeedback={() => setFeedback(null)}
        />
      ) : null}
    </div>
  );
};

export default OrganizationManagerRecords;
