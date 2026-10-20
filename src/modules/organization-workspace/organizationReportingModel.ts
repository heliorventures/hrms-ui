import { OrganizationDataError } from './organizationDataError';
import {
  asRecord,
  documentItems,
  requiredString,
  type OrganizationRecord,
} from './organizationDocuments';

export function formatReportedHours(seconds: unknown): string {
  const source = integerSeconds(seconds);
  if (source === null) return 'Unavailable';
  const hundredths = (source * 100n + 1800n) / 3600n;
  return `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`;
}

function integerSeconds(value: unknown): bigint | null {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return BigInt(value);
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value);
  return null;
}

export function companyProgressRows(
  companies: { membershipId: string; name: string }[],
  document: unknown
) {
  const source = asRecord(document);
  const version = source.schema_version;
  if (typeof version !== 'number')
    throw new OrganizationDataError('Unsupported organization data version.');
  const rows = documentItems(version, source.companies);
  if (typeof source.partial !== 'boolean')
    throw new OrganizationDataError(
      'Company report completeness is unavailable. Refresh the report.'
    );
  return companies.map((company) => {
    const row = rows.find((item) => item.membership_id === company.membershipId);
    const freshness: OrganizationRecord = row ? asRecord(row.freshness) : { state: 'MISSING' };
    return {
      membershipId: company.membershipId,
      name: company.name,
      logged: formatReportedHours(row?.logged_seconds),
      approved: formatReportedHours(row?.approved_seconds),
      freshness,
      daily: readProgressDays(row?.daily),
    };
  });
}

function readProgressDays(value: unknown): OrganizationRecord[] | null {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value))
    throw new OrganizationDataError('Daily company progress is unavailable. Refresh the report.');
  return value.map((item) => {
    const day = asRecord(item);
    const date = requiredString(day, 'work_date');
    return {
      id: date,
      work_date: date,
      logged_hours: formatReportedHours(day.logged_seconds),
      approved_hours: formatReportedHours(day.approved_seconds),
    };
  });
}

export function companyHistoryRows(
  companies: { tenantId: string; name: string }[],
  version: number,
  items: unknown
): OrganizationRecord[] {
  return documentItems(version, items).map((row) => {
    const company = companies.find(
      (item) => item.tenantId === requiredString(row, 'source_tenant_id')
    );
    if (!company)
      throw new OrganizationDataError(
        'A history record does not match the authorized source company selection. Refresh access.'
      );
    return { ...row, company_name: company.name };
  });
}

export interface OrganizationDateRange {
  from: string;
  to: string;
}
export function progressIsPartial(
  partial: boolean,
  rows: { freshness: OrganizationRecord }[]
): boolean {
  return partial || rows.some((row) => row.freshness.state !== 'READY');
}
export function historyDateBounds(range: OrganizationDateRange) {
  return {
    from: `${range.from}T00:00:00.000Z`,
    to: new Date(Date.parse(`${range.to}T00:00:00.000Z`) + 86_399_999).toISOString(),
  };
}
