import type { GraphQLClient } from 'graphql-request';
import { fileToBase64 } from './fileEncoding';

const MAX_TENANT_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_TENANT_UPLOAD_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const UploadTenantFileDocument = `
  mutation UploadTenantFile($input: UploadTenantFileInput!) {
    uploadTenantFile(input: $input) {
      id
      originalFileName
      mimeType
      fileSizeBytes
      createdAt
    }
  }
`;

export function validateTenantUploadFile(file: File, label = 'File'): string | null {
  if (file.size <= 0) return `${label} must not be empty.`;
  if (file.size > MAX_TENANT_UPLOAD_BYTES) return `${label} must be 6 MB or smaller.`;
  if (!ALLOWED_TENANT_UPLOAD_TYPES.has(file.type)) {
    return `${label} must be a PDF, JPG, or PNG file.`;
  }
  return null;
}

export async function uploadTenantFile(client: GraphQLClient, file: File): Promise<string> {
  const encoded = await fileToBase64(file);
  const result = await client.request<{ uploadTenantFile: { id: string } }>(
    UploadTenantFileDocument,
    {
      input: {
        fileName: encoded.name,
        mimeType: encoded.mime,
        contentBase64: encoded.b64,
      },
    }
  );
  return result.uploadTenantFile.id;
}
