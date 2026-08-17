import { privateFileObjectUrl, type PrivateFileAttachment } from '../../utils/privateFileAttachment';

export type EmployeeDocumentAttachment = PrivateFileAttachment;

export interface EmployeeDocumentAttachmentResponse {
  employeeDocumentAttachment: EmployeeDocumentAttachment;
}

export const EmployeeDocumentAttachmentDocument = `
  query EmployeeDocumentAttachment($employeeDocumentId: ID!) {
    employeeDocumentAttachment(employeeDocumentId: $employeeDocumentId) {
      fileName
      mimeType
      fileSizeBytes
      contentBase64
    }
  }
`;

export const employeeDocumentObjectUrl = (attachment: PrivateFileAttachment) =>
  privateFileObjectUrl(attachment);
