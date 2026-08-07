import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { OrgDocumentsListDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

interface DocumentTypeRow {
  id: string;
  name: string;
  category?: string | null;
  isRequired: boolean;
}

interface EmployeeDocumentRow {
  id: string;
  documentTypeId: string;
  status: string;
  uploadedAt: string;
  expiryDate?: string | null;
}

const OrganizationDocumentsPage = () => {
  const client = useGraphClient('client');
  const [types, setTypes] = useState<DocumentTypeRow[]>([]);
  const [docs, setDocs] = useState<EmployeeDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeName = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t.name])), [types]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.request<{
          documentTypes: DocumentTypeRow[];
          employeeDocuments: EmployeeDocumentRow[];
        }>(OrgDocumentsListDocument, { tlim: 50, dlim: 50 });
        if (!c) {
          setTypes(res.documentTypes);
          setDocs(res.employeeDocuments);
        }
      } catch (e) {
        if (!c) {
          setError(
            graphQlUserMessage(e)
          );
        }
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization documents</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Policy types and your uploaded files for this tenant.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
        </Card>
      )}

      <Card title="Document types">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : types.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {types.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{t.name}</h3>
                  {t.isRequired && <Badge variant="warning">Required</Badge>}
                </div>
                {t.category && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.category}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No document types configured.</p>
        )}
      </Card>

      <Card title="Your documents">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : docs.length ? (
          <Table
            data={docs}
            keyExtractor={(r) => r.id}
            columns={[
              {
                key: 'name',
                label: 'Type',
                render: (r: EmployeeDocumentRow) => typeName[r.documentTypeId] ?? r.documentTypeId,
              },
              {
                key: 'status',
                label: 'Status',
                render: (r: EmployeeDocumentRow) => <Badge variant="info">{r.status}</Badge>,
              },
              {
                key: 'uploadedAt',
                label: 'Uploaded',
                render: (r: EmployeeDocumentRow) => new Date(r.uploadedAt).toLocaleString('en-IN'),
              },
              {
                key: 'expiryDate',
                label: 'Expires',
                render: (r: EmployeeDocumentRow) =>
                  r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '—',
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
