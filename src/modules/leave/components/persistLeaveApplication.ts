import { SubmitLeaveRequestDocument } from '../../../api/graphql/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { uploadTenantFile } from '../../../utils/tenantFileUpload';

import type { useApplyLeaveFields } from './useApplyLeaveFields';

export async function persistLeaveApplication(
  client: ReturnType<typeof useGraphClient>,
  fields: ReturnType<typeof useApplyLeaveFields>,
  halfDayEligible: boolean,
  isCurrentSubmission: () => boolean
) {
  const {
    supportingDocumentFile,
    leaveTypeId,
    fromDate,
    toDate,
    isHalfDay,
    halfDaySession,
    reason,
  } = fields;
  const supportingDocumentFileStorageId = supportingDocumentFile
    ? await uploadTenantFile(client, supportingDocumentFile, isCurrentSubmission)
    : null;
  if (!isCurrentSubmission()) return;
  await client.request(SubmitLeaveRequestDocument, {
    input: {
      leaveTypeId,
      fromDate,
      toDate,
      isHalfDay: halfDayEligible && isHalfDay,
      halfDaySession: halfDayEligible && isHalfDay && halfDaySession ? halfDaySession : null,
      reason: reason.trim(),
      supportingDocumentReference: null,
      supportingDocumentFileStorageId,
    },
  });
}
