import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import { PERMISSIONS } from '../../auth/permissions';
import { useAuth } from '../../contexts/AuthContext';
import { useDialogs } from '../../contexts/DialogContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { deferObjectUrlRevocation, privateFileObjectUrl } from '../../utils/privateFileAttachment';
import { validateTenantUploadFile } from '../../utils/tenantFileUpload';
import {
  buildCreateCompanyDocumentInput,
  stageCompanyDocumentFile,
} from './companyDocumentUpload';
import {
  CompanyDocumentAttachmentDocument,
  CreateCompanyDocumentDocument,
  DeleteCompanyDocumentDocument,
  OrgDocumentsListDocument,
  type OrgDocumentsListQuery,
} from '../../api/graphql/graphql';

const COMPANY_DOCUMENT_CATEGORIES = [
  { value: 'COMPANY_POLICY', label: 'Company Policy' },
  { value: 'ONBOARDING', label: 'Onboarding' },
  { value: 'EXIT_FORMALITY', label: 'Exit Formality' },
] as const;

type CompanyDocumentRow = OrgDocumentsListQuery['companyDocuments'][number];
type DocumentTypeRow = OrgDocumentsListQuery['documentTypes'][number];
type EmployeeDocumentRow = OrgDocumentsListQuery['employeeDocuments'][number];

interface UploadFormState {
  category: string;
  title: string;
  description: string;
  visibleToEmployees: boolean;
  file: File | null;
}

const initialForm: UploadFormState = {
  category: 'COMPANY_POLICY',
  title: '',
  description: '',
  visibleToEmployees: true,
  file: null,
};

function categoryLabel(category: string): string {
  return COMPANY_DOCUMENT_CATEGORIES.find((option) => option.value === category)?.label ?? category;
}

function fileSizeLabel(size?: number | null): string {
  if (!size || size <= 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const OrganizationDocumentsPage = () => {
  const client = useGraphClient('client');
  const { canAny } = useAuth();
  const { confirm } = useDialogs();
  const canManageCompanyDocuments = canAny([
    PERMISSIONS.employeeWrite,
    PERMISSIONS.onboardingManage,
    PERMISSIONS.roleManage,
  ]);

  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocumentRow[]>([]);
  const [types, setTypes] = useState<DocumentTypeRow[]>([]);
  const [employeeDocs, setEmployeeDocs] = useState<EmployeeDocumentRow[]>([]);
  const [form, setForm] = useState<UploadFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const typeName = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t.name])), [types]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await client.request(OrgDocumentsListDocument, {
      tlim: 50,
      dlim: 50,
    });
    setCompanyDocuments(response.companyDocuments);
    setTypes(response.documentTypes);
    setEmployeeDocs(response.employeeDocuments);
    setLoading(false);
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadDocuments();
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDocuments]);

  const submitCompanyDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageCompanyDocuments) return;
    setError(null);
    setSuccess(null);
    const title = form.title.trim();
    if (!title) {
      setError('Document title is required.');
      return;
    }
    if (!form.file) {
      setError('Select a document file to upload.');
      return;
    }
    const validation = validateTenantUploadFile(form.file, 'Company document');
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setBusy(true);
      const stagedUploadId = await stageCompanyDocumentFile(client, form.file);
      await client.request(CreateCompanyDocumentDocument, {
        input: buildCreateCompanyDocumentInput({
          category: form.category,
          title,
          description: form.description.trim() || null,
          stagedUploadId,
          visibleToEmployees: form.visibleToEmployees,
        }),
      });
      setForm(initialForm);
      await loadDocuments();
      setSuccess('Company document uploaded successfully.');
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadCompanyDocument = async (document: CompanyDocumentRow) => {
    try {
      setError(null);
      const result = await client.request(CompanyDocumentAttachmentDocument, {
        companyDocumentId: document.id,
      });
      const url = privateFileObjectUrl(result.companyDocumentAttachment);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download =
        result.companyDocumentAttachment.fileName || document.originalFileName || document.title;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      deferObjectUrlRevocation(url);
    } catch (e) {
      setError(graphQlUserMessage(e));
    }
  };

  const deleteCompanyDocument = async (document: CompanyDocumentRow) => {
    if (!canManageCompanyDocuments) return;
    const confirmed = await confirm({
      title: 'Delete company document',
      message: `Delete "${document.title}" from the company library? Employees will no longer be able to open this document.`,
      confirmLabel: 'Delete document',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      await client.request(DeleteCompanyDocumentDocument, { companyDocumentId: document.id });
      await loadDocuments();
      setSuccess('Company document removed.');
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Documents</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Company policies, onboarding material, exit-formality files, and your employee documents.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
        </Card>
      )}
      {success && (
        <Card>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
        </Card>
      )}

      {canManageCompanyDocuments && (
        <Card title="Add Company Document">
          <form className="space-y-4" onSubmit={(event) => void submitCompanyDocument(event)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                fullWidth
                label="Document Category"
                options={COMPANY_DOCUMENT_CATEGORIES.map((option) => ({ ...option }))}
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              />
              <Input
                fullWidth
                label="Title"
                maxLength={255}
                placeholder="Employee handbook, onboarding checklist, exit policy..."
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Optional description shown to employees"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <Input
                fullWidth
                label="Document File"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))
                }
              />
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
                <input
                  checked={form.visibleToEmployees}
                  type="checkbox"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      visibleToEmployees: event.target.checked,
                    }))
                  }
                />
                Visible to employees
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Company Document Library">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : companyDocuments.length ? (
          <Table
            data={companyDocuments}
            keyExtractor={(document) => document.id}
            columns={[
              {
                key: 'title',
                label: 'Document',
                render: (document: CompanyDocumentRow) => (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{document.title}</p>
                    {document.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {document.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {document.originalFileName ?? 'Document'} · {fileSizeLabel(document.fileSizeBytes)}
                    </p>
                  </div>
                ),
              },
              {
                key: 'category',
                label: 'Category',
                render: (document: CompanyDocumentRow) => categoryLabel(document.category),
              },
              {
                key: 'status',
                label: 'Status',
                render: (document: CompanyDocumentRow) => (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={document.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {document.status}
                    </Badge>
                    {!document.visibleToEmployees && <Badge variant="info">Hidden</Badge>}
                  </div>
                ),
              },
              {
                key: 'updatedAt',
                label: 'Updated',
                render: (document: CompanyDocumentRow) =>
                  new Date(document.updatedAt).toLocaleString('en-IN'),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (document: CompanyDocumentRow) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void downloadCompanyDocument(document)}
                    >
                      Download
                    </Button>
                    {canManageCompanyDocuments && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => void deleteCompanyDocument(document)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No company documents have been published yet.
          </p>
        )}
      </Card>

      <Card title="Document Types">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : types.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {types.map((type) => (
              <div
                key={type.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                  {type.isRequired && <Badge variant="warning">Required</Badge>}
                </div>
                {type.category && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{type.category}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No document types configured.</p>
        )}
      </Card>

      <Card title="Your Documents">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : employeeDocs.length ? (
          <Table
            data={employeeDocs}
            keyExtractor={(document) => document.id}
            columns={[
              {
                key: 'name',
                label: 'Type',
                render: (document: EmployeeDocumentRow) =>
                  typeName[document.documentTypeId] ?? document.documentTypeId,
              },
              {
                key: 'status',
                label: 'Status',
                render: (document: EmployeeDocumentRow) => <Badge variant="info">{document.status}</Badge>,
              },
              {
                key: 'uploadedAt',
                label: 'Uploaded',
                render: (document: EmployeeDocumentRow) =>
                  new Date(document.uploadedAt).toLocaleString('en-IN'),
              },
              {
                key: 'expiryDate',
                label: 'Expires',
                render: (document: EmployeeDocumentRow) =>
                  document.expiryDate ? new Date(document.expiryDate).toLocaleDateString('en-IN') : '—',
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        )}
      </Card>
    </div>
  );
};

export default OrganizationDocumentsPage;
