import { OrganizationDataError } from './organizationDataError';

export type OrganizationRecord = Record<string, unknown>;

export function asRecord(value: unknown): OrganizationRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new OrganizationDataError('Invalid organization record. Refresh organization data.');
  }
  return value as OrganizationRecord;
}

export function documentItems(version: number, value: unknown): OrganizationRecord[] {
  if (version !== 1)
    throw new OrganizationDataError('Unsupported organization data version. Contact support.');
  if (!Array.isArray(value))
    throw new OrganizationDataError('Invalid organization record. Refresh organization data.');
  return value.map(asRecord);
}

export function requiredString(record: OrganizationRecord, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new OrganizationDataError(
      'Refresh organization data; a required source reference is unavailable.'
    );
  }
  return value;
}

export function optionalString(record: OrganizationRecord, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

export function sourceVersion(record: OrganizationRecord, key = 'version'): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new OrganizationDataError('Refresh the source record; its version is unavailable.');
  }
  return value;
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'Unavailable';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  return 'See source details';
}
