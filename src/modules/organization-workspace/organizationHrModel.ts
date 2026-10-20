import { type OrganizationOperation } from '../../api/organization/graphql';

import { readOrganizationResource } from './organizationApi';
import { OrganizationDataError } from './organizationDataError';
import { asRecord, type OrganizationRecord } from './organizationDocuments';
import type { OrganizationScope } from './organizationTypes';

export type HrSection = 'employees' | 'accounts' | 'workflows' | 'separations';
export const HR_SECTIONS: { value: HrSection; label: string; capability: string }[] = [
  { value: 'employees', label: 'Employees', capability: 'employee:manage' },
  { value: 'accounts', label: 'Accounts and roles', capability: 'role:manage' },
  { value: 'workflows', label: 'Approval workflows', capability: 'workflow:manage' },
  { value: 'separations', label: 'Employee exits and clearance', capability: 'onboarding:manage' },
];

export function records(value: unknown): OrganizationRecord[] {
  if (!Array.isArray(value)) throw new OrganizationDataError('Source records are unavailable.');
  return value.map(asRecord);
}

export async function readHrResource(
  scope: OrganizationScope,
  operation: OrganizationOperation,
  resourceId: string,
  version: number,
  payload: OrganizationRecord = {}
) {
  if (!scope.company) throw new OrganizationDataError('Select a source company.');
  const outcome = await readOrganizationResource(
    scope.client,
    {
      organizationId: scope.organization.id,
      membershipId: scope.company.membershipId,
      operation,
      resourceId,
      expectedVersion: version,
      payload,
    },
    scope.refreshAccess
  );
  if (
    outcome.status !== 'COMMITTED' ||
    outcome.resourceId !== resourceId ||
    outcome.resourceVersion <= 0
  )
    throw new OrganizationDataError(
      'Source records are awaiting confirmation. Refresh source data.'
    );
  return { record: asRecord(outcome.result), version: outcome.resourceVersion };
}

export const text = (record: OrganizationRecord, field: string) =>
  typeof record[field] === 'string' ? record[field] : '';

export function optionRecords(value: unknown, id: string, label: string) {
  return records(value).map((record) => ({ value: text(record, id), label: text(record, label) }));
}
