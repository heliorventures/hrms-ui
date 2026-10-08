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

export const WORKFLOW_DOMAINS = {
  leave: { label: 'Leave', entityTypes: ['LEAVE_REQUEST'] },
  timesheets: { label: 'Timesheets', entityTypes: ['TIMESHEET_WEEK_BATCH'] },
  expenses: { label: 'Expenses & Travel', entityTypes: ['EXPENSE', 'TRAVEL_REQUEST'] },
} as const;

export type WorkflowDomain = keyof typeof WORKFLOW_DOMAINS;

export function parseWorkflowDomain(params: URLSearchParams): WorkflowDomain | null {
  const values = params.getAll('domain');
  if (values.length === 0) return 'leave';
  if (values.length !== 1) return null;
  const [value] = values;
  return Object.prototype.hasOwnProperty.call(WORKFLOW_DOMAINS, value)
    ? (value as WorkflowDomain)
    : null;
}

export function workflowTypesForDomain(domain: WorkflowDomain) {
  const { entityTypes }: { entityTypes: readonly string[] } = WORKFLOW_DOMAINS[domain];
  return WORKFLOW_TYPES.filter((type) => entityTypes.includes(type.value));
}

export function workflowBelongsToDomain(entityType: string, domain: WorkflowDomain): boolean {
  const { entityTypes }: { entityTypes: readonly string[] } = WORKFLOW_DOMAINS[domain];
  return entityTypes.includes(entityType);
}

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
