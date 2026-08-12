import type { CreateAnnouncementInput } from '../../api/graphql/graphql';

export interface AnnouncementFileInputFields {
  imageFileName: string | null;
  imageMimeType: string | null;
  imageContentBase64: string | null;
  documentFileName: string | null;
  documentMimeType: string | null;
  documentContentBase64: string | null;
}

export interface AnnouncementInputFormValues {
  hrCompose: boolean;
  title: string;
  body: string;
  targetAudience: string;
  targetDepartmentId: string;
  targetLocationId: string;
  targetRoleCode: string;
  publishAt: string | null;
  expiresAt: string | null;
  employeePost: boolean;
}

const trimToNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export const buildCreateAnnouncementInput = (
  values: AnnouncementInputFormValues,
  files: AnnouncementFileInputFields
): CreateAnnouncementInput => {
  const roleCode = values.targetRoleCode.trim();

  return {
    title: values.title.trim(),
    body: trimToNullable(values.body),
    targetAudience:
      values.hrCompose && roleCode === '' ? trimToNullable(values.targetAudience) : null,
    targetDepartmentId: values.hrCompose ? trimToNullable(values.targetDepartmentId) : null,
    targetLocationId: values.hrCompose ? trimToNullable(values.targetLocationId) : null,
    targetRoleCode: values.hrCompose && roleCode !== '' ? roleCode.toUpperCase() : null,
    publishAt: values.hrCompose ? values.publishAt : null,
    expiresAt: values.hrCompose ? values.expiresAt : null,
    employeePost: values.hrCompose ? values.employeePost : true,
    ...files,
  };
};
