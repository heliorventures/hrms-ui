import type { GraphQLClient } from 'graphql-request';

import { UpdateAnnouncementDocument } from '../../api/graphql/graphql';
import type { ConfirmOptions } from '../../contexts/DialogContext';
import { fileToBase64 } from '../../utils/fileEncoding';
import { CreateAnnouncementSafeDocument } from '../notifications/notificationQueries';

import type { AdminAnnouncementRow, AnnouncementEditorState } from './adminNotificationsPageTypes';
import {
  buildAnnouncementAudienceUpdate,
  roleCodeFromTargetAudience,
  type AnnouncementAudienceUpdateInput,
} from './announcementUpdateInput';

const MAX_ANNOUNCEMENT_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ANNOUNCEMENT_DOCUMENT_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

interface ValidAnnouncementValues {
  title: string;
  publishAt: string | null;
  expiresAt: string | null;
}

type AnnouncementValidationResult =
  | { valid: true; values: ValidAnnouncementValues }
  | { valid: false; message: string };

interface AnnouncementAttachments {
  imageFileName: string | null;
  imageMimeType: string | null;
  imageContentBase64: string | null;
  documentFileName: string | null;
  documentMimeType: string | null;
  documentContentBase64: string | null;
}

type ConfirmAudienceChange = (options: ConfirmOptions) => Promise<boolean>;

const nullableTrimmed = (value: string): string | null => {
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
};

const parseOptionalDateTime = (value: string): string | null | undefined => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const validateFile = (
  file: File | null,
  allowedTypes: Set<string>,
  maxBytes: number,
  label: string
): string | null => {
  if (!file) return null;
  if (file.size > maxBytes) {
    return `${label} must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.`;
  }
  if (!allowedTypes.has(file.type)) return `${label} file type is not allowed.`;
  return null;
};

export const validateAnnouncementEditor = (
  state: AnnouncementEditorState
): AnnouncementValidationResult => {
  const title = state.title.trim();
  if (!title) return { valid: false, message: 'Announcement title is required.' };

  const publishAt = parseOptionalDateTime(state.publishAt);
  const expiresAt = parseOptionalDateTime(state.expiresAt);
  if (publishAt === undefined || expiresAt === undefined) {
    return {
      valid: false,
      message: 'Publish and expiry dates must be valid date/time values.',
    };
  }
  if (publishAt && expiresAt && expiresAt <= publishAt) {
    return { valid: false, message: 'Expiry date must be after publish date.' };
  }

  const imageError = validateFile(
    state.imageFile,
    ALLOWED_IMAGE_TYPES,
    MAX_ANNOUNCEMENT_IMAGE_BYTES,
    'Announcement image'
  );
  if (imageError) return { valid: false, message: imageError };

  const documentError = validateFile(
    state.documentFile,
    ALLOWED_DOCUMENT_TYPES,
    MAX_ANNOUNCEMENT_DOCUMENT_BYTES,
    'Announcement document'
  );
  if (documentError) return { valid: false, message: documentError };
  return { valid: true, values: { title, publishAt, expiresAt } };
};

const audienceScopeSummary = ({
  roleCode,
  departmentId,
  locationId,
}: {
  roleCode: string | null;
  departmentId: string | null;
  locationId: string | null;
}): string =>
  `Role: ${roleCode ?? 'all roles'}; Department: ${departmentId ?? 'all departments'}; Location: ${locationId ?? 'all locations'}.`;

const needsAudienceConfirmation = (
  announcement: AdminAnnouncementRow,
  audience: AnnouncementAudienceUpdateInput
): boolean => {
  const storedRoleCode = roleCodeFromTargetAudience(announcement.targetAudience);
  const addsDepartment = !announcement.targetDepartmentId && Boolean(audience.targetDepartmentId);
  const addsLocation = !announcement.targetLocationId && Boolean(audience.targetLocationId);
  return Boolean(storedRoleCode) && (audience.clearRoleAudience || addsDepartment || addsLocation);
};

const confirmAudienceUpdate = async (
  confirm: ConfirmAudienceChange,
  announcement: AdminAnnouncementRow,
  audience: AnnouncementAudienceUpdateInput
): Promise<boolean> => {
  if (!needsAudienceConfirmation(announcement, audience)) return true;
  const storedRoleCode = roleCodeFromTargetAudience(announcement.targetAudience);
  return confirm({
    title: 'Review Announcement Audience Change',
    message: `Original scope: ${audienceScopeSummary({
      roleCode: storedRoleCode || null,
      departmentId: announcement.targetDepartmentId ?? null,
      locationId: announcement.targetLocationId ?? null,
    })}\n\nProposed scope: ${audienceScopeSummary({
      roleCode: audience.targetRoleCode,
      departmentId: audience.targetDepartmentId,
      locationId: audience.targetLocationId,
    })}`,
    confirmLabel: 'Update Announcement',
    variant: 'danger',
  });
};

const readAnnouncementAttachments = async (
  state: AnnouncementEditorState
): Promise<AnnouncementAttachments> => {
  const [image, document] = await Promise.all([
    state.imageFile ? fileToBase64(state.imageFile) : Promise.resolve(null),
    state.documentFile ? fileToBase64(state.documentFile) : Promise.resolve(null),
  ]);
  return {
    imageFileName: image?.name ?? null,
    imageMimeType: image?.mime ?? null,
    imageContentBase64: image?.b64 ?? null,
    documentFileName: document?.name ?? null,
    documentMimeType: document?.mime ?? null,
    documentContentBase64: document?.b64 ?? null,
  };
};

const updateAnnouncement = async (
  client: GraphQLClient,
  confirm: ConfirmAudienceChange,
  state: AnnouncementEditorState,
  values: ValidAnnouncementValues,
  announcement: AdminAnnouncementRow,
  attachments: AnnouncementAttachments
): Promise<boolean> => {
  const audience = buildAnnouncementAudienceUpdate({
    existingTargetAudience: announcement.targetAudience,
    roleCode: state.roleCode,
    clearRoleAudience: state.clearRoleAudience,
    departmentId: state.departmentId,
    locationId: state.locationId,
  });
  if (!(await confirmAudienceUpdate(confirm, announcement, audience))) return false;
  await client.request(UpdateAnnouncementDocument, {
    input: {
      id: announcement.id,
      title: values.title,
      body: nullableTrimmed(state.body),
      ...audience,
      clearTargetDepartment:
        Boolean(announcement.targetDepartmentId) && state.departmentId.trim() === '',
      clearTargetLocation: Boolean(announcement.targetLocationId) && state.locationId.trim() === '',
      publishAt: values.publishAt,
      expiresAt: values.expiresAt,
      clearPublishAt: !state.publishAt,
      clearExpiresAt: !state.expiresAt,
      clearImage: false,
      clearDocument: false,
      ...attachments,
    },
  });
  return true;
};

const createAnnouncement = async (
  client: GraphQLClient,
  state: AnnouncementEditorState,
  values: ValidAnnouncementValues,
  attachments: AnnouncementAttachments
): Promise<void> => {
  await client.request(CreateAnnouncementSafeDocument, {
    input: {
      title: values.title,
      body: nullableTrimmed(state.body),
      targetDepartmentId: nullableTrimmed(state.departmentId),
      targetLocationId: nullableTrimmed(state.locationId),
      targetRoleCode: nullableTrimmed(state.roleCode)?.toUpperCase() ?? null,
      publishAt: values.publishAt,
      expiresAt: values.expiresAt,
      employeePost: state.employeePost,
      ...attachments,
    },
  });
};

export const saveAnnouncement = async ({
  client,
  confirm,
  state,
  values,
  existingAnnouncement,
}: {
  client: GraphQLClient;
  confirm: ConfirmAudienceChange;
  state: AnnouncementEditorState;
  values: ValidAnnouncementValues;
  existingAnnouncement?: AdminAnnouncementRow;
}): Promise<boolean> => {
  const attachments = await readAnnouncementAttachments(state);
  if (existingAnnouncement) {
    return updateAnnouncement(client, confirm, state, values, existingAnnouncement, attachments);
  }
  await createAnnouncement(client, state, values, attachments);
  return true;
};
