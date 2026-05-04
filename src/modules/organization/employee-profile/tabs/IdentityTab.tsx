import { useMemo, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Upload } from 'lucide-react';

import type { EmployeeProfileModel, IdentityRecord, TenantDocumentTypeOption } from '../types';
import { InfoCard } from '../components/InfoCard';
import { VerificationBadge } from '../components/StatusBadge';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import { UploadModal } from '../components/UploadModal';
import {
  UploadEmployeeDocumentProfileDocument,
  UpsertEmployeePrimaryAadhaarDocument,
  UpsertEmployeePrimaryPanDocument,
} from '../../../../api/graphql/graphql';

interface IdentityTabProps {
  employeeId: string;
  client: GraphQLClient;
  model: EmployeeProfileModel;
  documentTypes: TenantDocumentTypeOption[];
  isHr: boolean;
  onChanged?: () => void;
}

const labels: Record<IdentityRecord['kind'], string> = {
  PAN: 'PAN',
  AADHAAR: 'Aadhaar',
  PASSPORT: 'Passport',
};

export function IdentityTab({
  employeeId,
  client,
  model,
  documentTypes,
  isHr: _isHr,
  onChanged,
}: IdentityTabProps) {
  const [panInput, setPanInput] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [panSaving, setPanSaving] = useState(false);
  const [aadhaarSaving, setAadhaarSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);

  const passportTypes = useMemo(
    () =>
      documentTypes.filter((t) => {
        const c = (t.category ?? '').toUpperCase();
        const n = (t.name ?? '').toUpperCase();
        return c.includes('PASSPORT') || n.includes('PASSPORT');
      }),
    [documentTypes]
  );

  const identityByKind = useMemo(() => {
    const m = new Map<IdentityRecord['kind'], IdentityRecord>();
    for (const row of model.identities) m.set(row.kind, row);
    return m;
  }, [model.identities]);

  const savePan = async () => {
    setPanSaving(true);
    setError(null);
    try {
      await client.request(UpsertEmployeePrimaryPanDocument, {
        input: { employeeId, panNumber: panInput.trim() },
      });
      setPanInput('');
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save PAN');
    } finally {
      setPanSaving(false);
    }
  };

  const saveAadhaar = async () => {
    setAadhaarSaving(true);
    setError(null);
    try {
      await client.request(UpsertEmployeePrimaryAadhaarDocument, {
        input: { employeeId, aadhaarNumber: aadhaarInput.trim() },
      });
      setAadhaarInput('');
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save Aadhaar');
    } finally {
      setAadhaarSaving(false);
    }
  };

  const uploadPassport = async (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => {
    await client.request(UploadEmployeeDocumentProfileDocument, {
      input: {
        employeeId,
        documentTypeId: payload.documentTypeId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        contentBase64: payload.contentBase64,
      },
    });
    onChanged?.();
  };

  const pan = identityByKind.get('PAN');
  const aadhaar = identityByKind.get('AADHAAR');
  const passport = identityByKind.get('PASSPORT');

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          key="PAN"
          title={labels.PAN}
          subtitle="10-character tax ID"
          action={<VerificationBadge status={pan?.verificationStatus ?? 'UNVERIFIED'} />}
        >
          <p className="font-mono text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-100">
            {pan?.maskedValue ?? '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Updating resets verification until HR confirms again.
          </p>
          <Input
            label="New PAN"
            value={panInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPanInput(e.target.value.toUpperCase())}
            fullWidth
            className="mt-2"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={panSaving || panInput.trim().length !== 10}
            onClick={() => void savePan()}
          >
            {panSaving ? 'Saving…' : 'Save PAN'}
          </Button>
        </InfoCard>

        <InfoCard
          key="AADHAAR"
          title={labels.AADHAAR}
          subtitle="Last 4 digits stored"
          action={<VerificationBadge status={aadhaar?.verificationStatus ?? 'UNVERIFIED'} />}
        >
          <p className="font-mono text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-100">
            {aadhaar?.maskedValue ?? '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">Enter full 12-digit number or last 4 digits.</p>
          <Input
            label="New Aadhaar"
            value={aadhaarInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAadhaarInput(e.target.value)}
            fullWidth
            className="mt-2"
            placeholder="12 digits or last 4"
            inputMode="numeric"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={aadhaarSaving || aadhaarInput.trim().length < 4}
            onClick={() => void saveAadhaar()}
          >
            {aadhaarSaving ? 'Saving…' : 'Save Aadhaar'}
          </Button>
        </InfoCard>

        <InfoCard
          key="PASSPORT"
          title={labels.PASSPORT}
          subtitle="Document upload"
          action={<VerificationBadge status={passport?.verificationStatus ?? 'UNVERIFIED'} />}
        >
          <p className="font-mono text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-100">
            {passport?.maskedValue ?? '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Passport is stored as a document; there is no separate passport number field yet.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 gap-1"
            disabled={passportTypes.length === 0 && documentTypes.length === 0}
            onClick={() => setPassportOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Upload passport scan
          </Button>
          {passportTypes.length === 0 && documentTypes.length > 0 ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              No passport document type in directory — add one under admin document types.
            </p>
          ) : null}
        </InfoCard>
      </div>

      <UploadModal
        isOpen={passportOpen}
        onClose={() => setPassportOpen(false)}
        documentTypes={passportTypes.length > 0 ? passportTypes : documentTypes}
        onSubmit={uploadPassport}
      />
    </div>
  );
}
