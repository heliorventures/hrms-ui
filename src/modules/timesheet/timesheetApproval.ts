export const TIMESHEET_APPROVAL_REFRESH_MESSAGE =
  'This timesheet moved to another approval step. Refresh the approval queue before trying again.';

export interface TimesheetApprovalTarget {
  id: string;
  expectedWorkflowStepId: string;
}

export function timesheetApprovalTarget(
  id: string,
  pendingApprovalStepId?: string | null
): TimesheetApprovalTarget | null {
  const expectedWorkflowStepId = pendingApprovalStepId?.trim();
  if (!expectedWorkflowStepId) return null;
  return { id, expectedWorkflowStepId };
}
