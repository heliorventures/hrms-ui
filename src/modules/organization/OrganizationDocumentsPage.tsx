import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  CompanyDocumentAttachmentDocument,
  CreateCompanyDocumentDocument,
  DeleteCompanyDocumentDocument,
  OrgDocumentsListDocument,
  type OrgDocumentsListQuery,
} from '../../api/graphql/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import { authorizationStateKey } from '../../auth/permissionService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import { useDialogs } from '../../contexts/DialogContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { usePageTabs } from '../../hooks/usePageTabs';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { deferObjectUrlRevocation, privateFileObjectUrl } from '../../utils/privateFileAttachment';
import { validateTenantUploadFile } from '../../utils/tenantFileUpload';

import CompanyDocumentLibrary from './CompanyDocumentLibrary';
import { COMPANY_DOCUMENT_CATEGORIES, type CompanyDocumentRow } from './companyDocumentTypes';
import { buildCreateCompanyDocumentInput, stageCompanyDocumentFile } from './companyDocumentUpload';

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
  category: '',
  title: '',
  description: '',
  visibleToEmployees: true,
  file: null,
};

const DocumentsContent = () => {
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
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const requestSequence = useRef(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const typeName = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t.name])), [types]);

  const loadDocuments = useCallback(async () => {
    if (!mounted.current) return;
    const sequence = ++requestSequence.current;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await client.request(OrgDocumentsListDocument, { tlim: 50, dlim: 50 });
      if (!mounted.current || sequence !== requestSequence.current) return;
      setCompanyDocuments(response.companyDocuments);
      setTypes(response.documentTypes);
      setEmployeeDocs(response.employeeDocuments);
    } catch (reason) {
      if (mounted.current && sequence === requestSequence.current)
        setLoadError(graphQlUserMessage(reason));
      throw reason;
    } finally {
      if (mounted.current && sequence === requestSequence.current) setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadDocuments().catch(() => undefined);
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
    if (!COMPANY_DOCUMENT_CATEGORIES.some((category) => category.value === form.category)) {
      setError('Select a document category.');
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
      if (!mounted.current) return;
      await client.request(CreateCompanyDocumentDocument, {
        input: buildCreateCompanyDocumentInput({
          category: form.category,
          title,
          description: form.description.trim() || null,
          stagedUploadId,
          visibleToEmployees: form.visibleToEmployees,
        }),
      });
      if (!mounted.current) return;
      setForm(initialForm);
      if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
      setSuccess('Company document uploaded successfully.');
      setUploadOpen(false);
      await loadDocuments().catch(() => undefined);
    } catch (e) {
      if (mounted.current) setError(graphQlUserMessage(e));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const downloadCompanyDocument = async (document: CompanyDocumentRow) => {
    try {
      setError(null);
      const result = await client.request(CompanyDocumentAttachmentDocument, {
        companyDocumentId: document.id,
      });
      if (!mounted.current) return;
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
      if (mounted.current) setError(graphQlUserMessage(e));
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
    if (!confirmed || !mounted.current) return;
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      await client.request(DeleteCompanyDocumentDocument, { companyDocumentId: document.id });
      if (!mounted.current) return;
      setSuccess('Company document removed.');
      await loadDocuments().catch(() => undefined);
    } catch (e) {
      if (mounted.current) setError(graphQlUserMessage(e));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Documents' },
    { id: 'personal', label: 'My Documents' },
    { id: 'types', label: 'Document Requirements' },
  ];
  const { tab, setTab } = usePageTabs(tabs);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div data-tour-anchor="organization-documents-tabs">
        <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>
      <div>
        <PageHeader
          title="Documents"
          description="Find policies and employee resources. Read them here."
        />
      </div>

      {loadError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-status-danger">
          <p>{loadError}</p>
          {tab !== 'company' ? (
            <Button variant="outline" onClick={() => void loadDocuments().catch(() => undefined)}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}
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

      <PageTabPanel id="company" activeTab={tab}>
        {canManageCompanyDocuments ? (
          <div className="flex justify-end">
            <Button
              disabled={busy}
              onClick={() => setUploadOpen((open) => !open)}
              data-tour-anchor="organization-company-document-upload"
            >
              {uploadOpen ? 'Back to document library' : 'Add Company Document'}
            </Button>
          </div>
        ) : null}
        {canManageCompanyDocuments && (
          <div hidden={!uploadOpen}>
            <Card title="Add Company Document">
              <form className="space-y-4" onSubmit={(event) => void submitCompanyDocument(event)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    fullWidth
                    label="Document Category"
                    description="Choose where employees will find this document in the library."
                    required
                    disabled={busy}
                    options={[
                      { value: '', label: 'Choose a category' },
                      ...COMPANY_DOCUMENT_CATEGORIES,
                    ]}
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                  />
                  <Input
                    fullWidth
                    label="Title"
                    maxLength={255}
                    placeholder="Employee handbook, onboarding checklist, exit policy..."
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
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
                    ref={uploadFileInputRef}
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
          </div>
        )}

        {!uploadOpen ? (
          <div data-tour-anchor="organization-company-document-library">
            <CompanyDocumentLibrary
              documents={companyDocuments}
              loading={loading}
              failed={Boolean(loadError)}
              busy={busy}
              canManage={canManageCompanyDocuments}
              onRetry={() => void loadDocuments().catch(() => undefined)}
              onDownload={downloadCompanyDocument}
              onDelete={deleteCompanyDocument}
            />
          </div>
        ) : null}
      </PageTabPanel>
      <PageTabPanel id="types" activeTab={tab}>
        <Card title="Document Types">
          {loadError ? (
            <p className="text-sm text-content-secondary">
              Document requirements are unavailable. Refresh the library to try again.
            </p>
          ) : loading ? (
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No document types configured.
            </p>
          )}
        </Card>
      </PageTabPanel>

      <PageTabPanel id="personal" activeTab={tab}>
        <Card title="Your Documents">
          {loadError ? (
            <p className="text-sm text-content-secondary">
              Your documents are unavailable. Refresh the library to try again.
            </p>
          ) : loading ? (
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
                  render: (document: EmployeeDocumentRow) => (
                    <Badge variant="info">{document.status}</Badge>
                  ),
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
                    document.expiryDate
                      ? new Date(document.expiryDate).toLocaleDateString('en-IN')
                      : '—',
                },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
          )}
        </Card>
      </PageTabPanel>
    </div>
  );
};

const OrganizationDocumentsPage = () => {
  const client = useGraphClient('client');
  const { tenantId, user, clientSession } = useAuth();
  const [owner, setOwner] = useState({ client, generation: 0 });
  if (owner.client !== client) setOwner({ client, generation: owner.generation + 1 });
  return (
    <DocumentsContent
      key={
        String(tenantId) +
        ':' +
        String(user?.id) +
        ':' +
        authorizationStateKey(clientSession) +
        ':' +
        owner.generation
      }
    />
  );
};

export default OrganizationDocumentsPage;
