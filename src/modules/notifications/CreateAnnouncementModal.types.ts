import type { Dispatch, SetStateAction } from 'react';

import type { OrgDepartmentsQuery } from '../../api/graphql/graphql';

export interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export type AudienceOptionsState =
  | { phase: 'loading'; departments: [] }
  | { phase: 'loaded'; departments: OrgDepartmentsQuery['departments'] }
  | { phase: 'failed'; departments: []; message: string };

export interface AnnouncementFormValues {
  title: string;
  body: string;
  targetAudience: string;
  employeePost: boolean;
  departmentId: string;
  locationId: string;
  roleCode: string;
  publishAt: string;
  expiresAt: string;
  imageFile: File | null;
  documentFile: File | null;
}

export type SetAnnouncementField = <Field extends keyof AnnouncementFormValues>(
  field: Field,
  value: AnnouncementFormValues[Field]
) => void;

export interface AnnouncementFormState {
  values: AnnouncementFormValues;
  setValues: Dispatch<SetStateAction<AnnouncementFormValues>>;
  setField: SetAnnouncementField;
  reset: () => void;
}

export interface CreateAnnouncementModalController {
  audienceOptions: AudienceOptionsState;
  close: () => void;
  form: AnnouncementFormState;
  hrAudienceControlsDisabled: boolean;
  hrCompose: boolean;
  loadAudienceOptions: () => Promise<void>;
  submit: () => Promise<void>;
  submitError: string | null;
  submitting: boolean;
}
