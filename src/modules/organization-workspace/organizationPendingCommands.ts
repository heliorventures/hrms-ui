import { type BusinessOperation, type CommandReference } from './organizationCommand';
import { companyCommandAllowed } from './organizationCompanyLifecycle';
import { OrganizationDataError } from './organizationDataError';
import {
  documentItems,
  requiredString,
  sourceVersion,
  type OrganizationRecord,
} from './organizationDocuments';
import type { OrganizationCompany } from './organizationTypes';
import type { OrganizationDocumentPage } from './useOrganizationPage';

const OPERATIONS: BusinessOperation[] = [
  'install_membership',
  'install_grant',
  'install_relationship',
  'leave_decision',
  'feedback_create',
  'review_submit',
  'timesheet_decision',
  'payroll_draft',
  'payroll_finalize',
  'payroll_job_cancel_before_execution',
  'employee_create',
  'employee_update',
  'employee_employment',
  'employee_login_provision',
  'account_create',
  'account_update',
  'account_access',
  'account_roles',
  'workflow_save',
  'workflow_activation',
  'separation_create',
  'separation_reject',
  'separation_cancel_approval',
  'clearance_update',
];

export interface RecoveredCompanyCommands {
  companyName: string;
  references: CommandReference[];
}

function referenceFromRecord(
  record: OrganizationRecord,
  companies: OrganizationCompany[]
): RecoveredCompanyCommands {
  const membershipId = requiredString(record, 'membership_id');
  const company = companies.find(
    (item) => item.membershipId === membershipId && item.tenantId === record.tenant_id
  );
  const operation = OPERATIONS.find((item) => item === record.operation);
  if (
    !company ||
    !operation ||
    !companyCommandAllowed(company, operation) ||
    !['SUBMITTED', 'AWAITING_CONFIRMATION'].includes(requiredString(record, 'status'))
  )
    throw new OrganizationDataError(
      'Pending command authority changed. Refresh organization access.'
    );
  return {
    companyName: company.name,
    references: [
      {
        commandId: requiredString(record, 'command_id'),
        resourceId: requiredString(record, 'resource_id'),
        membershipId,
        operation,
        expectedVersion: sourceVersion(record, 'expected_version'),
      },
    ],
  };
}

export async function loadPendingCommands(
  companies: OrganizationCompany[],
  load: (after: string | null) => Promise<OrganizationDocumentPage>
): Promise<RecoveredCompanyCommands[]> {
  let cursor: string | null = null;
  const seen = new Set<string>();
  const recovered: RecoveredCompanyCommands[] = [];
  for (;;) {
    const page = await load(cursor);
    recovered.push(
      ...documentItems(page.schemaVersion, page.items).map((record) =>
        referenceFromRecord(record, companies)
      )
    );
    if (!page.hasNextPage) return recovered;
    if (!page.endCursor || seen.has(page.endCursor))
      throw new OrganizationDataError(
        'Pending source confirmation pagination is unavailable. Refresh organization data.'
      );
    cursor = page.endCursor;
    seen.add(cursor);
  }
}
