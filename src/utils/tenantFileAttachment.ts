import { privateFileObjectUrl, type PrivateFileAttachment } from './privateFileAttachment';

export type TenantFileAttachment = PrivateFileAttachment;

export interface TenantFileAttachmentResponse {
  tenantFileAttachment: TenantFileAttachment;
}

export const TenantFileAttachmentDocument = `
  query TenantFileAttachment($fileStorageId: ID!) {
    tenantFileAttachment(fileStorageId: $fileStorageId) {
      fileName
      mimeType
      fileSizeBytes
      contentBase64
    }
  }
`;

export const tenantFileObjectUrl = (attachment: TenantFileAttachment) =>
  privateFileObjectUrl(attachment);
