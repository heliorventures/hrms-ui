import { useEffect, useState } from 'react';

import { CompanyDocumentAttachmentDocument } from '../../api/graphql/graphql';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { privateFileObjectUrl } from '../../utils/privateFileAttachment';

interface Props {
  documentId: string;
  title: string;
  onClose: () => void;
}

const CompanyDocumentPreview = ({ documentId, title, onClose }: Props) => {
  const client = useGraphClient('client');
  const [file, setFile] = useState<{ url: string; name: string; mime: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    setFile(null);
    setError(null);
    void client
      .request(CompanyDocumentAttachmentDocument, { companyDocumentId: documentId })
      .then(({ companyDocumentAttachment: attachment }) => {
        if (!active) return;
        objectUrl = privateFileObjectUrl(attachment);
        setFile({
          url: objectUrl,
          name: attachment.fileName,
          mime: attachment.mimeType.toLowerCase(),
        });
      })
      .catch((reason: unknown) => {
        if (active) setError(graphQlUserMessage(reason));
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, documentId]);

  return (
    <Modal isOpen onClose={onClose} title={title} size="xl">
      {error ? (
        <p role="alert" className="text-sm text-content-secondary">
          {error}
        </p>
      ) : null}
      {!file && !error ? <p role="status">Loading document…</p> : null}
      {file ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="break-all text-content-secondary">{file.name}</span>
            <a
              href={file.url}
              download={file.name}
              className="rounded text-accent underline focus-visible:ring-2 focus-visible:ring-focus"
            >
              Download
            </a>
          </div>
          {file.mime === 'application/pdf' ? (
            <iframe
              src={file.url}
              title={title}
              className="h-[65vh] w-full rounded-lg border border-line"
            />
          ) : null}
          {['image/png', 'image/jpeg'].includes(file.mime) ? (
            <img
              src={file.url}
              alt={title}
              className="mx-auto max-h-[65vh] max-w-full object-contain"
            />
          ) : null}
          {!['application/pdf', 'image/png', 'image/jpeg'].includes(file.mime) ? (
            <p className="text-sm text-content-secondary">
              Preview is unavailable for this file type. Use Download to open it.
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};

export default CompanyDocumentPreview;
