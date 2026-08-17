import { privateFileObjectUrl, type PrivateFileAttachment } from '../../utils/privateFileAttachment';

export type CompanyDocumentAttachment = PrivateFileAttachment;

export interface CompanyDocumentAttachmentResponse {
  companyDocumentAttachment: CompanyDocumentAttachment;
}

export const CompanyDocumentAttachmentDocument = `
  query CompanyDocumentAttachment($companyDocumentId: ID!) {
    companyDocumentAttachment(companyDocumentId: $companyDocumentId) {
      fileName
      mimeType
      fileSizeBytes
      contentBase64
    }
  }
`;

export const companyDocumentObjectUrl = (attachment: CompanyDocumentAttachment) =>
  privateFileObjectUrl(attachment);
