import { Expand } from 'lucide-react';
import { useState } from 'react';

import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

import { type CompanyDocumentFile, useCompanyDocumentFile } from './useCompanyDocumentFile';

interface Props {
  documentId: string;
  title: string;
  onClose: () => void;
  presentation?: 'inline' | 'dialog';
}

interface ContentProps {
  file: CompanyDocumentFile;
  title: string;
  onRetry: () => void;
}

const DocumentContent = ({ file, title, onRetry }: ContentProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const download = (
    <a href={file.url} download={file.name} className="text-accent underline">
      Download document
    </a>
  );
  if (file.mime === 'application/pdf') {
    return (
      <object
        data={file.url}
        type="application/pdf"
        aria-label={title}
        title={title}
        className="h-[65dvh] min-h-80 w-full rounded-lg bg-white"
      >
        <div className="p-6 text-sm text-slate-700">
          <p>This browser cannot display the PDF here. You can download it to read it.</p>
          {download}
        </div>
      </object>
    );
  }
  if (['image/png', 'image/jpeg'].includes(file.mime)) {
    if (imageFailed)
      return (
        <div role="alert" className="space-y-3 p-6 text-sm text-content-secondary">
          <p>This image could not be displayed.</p>
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
          {download}
        </div>
      );
    return (
      <img
        src={file.url}
        alt={title}
        onError={() => setImageFailed(true)}
        className="mx-auto max-h-[65dvh] max-w-full rounded-lg object-contain"
      />
    );
  }
  return (
    <p className="p-6 text-sm text-content-secondary">
      Preview is unavailable for this file type. {download}
    </p>
  );
};

const CompanyDocumentReader = ({ documentId, title, onClose, presentation = 'inline' }: Props) => {
  const { file, error, retry } = useCompanyDocumentFile(documentId);
  const [expanded, setExpanded] = useState(false);
  const dialog = presentation === 'dialog' || expanded;
  const body = (
    <div className="space-y-4">
      {error ? (
        <div role="alert" className="space-y-3 rounded-lg border border-line p-4 text-sm">
          <p className="font-semibold">We couldn’t open this document</p>
          <p>{error}</p>
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Back to documents
          </Button>
        </div>
      ) : null}
      {!file && !error ? (
        <p role="status" className="min-h-80 p-6 text-sm text-content-secondary">
          Opening {title}…
        </p>
      ) : null}
      {file ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="min-w-0 break-all text-content-secondary">{file.name}</span>
            <a
              href={file.url}
              download={file.name}
              className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 font-medium text-accent focus-visible:ring-2 focus-visible:ring-focus"
            >
              Download
            </a>
          </div>
          <DocumentContent key={file.url} file={file} title={title} onRetry={retry} />
        </>
      ) : null}
    </div>
  );
  return (
    <>
      {presentation === 'inline' ? (
        <section
          aria-label={`Reading ${title}`}
          className="min-w-0 rounded-xl border border-line bg-surface p-4"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-semibold">{title}</h2>
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              <Expand className="mr-2 size-4" aria-hidden="true" />
              Expand
            </Button>
          </div>
          {dialog ? null : body}
        </section>
      ) : null}
      <Modal
        isOpen={dialog}
        title={title}
        size="xl"
        mobilePresentation="full-height"
        onClose={() => (presentation === 'dialog' ? onClose() : setExpanded(false))}
      >
        {dialog ? body : null}
      </Modal>
    </>
  );
};

export default CompanyDocumentReader;
