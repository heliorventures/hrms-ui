import { OrganizationDataError } from './organizationDataError';
import { asRecord, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { records } from './organizationHrModel';
import type { OrganizationCompany } from './organizationTypes';

export function readHistoryArchive(
  value: unknown,
  organizationId: string,
  company: OrganizationCompany,
  archiveId: string
) {
  const response = asRecord(value);
  const manifest = asRecord(response.manifest);
  if (
    response.schema_version !== 1 ||
    manifest.id !== archiveId ||
    manifest.organization_id !== organizationId ||
    manifest.membership_id !== company.membershipId ||
    manifest.source_tenant_id !== company.tenantId
  )
    throw new OrganizationDataError(
      'The archive did not match the authorized source company and archive reference.'
    );
  sourceVersion(manifest, 'membership_version');
  const items = records(response.items);
  if (
    manifest.row_count !== items.length ||
    items.some((item) => item.source_tenant_id !== company.tenantId)
  )
    throw new OrganizationDataError(
      'The archive record manifest did not match the source history.'
    );
  return { manifest, items };
}

export interface HistoryArchive {
  manifest: OrganizationRecord;
  items: OrganizationRecord[];
}
