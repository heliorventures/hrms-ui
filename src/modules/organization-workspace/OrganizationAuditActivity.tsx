import { useState } from 'react';

import { OrganizationAuditHistoryDocument } from '../../api/organization/graphql';
import Card from '../../components/common/Card';

import { auditActivityBounds, readAuditActivityPage } from './organizationAuditActivityModel';
import OrganizationDateRangeForm from './OrganizationDateRangeForm';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import type { OrganizationDateRange } from './organizationReportingModel';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';

const ActivityRecords = ({
  scope,
  range,
}: {
  scope: OrganizationScope;
  range: OrganizationDateRange;
}) => {
  const query = useOrganizationPage(
    `${organizationScopeKey(scope)}|configuration-activity|${JSON.stringify(range)}`,
    async (after) =>
      readAuditActivityPage(
        (
          await scope.client.request(OrganizationAuditHistoryDocument, {
            organizationId: scope.organization.id,
            ...auditActivityBounds(range),
            after,
            first: 50,
          })
        ).organizationAuditHistory,
        scope.companies
      )
  );
  return (
    <OrganizationQueryState {...query} onRetry={query.refresh}>
      <OrganizationRecordTable
        label="Observed organization configuration activity"
        requireSourceVersion={false}
        rows={query.data?.items ?? []}
        fields={[
          { key: 'occurred_at', label: 'Occurred at (UTC)' },
          { key: 'company_name', label: 'Source company' },
          { key: 'event_type', label: 'Configuration event' },
          { key: 'actor_principal_id', label: 'Actor organization principal' },
          { key: 'aggregate_id', label: 'Resource reference' },
          { key: 'aggregate_version', label: 'Resource version' },
          { key: 'configuration_version', label: 'Configuration version' },
        ]}
      />
      <OrganizationPager
        {...query}
        busy={query.loading}
        hasNext={query.data?.hasNextPage ?? false}
      />
    </OrganizationQueryState>
  );
};

const OrganizationAuditActivity = ({ scope }: { scope: OrganizationScope }) => {
  const [range, setRange] = useState<OrganizationDateRange | null>(null);
  if (!scope.organization.canManage) return null;
  return (
    <Card title="Observed configuration activity">
      <p className="mb-3 text-sm text-content-secondary">
        This view shows observed configuration events. Complete capture has not been verified.
        Coverage is not attested. Choose at most 31 UTC days. Actor references identify organization
        principals.
      </p>
      <OrganizationDateRangeForm history onApply={setRange} />
      {range ? (
        <div className="mt-4">
          <ActivityRecords scope={scope} range={range} />
        </div>
      ) : null}
    </Card>
  );
};

export default OrganizationAuditActivity;
