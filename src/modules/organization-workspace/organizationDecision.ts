import { OrganizationDataError } from './organizationDataError';
import { requiredString, type OrganizationRecord } from './organizationDocuments';

export function organizationDecisionPayload(
  record: OrganizationRecord,
  decision: 'approve' | 'reject',
  reason: string
): Record<string, unknown> {
  if (decision === 'reject' && !reason.trim())
    throw new OrganizationDataError('Enter a rejection reason.');
  return {
    decision,
    expected_workflow_step_id: requiredString(record, 'expected_workflow_step_id'),
    ...(decision === 'reject' ? { rejection_reason: reason.trim() } : {}),
  };
}
