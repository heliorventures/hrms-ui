export const profileGuidanceTarget = (
  routePath: string | null,
  pathname: string,
  linkedEmployeeId?: string | null
) => {
  if (routePath === 'organization/employees/:employeeId') return pathname.split('/').pop() ?? null;
  if (routePath === 'profile/settings') return linkedEmployeeId ?? null;
  return null;
};
