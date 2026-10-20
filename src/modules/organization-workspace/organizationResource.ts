import { OrganizationOperation } from '../../api/organization/graphql';

import { commandPresentation } from './organizationCommand';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import type { OrganizationScope } from './organizationTypes';

export interface OrganizationResourceReference {
  resourceId: string;
  membershipId: string;
  tenantId: string;
  companyName: string;
  employeeId: string;
  employeeName: string;
  kind: string;
  version: number;
}

export function resourceReference(row: OrganizationRecord): OrganizationResourceReference {
  return {
    resourceId: requiredString(row, 'resource_id'),
    membershipId: requiredString(row, 'membership_id'),
    tenantId: requiredString(row, 'tenant_id'),
    companyName: requiredString(row, 'company_name'),
    employeeId: requiredString(row, 'employee_id'),
    employeeName: requiredString(row, 'employee_name'),
    kind: requiredString(row, 'resource_type'),
    version: sourceVersion(row),
  };
}
export function detailOperation(kind: string): OrganizationOperation | null {
  if (kind === 'leave_request') return OrganizationOperation.LeaveDetail;
  if (kind === 'timesheet') return OrganizationOperation.TimesheetDetail;
  if (kind === 'performance_participant') return OrganizationOperation.ReviewDetail;
  return null;
}
export function latestSourceVersion(
  scope: OrganizationScope,
  membershipId: string,
  resourceId: string,
  version: number
): number {
  return scope.commands.commands
    .filter(
      (entry) =>
        entry.organizationId === scope.organization.id &&
        entry.intent.membershipId === membershipId &&
        entry.intent.resourceId === resourceId &&
        entry.outcome?.status === 'COMMITTED'
    )
    .reduce(
      (current, entry) => Math.max(current, entry.outcome?.resourceVersion ?? current),
      version
    );
}
export function resourcePending(
  scope: OrganizationScope,
  membershipId: string,
  resourceId: string
): boolean {
  return scope.commands.commands.some(
    (entry) =>
      entry.organizationId === scope.organization.id &&
      entry.intent.membershipId === membershipId &&
      entry.intent.resourceId === resourceId &&
      commandPresentation(entry.outcome?.status ?? '').pending
  );
}
