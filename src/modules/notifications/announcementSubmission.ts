import type { GraphQLClient } from 'graphql-request';

import { fileToBase64 } from '../../utils/fileEncoding';

import { safeVideoLink } from './announcementVideoUpload';
import { buildCreateAnnouncementInput } from './createAnnouncementInput';
import type { AnnouncementFormValues } from './CreateAnnouncementModal.types';
import { CreateAnnouncementSafeDocument } from './notificationQueries';

async function encodeOptionalFile(file: File | null) {
  return file ? fileToBase64(file) : { b64: null, name: null, mime: null };
}

export async function publishAnnouncement({
  client,
  values,
  hrCompose,
  schedule,
  prepareVideo,
  ensureCurrent,
}: {
  client: GraphQLClient;
  values: AnnouncementFormValues;
  hrCompose: boolean;
  schedule: { publishAt: string | null; expiresAt: string | null };
  prepareVideo: (file: File | null) => Promise<string | null>;
  ensureCurrent: () => void;
}) {
  const [image, document] = await Promise.all([
    encodeOptionalFile(values.imageFile),
    encodeOptionalFile(values.documentFile),
  ]);
  ensureCurrent();
  const videoUploadStageId = await prepareVideo(
    values.videoMode === 'UPLOAD' ? values.videoFile : null
  );
  ensureCurrent();
  await client.request(CreateAnnouncementSafeDocument, {
    input: {
      ...buildCreateAnnouncementInput(
        {
          hrCompose,
          title: values.title,
          body: values.body,
          targetAudience: values.targetAudience,
          targetDepartmentId: values.departmentId,
          targetLocationId: values.locationId,
          targetRoleCode: values.roleCode,
          ...schedule,
          employeePost: values.employeePost,
        },
        {
          imageFileName: image.name,
          imageMimeType: image.mime,
          imageContentBase64: image.b64,
          documentFileName: document.name,
          documentMimeType: document.mime,
          documentContentBase64: document.b64,
        }
      ),
      videoUploadStageId,
      videoLink: values.videoMode === 'LINK' ? safeVideoLink(values.videoLink) : null,
    },
  });
  ensureCurrent();
}
