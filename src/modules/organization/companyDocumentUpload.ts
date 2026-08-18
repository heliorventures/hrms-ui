import type { GraphQLClient } from 'graphql-request';
import { UploadCompanyDocumentFileDocument } from '../../api/graphql/graphql';
import { fileToBase64 } from '../../utils/fileEncoding';

export interface CreateCompanyDocumentValues {
  category: string;
  title: string;
  description: string | null;
  stagedUploadId: string;
  visibleToEmployees: boolean;
}

export const buildCreateCompanyDocumentInput = (values: CreateCompanyDocumentValues) => ({
  category: values.category,
  title: values.title,
  description: values.description,
  stagedUploadId: values.stagedUploadId,
  visibleToEmployees: values.visibleToEmployees,
});

export async function stageCompanyDocumentFile(client: GraphQLClient, file: File): Promise<string> {
  const encoded = await fileToBase64(file);
  const result = await client.request(UploadCompanyDocumentFileDocument, {
    input: {
      fileName: encoded.name,
      mimeType: encoded.mime,
      contentBase64: encoded.b64,
    },
  });
  return result.uploadCompanyDocumentFile.id;
}
