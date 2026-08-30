export { LEAVE_WORKFLOW_REFRESH_MESSAGE as LEAVE_APPROVAL_REFRESH_MESSAGE } from '../../utils/graphqlUserMessage';

export interface LeaveApprovalTarget {
  leaveRequestId: string;
  expectedWorkflowStepId: string;
}

export function leaveApprovalTarget(
  leaveRequestId: string,
  pendingApprovalStepId?: string | null
): LeaveApprovalTarget | null {
  const expectedWorkflowStepId = pendingApprovalStepId?.trim();
  if (!expectedWorkflowStepId) return null;
  return { leaveRequestId, expectedWorkflowStepId };
}
