export interface PrivateFileAttachment {
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number | null;
  contentBase64: string;
}

const DEFAULT_ATTACHMENT_MIME_TYPE = 'application/octet-stream';

export const privateFileObjectUrl = (attachment: PrivateFileAttachment) => {
  const binary = globalThis.atob(attachment.contentBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], {
    type: attachment.mimeType || DEFAULT_ATTACHMENT_MIME_TYPE,
  });
  return URL.createObjectURL(blob);
};
