export interface EmployeeManagerPresentation {
  reportingManagerName?: string | null;
  reportingManagerId?: string | null;
  reportingManagerTenantId?: string | null;
  reportingManagerOrganizationManaged?: boolean;
}

export function employeeManagerName(
  employee: EmployeeManagerPresentation,
  fallback = 'Not recorded'
): string {
  if (employee.reportingManagerName) return employee.reportingManagerName;
  return employee.reportingManagerOrganizationManaged ? 'Manager details unavailable' : fallback;
}

export function employeeManagerOwnershipLabel(
  employee: EmployeeManagerPresentation
): string | null {
  if (!employee.reportingManagerOrganizationManaged) return null;
  return employee.reportingManagerId === null && employee.reportingManagerTenantId
    ? 'Cross-company manager · organization-managed'
    : 'Organization-managed reporting';
}

export function localManagerUpdate(
  organizationManaged: boolean,
  managerId: string | null | undefined
): { reportingManagerId?: string | null } {
  if (organizationManaged || managerId === undefined) return {};
  return { reportingManagerId: managerId };
}
