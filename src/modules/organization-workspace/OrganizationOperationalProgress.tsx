import { OrganizationOperationalProgressDocument } from '../../api/organization/graphql';
import Card from '../../components/common/Card';

import BusinessRecordDetails from './BusinessRecordDetails';
import { asRecord, requiredString, type OrganizationRecord } from './organizationDocuments';
import { operationalCompanies, operationalRows } from './organizationOperationalModel';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import type { OrganizationDateRange } from './organizationReportingModel';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

const ReportCategory = ({
  label,
  rows,
  fields,
}: {
  label: string;
  rows: OrganizationRecord[] | null;
  fields: { key: string; label: string }[];
}) => (
  <details className="mt-3" open>
    <summary className="cursor-pointer font-medium">{label}</summary>
    {rows === null ? (
      <p className="mt-2">Unavailable from the source company.</p>
    ) : (
      <OrganizationRecordTable label={label} rows={rows} fields={fields} />
    )}
  </details>
);

const CompanyOperations = ({ record }: { record: OrganizationRecord }) => (
  <Card title={`${requiredString(record, 'company_name')}: attendance, leave and project time`}>
    {record.freshness ? (
      <BusinessRecordDetails record={asRecord(record.freshness)} />
    ) : (
      <p>Source freshness is unavailable.</p>
    )}
    <ReportCategory
      label="Daily attendance"
      rows={operationalRows(record.attendance)}
      fields={[
        { key: 'employee_id', label: 'Employee reference' },
        { key: 'work_date', label: 'Work date' },
        { key: 'status', label: 'Status' },
        { key: 'records', label: 'Attendance records' },
        { key: 'observed_seconds', label: 'Observed seconds' },
        { key: 'unknown_duration_records', label: 'Unknown duration records' },
        { key: 'overtime_seconds', label: 'Overtime seconds' },
        { key: 'late_minutes', label: 'Late minutes' },
        { key: 'early_exit_minutes', label: 'Early exit minutes' },
      ]}
    />
    <ReportCategory
      label="Leave requests in period"
      rows={operationalRows(record.leave)}
      fields={[
        { key: 'employee_id', label: 'Employee reference' },
        { key: 'from_date', label: 'From date' },
        { key: 'to_date', label: 'Through date' },
        { key: 'requested_days', label: 'Requested days (whole request)' },
        { key: 'status', label: 'Request status' },
      ]}
    />
    <ReportCategory
      label="Project time"
      rows={operationalRows(record.project_time)}
      fields={[
        { key: 'employee_id', label: 'Employee reference' },
        { key: 'work_date', label: 'Work date' },
        { key: 'project_code', label: 'Project' },
        { key: 'logged_seconds', label: 'Logged seconds' },
        { key: 'approved_seconds', label: 'Approved seconds' },
      ]}
    />
  </Card>
);

const OrganizationOperationalProgress = ({
  scope,
  companies,
  range,
}: {
  scope: OrganizationScope;
  companies: OrganizationCompany[];
  range: OrganizationDateRange;
}) => {
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|operational-progress|${JSON.stringify(range)}`,
    async () => {
      const response = (
        await scope.client.request(OrganizationOperationalProgressDocument, {
          organizationId: scope.organization.id,
          membershipIds: companies.map((company) => company.membershipId),
          ...range,
        })
      ).organizationOperationalProgress;
      return {
        companies: operationalCompanies(response),
        partial: asRecord(response).partial === true,
      };
    }
  );
  return (
    <OrganizationQueryState {...query} onRetry={query.refresh}>
      <p className="text-sm">
        Attendance durations and project hours describe recorded activity. Leave days cover each
        whole request intersecting the period.
      </p>
      {query.data?.partial ? (
        <p role="status">
          Partial operational report. Unavailable company data cannot be treated as zero.
        </p>
      ) : null}
      {query.data?.companies.map((record) => (
        <CompanyOperations key={requiredString(record, 'membership_id')} record={record} />
      ))}
    </OrganizationQueryState>
  );
};

export default OrganizationOperationalProgress;
