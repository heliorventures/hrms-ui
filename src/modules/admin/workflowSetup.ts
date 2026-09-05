export const WORKFLOW_TYPES = [
  {
    value: 'LEAVE_REQUEST',
    label: 'Leave',
    permission: 'leave:approve',
    description: 'Approve employee leave applications.',
  },
  {
    value: 'EXPENSE',
    label: 'Expenses',
    permission: 'expense:approve',
    description: 'Approve expense claims before reimbursement.',
  },
  {
    value: 'TRAVEL_REQUEST',
    label: 'Travel',
    permission: 'travel:approve',
    description: 'Approve travel requests before a trip.',
  },
  {
    value: 'TIMESHEET_WEEK_BATCH',
    label: 'Timesheets',
    permission: 'timesheet:approve',
    description: 'Approve submitted weekly timesheets.',
  },
] as const;

export const APPROVER_CHOICES = [
  { value: 'PERMISSION', label: 'Any eligible approver' },
  { value: 'REPORTING_MANAGER', label: 'Reporting manager' },
  {
    value: 'REPORTING_MANAGER_OR_PERMISSION',
    label: 'Reporting manager or another eligible approver',
  },
];

export function workflowType(entityType: string) {
  return WORKFLOW_TYPES.find((type) => type.value === entityType);
}

export function approverLabel(value: string | null | undefined): string {
  if (!value || ['MANAGER', 'LINE_MANAGER'].includes(value)) return 'Reporting manager';
  return (
    APPROVER_CHOICES.find((choice) => choice.value === value)?.label ??
    'Needs approval setup review'
  );
}
