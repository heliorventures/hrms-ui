import { useEffect, useState } from 'react';

import { CompanyDocumentAttachmentDocument } from '../../api/graphql/graphql';
import { useFeedbackState } from '../../hooks/useFeedbackState';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { privateFileObjectUrl } from '../../utils/privateFileAttachment';

export interface CompanyDocumentFile {
  url: string;
  name: string;
  mime: string;
}

export function useCompanyDocumentFile(documentId: string) {
  const client = useGraphClient('client');
  const [file, setFile] = useState<CompanyDocumentFile | null>(null);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let url: string | undefined;
    setFile(null);
    setError(null);
    void client
      .request(CompanyDocumentAttachmentDocument, { companyDocumentId: documentId })
      .then(({ companyDocumentAttachment: attachment }) => {
        if (!active) return;
        url = privateFileObjectUrl(attachment);
        setFile({
          url,
          name: attachment.fileName,
          mime: attachment.mimeType.toLowerCase().split(';')[0].trim(),
        });
      })
      .catch((reason: unknown) => {
        if (active) setError(graphQlUserMessage(reason));
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [client, documentId, attempt, setError]);
  return { file, error, retry: () => setAttempt((value) => value + 1) };
}
