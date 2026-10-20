import { useState } from 'react';

import { OrganizationHistoryDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import BusinessRecordDetails from './BusinessRecordDetails';
import { requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import {
  companyHistoryRows,
  historyDateBounds,
  type OrganizationDateRange,
} from './organizationReportingModel';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';

interface Props {
  scope: OrganizationScope;
  companies: OrganizationCompany[];
  range: OrganizationDateRange;
}
const OrganizationHistory = ({ scope, companies, range }: Props) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationPage(
    `${organizationScopeKey(scope)}|history|${JSON.stringify(range)}`,
    async (after) => {
      const page = (
        await scope.client.request(OrganizationHistoryDocument, {
          organizationId: scope.organization.id,
          membershipIds: companies.map((item) => item.membershipId),
          ...historyDateBounds(range),
          after,
          first: 50,
        })
      ).organizationHistory;
      return { ...page, items: companyHistoryRows(companies, page.schemaVersion, page.items) };
    }
  );
  const rows = query.data?.items ?? [];
  return (
    <div className="space-y-4">
      <Card title="Retained business history">
        <p className="mb-3 text-sm text-content-secondary">
          History access is separate from progress reporting. Only fields allowed by your current
          history grants are returned.
        </p>
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Authorized organization business history"
            requireSourceVersion={false}
            rows={rows}
            fields={[
              { key: 'company_name', label: 'Source company' },
              { key: 'occurred_at', label: 'Occurred at' },
              { key: 'event_type', label: 'Event' },
              { key: 'aggregate_type', label: 'Resource type' },
              { key: 'aggregate_version', label: 'Source version' },
            ]}
            renderAction={(row) => (
              <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                View permitted history fields
              </Button>
            )}
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
          />
        </OrganizationQueryState>
      </Card>
      {query.data && selected ? (
        <Card title={`History record ${requiredString(selected, 'id')}`}>
          <BusinessRecordDetails record={selected} />
          <Button variant="quiet" onClick={() => setSelected(null)}>
            Close history record
          </Button>
        </Card>
      ) : null}
    </div>
  );
};

export default OrganizationHistory;
