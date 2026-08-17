import { privateFileObjectUrl } from './privateFileAttachment';
import {
  TenantFileAttachmentDocument,
  type TenantFileAttachmentQuery,
} from '../api/graphql/graphql';

export { TenantFileAttachmentDocument };

export type TenantFileAttachment = TenantFileAttachmentQuery['tenantFileAttachment'];
export type TenantFileAttachmentResponse = TenantFileAttachmentQuery;

export const tenantFileObjectUrl = (attachment: TenantFileAttachment) =>
  privateFileObjectUrl(attachment);
