// Purpose-limited activity pages retain exact source version strings.
import { OrganizationDataError } from './organizationDataError';
import {
  asRecord,
  documentItems,
  optionalString,
  requiredString,
  type OrganizationRecord,
} from './organizationDocuments';
import type { OrganizationDateRange } from './organizationReportingModel';

function utcDay(value: string): number {
  const time = Date.parse(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(time))
    throw new OrganizationDataError('Choose valid UTC dates within 31 days.');
  if (!new Date(time).toISOString().startsWith(value))
    throw new OrganizationDataError('Choose valid UTC dates within 31 days.');
  return time;
}

export function auditActivityBounds(range: OrganizationDateRange) {
  const from = utcDay(range.from);
  const to = utcDay(range.to) + 86_399_999;
  if (to < from || to - from >= 31 * 86_400_000)
    throw new OrganizationDataError(
      'Configuration activity requires an ordered range of at most 31 UTC days.'
    );
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

function exactVersion(record: OrganizationRecord, key: string): string {
  const value = requiredString(record, key);
  if (!/^[1-9]\d*$/.test(value))
    throw new OrganizationDataError('The configuration activity version is unavailable.');
  return value;
}

function activityRow(
  row: OrganizationRecord,
  companies: { tenantId: string; name: string }[]
): OrganizationRecord {
  const tenantId = requiredString(row, 'source_tenant_id');
  return {
    id: requiredString(row, 'id'),
    event_type: requiredString(row, 'event_type'),
    source_tenant_id: tenantId,
    company_name:
      companies.find((company) => company.tenantId === tenantId)?.name ??
      'Source company unavailable',
    actor_principal_id: requiredString(row, 'actor_principal_id'),
    aggregate_id: requiredString(row, 'aggregate_id'),
    aggregate_version: exactVersion(row, 'aggregate_version'),
    configuration_version: exactVersion(row, 'configuration_version'),
    occurred_at: requiredString(row, 'occurred_at'),
  };
}

export function readAuditActivityPage(
  value: unknown,
  companies: { tenantId: string; name: string }[]
) {
  const document = asRecord(value);
  if (document.status !== 'OBSERVED_ACTIVITY' || document.coverage !== 'NOT_ATTESTED')
    throw new OrganizationDataError(
      'Configuration activity coverage is unavailable. Refresh access.'
    );
  if (typeof document.schema_version !== 'number')
    throw new OrganizationDataError('Unsupported configuration activity version.');
  if (typeof document.has_next_page !== 'boolean')
    throw new OrganizationDataError('Configuration activity pagination is unavailable.');
  const endCursor = optionalString(document, 'end_cursor');
  if (document.has_next_page && !endCursor)
    throw new OrganizationDataError('The configuration activity cursor is unavailable.');
  return {
    schemaVersion: document.schema_version,
    items: documentItems(document.schema_version, document.items).map((row) =>
      activityRow(row, companies)
    ),
    endCursor,
    hasNextPage: document.has_next_page,
  };
}
