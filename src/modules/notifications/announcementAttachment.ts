import type { AnnouncementAttachment } from './notificationTypes';
import { deferObjectUrlRevocation, privateFileObjectUrl } from '../../utils/privateFileAttachment';

const DEFAULT_ATTACHMENT_MIME_TYPE = 'application/octet-stream';
const DEFAULT_ATTACHMENT_FILE_NAME = 'attachment';

export type AnnouncementAttachmentKind = 'IMAGE' | 'DOCUMENT';

type AnnouncementAttachmentPresence = {
  hasImageAttachment?: boolean | null;
  hasDocumentAttachment?: boolean | null;
};

export const attachmentKindFor = (kind: 'image' | 'document'): AnnouncementAttachmentKind =>
  kind === 'image' ? 'IMAGE' : 'DOCUMENT';

export const hasAnnouncementAttachment = (
  announcement: AnnouncementAttachmentPresence,
  kind: AnnouncementAttachmentKind
) =>
  kind === 'IMAGE'
    ? Boolean(announcement.hasImageAttachment)
    : Boolean(announcement.hasDocumentAttachment);

export const announcementImageObjectUrl = (
  attachment: AnnouncementAttachment | null | undefined
) => (attachment?.contentBase64 ? privateFileObjectUrl(attachment) : null);

export const downloadAnnouncementAttachment = (attachment: AnnouncementAttachment) => {
  const binary = globalThis.atob(attachment.contentBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], {
    type: attachment.mimeType || DEFAULT_ATTACHMENT_MIME_TYPE,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.fileName || DEFAULT_ATTACHMENT_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  deferObjectUrlRevocation(url);
};
