import type { PrejoiningActionContext } from './prejoiningActionContext';
import { PrejoiningDocumentAdminDocument } from './prejoiningAdminDocuments';
import { downloadBase64 } from './prejoiningAdminHelpers';

export function usePrejoiningDocumentActions(context: PrejoiningActionContext) {
  const { client, ownerRef, ownerToken, runAction } = context;
  const { selected } = context.state;
  const downloadDocument = (documentId: string) => {
    if (!selected) return;
    void runAction(`download-${documentId}`, async () => {
      const result = await client.request<{
        prejoiningDocument: { filename: string; mimeType: string; base64Content: string };
      }>(PrejoiningDocumentAdminDocument, { candidateId: selected.id, documentId });
      if (ownerRef.current !== ownerToken) return;
      downloadBase64(
        result.prejoiningDocument.filename,
        result.prejoiningDocument.mimeType,
        result.prejoiningDocument.base64Content
      );
    });
  };

  return { downloadDocument };
}
