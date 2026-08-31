export interface EmployeeProfilePresentationAccess {
  canViewPayrollSensitive: boolean;
  canManageOrganizationFields: boolean;
}

export function canShowPayrollSensitive(access: EmployeeProfilePresentationAccess): boolean {
  return access.canViewPayrollSensitive;
}
