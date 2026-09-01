export const CANONICAL_EMPLOYEE_STATUSES = [
  'ACTIVE',
  'PROBATION',
  'INACTIVE',
  'ON_LEAVE',
  'SUSPENDED',
  'TERMINATED',
] as const;

export type CanonicalEmployeeStatus = (typeof CANONICAL_EMPLOYEE_STATUSES)[number];

const EMPLOYEE_STATUS_SET = new Set<string>(CANONICAL_EMPLOYEE_STATUSES);

export function parseEmployeeStatus(value?: string | null): CanonicalEmployeeStatus | null {
  const normalized = value?.trim().toUpperCase();
  return normalized && EMPLOYEE_STATUS_SET.has(normalized)
    ? (normalized as CanonicalEmployeeStatus)
    : null;
}

export function employeeStatusForDisplay(
  value?: string | null
): CanonicalEmployeeStatus | 'UNKNOWN' {
  return parseEmployeeStatus(value) ?? 'UNKNOWN';
}
