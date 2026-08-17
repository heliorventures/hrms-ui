import { useEffect, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Upload } from 'lucide-react';

import type { DocumentRow, TenantDocumentTypeOption } from '../types';
import { DocumentTable } from '../components/DocumentTable';
import { UploadModal } from '../components/UploadModal';
import { EmptySection } from '../components/SectionStates';
import Modal from '../../../../components/common/Modal';
import Button from '../../../../components/common/Button';
import {
  ResolveEmployeeDocumentDocument,
  UploadEmployeeDocumentProfileDocument,
} from '../../../../api/graphql/graphql';
import {
  EmployeeDocumentAttachmentDocument,
  employeeDocumentObjectUrl,
  type EmployeeDocumentAttachmentResponse,
} from '../../employeeDocumentAttachment';

interface DocumentsTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: DocumentRow[];
  documentTypes: TenantDocumentTypeOption[];
  isHr: boolean;
}

function mapCategoryFromName(name?: string | null): DocumentRow['category'] {
  const blob = (name ?? '').toUpperCase();
  if (blob.includes('PAN')) return 'PAN';
  if (blob.includes('AADHAAR') || blob.includes('AADHAR')) return 'AADHAAR';
  if (blob.includes('PASSPORT')) return 'PASSPORT';
  if (blob.includes('OFFER')) return 'OFFER_LETTER';
  if (blob.includes('APPRAISAL')) return 'APPRAISAL_LETTER';
  return 'OTHER';
}

function mapRowFromServer(
  d: {
    id: string;
    status: string;
    originalFileName?: string | null;
    documentTypeName?: string | null;
    uploadedAt: unknown;
  },
  uploadedBy: DocumentRow['uploadedBy'],
  mimeType: string
): DocumentRow {
  const st = d.status.toUpperCase();
  return {
    id: d.id,
    name: d.originalFileName ?? d.documentTypeName ?? 'Document',
    category: mapCategoryFromName(d.documentTypeName),
    uploadedBy,
    uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : String(d.uploadedAt),
    status: st === 'APPROVED' ? 'APPROVED' : st === 'REJECTED' ? 'REJECTED' : 'PENDING',
    mimeType,
  };
}

export function DocumentsTab({
  employeeId,
  client,
  initial,
  documentTypes,
  isHr,
}: DocumentsTabProps) {
  const [rows, setRows] = useState<DocumentRow[]>(initial);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<DocumentRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadDoc = async (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => {
    const res = await client.request(UploadEmployeeDocumentProfileDocument, {
      input: {
        employeeId,
        documentTypeId: payload.documentTypeId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        contentBase64: payload.contentBase64,
      },
    });
    const d = res.uploadEmployeeDocument;
    const uploadedBy: DocumentRow['uploadedBy'] = isHr ? 'HR' : 'EMPLOYEE';
    setRows((r) => [mapRowFromServer(d, uploadedBy, payload.mimeType), ...r]);
  };

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      const res = await client.request(ResolveEmployeeDocumentDocument, {
        employeeDocumentId: id,
        approved: true,
      });
      const st = res.resolveEmployeeDocument.status.toUpperCase();
      setRows((r) =>
        r.map((x) => (x.id === id ? { ...x, status: st === 'APPROVED' ? 'APPROVED' : 'PENDING' } : x))
      );
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    setBusyId(id);
    try {
      const res = await client.request(ResolveEmployeeDocumentDocument, {
        employeeDocumentId: id,
        approved: false,
      });
      const st = res.resolveEmployeeDocument.status.toUpperCase();
      setRows((r) =>
        r.map((x) => (x.id === id ? { ...x, status: st === 'REJECTED' ? 'REJECTED' : 'PENDING' } : x))
      );
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = async (row: DocumentRow) => {
    setPreview(row);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const result = await client.request<EmployeeDocumentAttachmentResponse>(
        EmployeeDocumentAttachmentDocument,
        { employeeDocumentId: row.id }
      );
      setPreviewUrl(employeeDocumentObjectUrl(result.employeeDocumentAttachment));
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Unable to open this document.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreview(null);
    setPreviewUrl(null);
    setPreviewError(null);
  };

  if (rows.length === 0) {
    return (
      <>
        <EmptySection
          title="No Documents Yet"
          description="Upload PAN, Aadhaar, offer letters, or appraisal letters. Employee uploads require HR approval."
          actionLabel="Upload document"
          onAction={() => setUploadOpen(true)}
        />
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          documentTypes={documentTypes}
          onSubmit={uploadDoc}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-4 w-4" aria-hidden />
          Upload
        </Button>
      </div>

      <DocumentTable
        rows={rows}
        isHr={isHr}
        onPreview={(row) => void openPreview(row)}
        onApprove={busyId ? undefined : (idx) => void approve(idx)}
        onReject={busyId ? undefined : (idx) => void reject(idx)}
      />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        documentTypes={documentTypes}
        onSubmit={uploadDoc}
      />

      <Modal
        isOpen={preview != null}
        onClose={closePreview}
        title={preview?.name ?? 'Preview'}
        size="lg"
      >
        {preview ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              {preview.mimeType} · Uploaded {new Date(preview.uploadedAt).toLocaleString('en-IN')}
            </p>
            <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
              {previewLoading ? <p className="text-sm text-slate-500">Creating secure preview...</p> : null}
              {previewError ? <p role="alert" className="px-4 text-center text-sm text-red-600">{previewError}</p> : null}
              {previewUrl && preview.mimeType.startsWith('image/') ? (
                <img src={previewUrl} alt={preview.name} className="max-h-[65vh] max-w-full object-contain" />
              ) : null}
              {previewUrl && preview.mimeType === 'application/pdf' ? (
                <iframe src={previewUrl} title={preview.name} className="h-[65vh] w-full" />
              ) : null}
              {previewUrl && preview.mimeType !== 'application/pdf' && !preview.mimeType.startsWith('image/') ? (
                <p className="px-4 text-center text-sm text-slate-500">Preview is unavailable for this file type. Use Download.</p>
              ) : null}
            </div>
            {previewUrl ? (
              <a href={previewUrl} download={preview.name} target="_blank" rel="noreferrer" className="block">
                <Button type="button" variant="secondary" fullWidth>Download</Button>
              </a>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
