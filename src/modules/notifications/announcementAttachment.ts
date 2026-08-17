import type { AnnouncementAttachment } from './notificationTypes';

const DEFAULT_ATTACHMENT_MIME_TYPE = 'application/octet-stream';
const DEFAULT_ATTACHMENT_FILE_NAME = 'attachment';

export const announcementImageSrc = (attachment: AnnouncementAttachment | null | undefined) => {
  if (!attachment?.contentBase64) return null;
  return `data:${attachment.mimeType || DEFAULT_ATTACHMENT_MIME_TYPE};base64,${attachment.contentBase64}`;
};

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
  URL.revokeObjectURL(url);
};
