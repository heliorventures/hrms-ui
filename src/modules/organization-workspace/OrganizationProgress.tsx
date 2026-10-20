import { OrganizationProgressDocument } from '../../api/organization/graphql';
import Card from '../../components/common/Card';

import BusinessRecordDetails from './BusinessRecordDetails';
import { asRecord } from './organizationDocuments';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import {
  companyProgressRows,
  progressIsPartial,
  type OrganizationDateRange,
} from './organizationReportingModel';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationQuery } from './useOrganizationQuery';

interface Props {
  scope: OrganizationScope;
  companies: OrganizationCompany[];
  range: OrganizationDateRange;
}
const OrganizationProgress = ({ scope, companies, range }: Props) => {
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|progress|${JSON.stringify(range)}`,
    async () => {
      const response = (
        await scope.client.request(OrganizationProgressDocument, {
          organizationId: scope.organization.id,
          membershipIds: companies.map((item) => item.membershipId),
          ...range,
        })
      ).organizationProgress;
      return {
        rows: companyProgressRows(companies, response),
        partial: asRecord(response).partial === true,
      };
    }
  );
  const incomplete = query.data ? progressIsPartial(query.data.partial, query.data.rows) : false;
  return (
    <OrganizationQueryState {...query} onRetry={query.refresh}>
      {incomplete ? (
        <Card>
          <p role="status">
            Partial or stale report. Review each company&apos;s freshness before drawing
            conclusions. Missing company values are unavailable.
          </p>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {query.data?.rows.map((row) => (
          <Card key={row.membershipId} title={row.name}>
            <SourceCompanyLabel name={row.name} />
            <dl className="my-3 grid grid-cols-2 gap-2 text-sm">
              <dt>Logged hours</dt>
              <dd className="tabular-nums">{row.logged}</dd>
              <dt>Approved hours</dt>
              <dd className="tabular-nums">{row.approved}</dd>
            </dl>
            <BusinessRecordDetails record={row.freshness} />
            {row.daily ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Daily logged and approved hours
                </summary>
                <div className="mt-2">
                  <OrganizationRecordTable
                    label={`Daily progress for ${row.name}`}
                    rows={row.daily}
                    fields={[
                      { key: 'work_date', label: 'Work date' },
                      { key: 'logged_hours', label: 'Logged hours' },
                      { key: 'approved_hours', label: 'Approved hours' },
                    ]}
                  />
                </div>
              </details>
            ) : null}
          </Card>
        ))}
      </div>
    </OrganizationQueryState>
  );
};

export default OrganizationProgress;
