import { privateFileObjectUrl } from '../../utils/privateFileAttachment';
import {
  EmployeeDocumentAttachmentDocument,
  type EmployeeDocumentAttachmentQuery,
} from '../../api/graphql/graphql';

export { EmployeeDocumentAttachmentDocument };

export type EmployeeDocumentAttachment = EmployeeDocumentAttachmentQuery['employeeDocumentAttachment'];
export type EmployeeDocumentAttachmentResponse = EmployeeDocumentAttachmentQuery;

export const employeeDocumentObjectUrl = (attachment: EmployeeDocumentAttachment) =>
  privateFileObjectUrl(attachment);
