export type OrganizationTask =
  | 'inbox'
  | 'team'
  | 'progress'
  | 'history'
  | 'payroll'
  | 'hr'
  | 'administration';
interface TaskFlags {
  canManage: boolean;
  canDelegate: boolean;
  canReport: boolean;
  canHistory: boolean;
  canPayroll: boolean;
}
interface CompanyCapabilities {
  capabilities: readonly string[];
}
const INBOX_CAPABILITIES = ['leave:approve', 'timesheet:approve', 'performance:evaluate'];
const TEAM_CAPABILITIES = [...INBOX_CAPABILITIES, 'employee:read', 'feedback:write'];
const flagOrGrant = (flag: boolean, granted: Set<string>, capability: string) =>
  flag || granted.has(capability);

export function organizationTasks(
  organization: TaskFlags,
  companies: readonly CompanyCapabilities[]
): { value: OrganizationTask; label: string }[] {
  const tasks: { value: OrganizationTask; label: string }[] = [];
  const granted = new Set(companies.flatMap((company) => [...company.capabilities]));
  if (INBOX_CAPABILITIES.some((capability) => granted.has(capability)))
    tasks.push({ value: 'inbox', label: 'Manager inbox' });
  if (TEAM_CAPABILITIES.some((capability) => granted.has(capability)))
    tasks.push({ value: 'team', label: 'My team' });
  if (flagOrGrant(organization.canReport, granted, 'analytics:read'))
    tasks.push({ value: 'progress', label: 'Company progress' });
  if (flagOrGrant(organization.canHistory, granted, 'history:read'))
    tasks.push({ value: 'history', label: 'Business history' });
  if (flagOrGrant(organization.canPayroll, granted, 'payroll:manage'))
    tasks.push({ value: 'payroll', label: 'Scoped payroll' });
  if (
    ['employee:manage', 'role:manage', 'workflow:manage', 'onboarding:manage'].some((capability) =>
      granted.has(capability)
    )
  )
    tasks.push({ value: 'hr', label: 'Company HR administration' });
  if (organization.canManage || organization.canDelegate)
    tasks.push({ value: 'administration', label: 'Administration' });
  return tasks;
}
