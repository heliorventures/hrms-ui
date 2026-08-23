export interface AnnouncementAudienceUpdateValues {
  existingTargetAudience?: string | null;
  roleCode: string;
  clearRoleAudience: boolean;
  departmentId: string;
  locationId: string;
}

export interface AnnouncementAudienceUpdateInput {
  targetRoleCode: string | null;
  clearRoleAudience: boolean;
  targetDepartmentId: string | null;
  targetLocationId: string | null;
}

export function roleCodeFromTargetAudience(value: string | null | undefined): string {
  return value?.startsWith('ROLE:') ? value.slice('ROLE:'.length).trim().toUpperCase() : '';
}

export function buildAnnouncementAudienceUpdate(
  values: AnnouncementAudienceUpdateValues
): AnnouncementAudienceUpdateInput {
  const storedRoleCode = roleCodeFromTargetAudience(values.existingTargetAudience);
  const enteredRoleCode = values.roleCode.trim().toUpperCase();
  const roleCode = values.clearRoleAudience ? '' : enteredRoleCode || storedRoleCode;

  return {
    targetRoleCode: roleCode || null,
    clearRoleAudience: Boolean(storedRoleCode) && values.clearRoleAudience,
    targetDepartmentId: values.departmentId.trim() || null,
    targetLocationId: values.locationId.trim() || null,
  };
}
