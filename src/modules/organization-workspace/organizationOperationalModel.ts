import { OrganizationDataError } from './organizationDataError';
import { asRecord, type OrganizationRecord } from './organizationDocuments';

/** Source leave units are integer hundredths of days, retained as decimal strings. */
export function exactLeaveDays(value: unknown): string {
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) return 'Unavailable';
  const negative = value.startsWith('-');
  const digits = (negative ? value.slice(1) : value).padStart(3, '0');
  return `${negative ? '-' : ''}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

export function operationalRows(value: unknown): OrganizationRecord[] | null {
  if (value === null) return null;
  if (!Array.isArray(value))
    throw new OrganizationDataError('Operational reporting data is unavailable.');
  return value.map((item, index) => {
    const row = asRecord(item);
    return { ...row, id: String(index), requested_days: exactLeaveDays(row.requested_centidays) };
  });
}

export function operationalCompanies(value: unknown): OrganizationRecord[] {
  const response = asRecord(value);
  if (response.schema_version !== 1 || !Array.isArray(response.companies))
    throw new OrganizationDataError(
      'Operational report version is unavailable. Refresh reporting.'
    );
  return response.companies.map(asRecord);
}
