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

interface DocumentsTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: DocumentRow[];
  documentTypes: TenantDocumentTypeOption[];
  isHr: boolean;
  onChanged?: () => void;
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
  onChanged,
}: DocumentsTabProps) {
  const [rows, setRows] = useState<DocumentRow[]>(initial);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<DocumentRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

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
    onChanged?.();
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
      onChanged?.();
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
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <>
        <EmptySection
          title="No documents yet"
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
        onPreview={setPreview}
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
        onClose={() => setPreview(null)}
        title={preview?.name ?? 'Preview'}
        size="lg"
      >
        {preview ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              {preview.mimeType} · Uploaded {new Date(preview.uploadedAt).toLocaleString('en-IN')}
            </p>
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="max-w-sm px-4 text-center text-sm text-slate-500">
                Preview uses secure storage in production. This placeholder represents PDF/image
                rendering for{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">{preview.name}</span>.
              </p>
            </div>
            <Button type="button" variant="secondary" fullWidth disabled>
              Download (wire to signed URL)
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
