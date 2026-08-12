import { useMemo, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Upload } from 'lucide-react';

import type { EmployeeProfileModel, IdentityRecord, TenantDocumentTypeOption } from '../types';
import { InfoCard } from '../components/InfoCard';
import { VerificationBadge } from '../components/StatusBadge';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import { UploadModal } from '../components/UploadModal';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';
import {
  SubmitEmployeeProfileChangeDocument,
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
  isHr,
  onChanged,
}: IdentityTabProps) {
  const [panInput, setPanInput] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [panSaving, setPanSaving] = useState(false);
  const [aadhaarSaving, setAadhaarSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadKind, setUploadKind] = useState<IdentityRecord['kind'] | null>(null);
  const [supportingDocuments, setSupportingDocuments] = useState<
    Partial<Record<IdentityRecord['kind'], string>>
  >({});

  const uploadTypes = useMemo(() => {
    if (!uploadKind) return [];
    const aliases = uploadKind === 'AADHAAR' ? ['AADHAAR', 'AADHAR'] : [uploadKind];
    return documentTypes.filter((type) => {
      const text = `${type.systemKey ?? ''} ${type.category ?? ''} ${type.name}`.toUpperCase();
      return aliases.some((alias) => text.includes(alias));
    });
  }, [documentTypes, uploadKind]);

  const identityByKind = useMemo(() => {
    const m = new Map<IdentityRecord['kind'], IdentityRecord>();
    for (const row of model.identities) m.set(row.kind, row);
    return m;
  }, [model.identities]);

  const savePan = async () => {
    setPanSaving(true);
    setError(null);
    try {
      if (isHr) {
        await client.request(UpsertEmployeePrimaryPanDocument, {
          input: { employeeId, panNumber: panInput.trim() },
        });
      } else {
        await client.request(SubmitEmployeeProfileChangeDocument, {
          input: {
            employeeId,
            requestType: 'PAN',
            panNumber: panInput.trim(),
            supportingDocumentId: supportingDocuments.PAN,
          },
        });
      }
      setPanInput('');
      if (isHr) onChanged?.();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setPanSaving(false);
    }
  };

  const saveAadhaar = async () => {
    setAadhaarSaving(true);
    setError(null);
    try {
      if (isHr) {
        await client.request(UpsertEmployeePrimaryAadhaarDocument, {
          input: { employeeId, aadhaarNumber: aadhaarInput.trim() },
        });
      } else {
        await client.request(SubmitEmployeeProfileChangeDocument, {
          input: {
            employeeId,
            requestType: 'AADHAAR',
            aadhaarNumber: aadhaarInput.trim(),
            supportingDocumentId: supportingDocuments.AADHAAR,
          },
        });
      }
      setAadhaarInput('');
      if (isHr) onChanged?.();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setAadhaarSaving(false);
    }
  };

  const uploadIdentityDocument = async (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => {
    const result = await client.request(UploadEmployeeDocumentProfileDocument, {
      input: {
        employeeId,
        documentTypeId: payload.documentTypeId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        contentBase64: payload.contentBase64,
      },
    });
    if (uploadKind) {
      setSupportingDocuments((current) => ({
        ...current,
        [uploadKind]: result.uploadEmployeeDocument.id,
      }));
    }
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPanInput(e.target.value.toUpperCase())
            }
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
            {panSaving ? 'Saving...' : isHr ? 'Save PAN' : 'Submit PAN for review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 ml-2 gap-1"
            onClick={() => setUploadKind('PAN')}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden /> Upload PAN card
          </Button>
          {supportingDocuments.PAN ? (
            <p className="mt-1 text-xs text-emerald-600">PAN document attached.</p>
          ) : null}
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
          <p className="mt-2 text-xs text-slate-500">
            Enter full 12-digit number or last 4 digits.
          </p>
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
            {aadhaarSaving ? 'Saving...' : isHr ? 'Save Aadhaar' : 'Submit Aadhaar for review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 ml-2 gap-1"
            onClick={() => setUploadKind('AADHAAR')}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden /> Upload Aadhaar card
          </Button>
          {supportingDocuments.AADHAAR ? (
            <p className="mt-1 text-xs text-emerald-600">Aadhaar document attached.</p>
          ) : null}
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
            disabled={documentTypes.length === 0}
            onClick={() => setUploadKind('PASSPORT')}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Upload passport scan
          </Button>
          {uploadKind === 'PASSPORT' && uploadTypes.length === 0 && documentTypes.length > 0 ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              No passport document type in directory — add one under admin document types.
            </p>
          ) : null}
        </InfoCard>
      </div>

      <UploadModal
        isOpen={uploadKind !== null}
        onClose={() => setUploadKind(null)}
        title={`Upload ${uploadKind === 'AADHAAR' ? 'Aadhaar card' : uploadKind === 'PAN' ? 'PAN card' : 'passport scan'}`}
        hideCategory
        documentTypes={uploadTypes.length > 0 ? uploadTypes : documentTypes}
        onSubmit={uploadIdentityDocument}
      />
    </div>
  );
}
