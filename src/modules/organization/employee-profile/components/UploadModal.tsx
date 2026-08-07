import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Modal from '../../../../components/common/Modal';
import Button from '../../../../components/common/Button';
import Select from '../../../../components/common/Select';
import type { DocumentCategory, TenantDocumentTypeOption } from '../types';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTypes: TenantDocumentTypeOption[];
  /** When no tenant types exist, user still picks a UI category (mapped on submit). */
  onSubmit: (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => Promise<void>;
}

const categories: { value: DocumentCategory; label: string }[] = [
  { value: 'PAN', label: 'PAN' },
  { value: 'AADHAAR', label: 'Aadhaar' },
  { value: 'OFFER_LETTER', label: 'Offer letter' },
  { value: 'APPRAISAL_LETTER', label: 'Appraisal letter' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'OTHER', label: 'Other' },
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = r.result;
      if (typeof res !== 'string') {
        reject(new Error('Could not read file'));
        return;
      }
      const comma = res.indexOf(',');
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    r.onerror = () => reject(r.error ?? new Error('read failed'));
    r.readAsDataURL(file);
  });
}

export function UploadModal({
  isOpen,
  onClose,
  documentTypes,
  onSubmit,
}: UploadModalProps) {
  const [category, setCategory] = useState<DocumentCategory>('PAN');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeOptions = useMemo(() => {
    if (documentTypes.length === 0) return [];
    const upper = (s: string) => s.toUpperCase();
    return documentTypes
      .filter((t) => {
        const c = upper(t.category ?? '');
        const n = upper(t.name ?? '');
        switch (category) {
          case 'PAN':
            return c.includes('PAN') || n.includes('PAN');
          case 'AADHAAR':
            return c.includes('AADHAAR') || c.includes('AADHAR') || n.includes('AADHAAR') || n.includes('AADHAR');
          case 'PASSPORT':
            return c.includes('PASSPORT') || n.includes('PASSPORT');
          case 'OFFER_LETTER':
            return c.includes('OFFER') || n.includes('OFFER');
          case 'APPRAISAL_LETTER':
            return c.includes('APPRAISAL') || n.includes('APPRAISAL');
          case 'OTHER':
            return true;
          default:
            return true;
        }
      })
      .map((t) => ({ value: t.id, label: `${t.name}${t.category ? ` (${t.category})` : ''}` }));
  }, [documentTypes, category]);

  const effectiveTypeId =
    documentTypeId ||
    (typeOptions[0]?.value ?? documentTypes[0]?.id ?? '');

  const resetAndClose = () => {
    setFile(null);
    setError(null);
    setBusy(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    const id = effectiveTypeId;
    if (!id) {
      setError('No document type is configured for this tenant. Add document types in admin settings.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const contentBase64 = await readFileAsBase64(file);
      await onSubmit({
        documentTypeId: id,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        contentBase64,
      });
      setFile(null);
      resetAndClose();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Upload document" size="md">
      <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
        <Select
          label="Category"
          name="category"
          value={category}
          fullWidth
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setCategory(e.target.value as DocumentCategory);
            setDocumentTypeId('');
          }}
          options={categories.map((c) => ({ value: c.value, label: c.label }))}
        />
        {documentTypes.length > 0 && typeOptions.length > 0 ? (
          <Select
            label="Document type"
            name="documentTypeId"
            value={documentTypeId || typeOptions[0]?.value || ''}
            fullWidth
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setDocumentTypeId(e.target.value)}
            options={typeOptions}
          />
        ) : null}
        {documentTypes.length === 0 ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            No document types returned for this tenant. Upload may fail until types are seeded.
          </p>
        ) : null}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            File
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-300 dark:file:bg-indigo-950/50 dark:file:text-indigo-200"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setError(null);
            }}
          />
        </div>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy || !file}>
            {busy ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
