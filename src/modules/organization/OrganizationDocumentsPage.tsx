import { useMockApi } from '../../hooks/useMockApi';
import { useTenant } from '../../contexts/TenantContext';
import { mockOrganizationDocuments } from '../../mocks/organizationDocuments';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrganizationDocumentsPage = () => {
  const { currentTenant } = useTenant();

  const { data: documents, loading } = useMockApi(
    () =>
      mockOrganizationDocuments
        .filter((d) => d.tenantId === currentTenant.id)
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    { delay: 300 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Organization Documents
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Company-wide policies and documents (leave policy, attendance, code of conduct, etc.)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {documents?.map((doc) => (
          <Card key={doc.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {doc.category}
                </span>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {doc.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {doc.description}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Published {formatDate(doc.publishedAt)}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View
              </button>
            </div>
          </Card>
        ))}
      </div>

      {(!documents || documents.length === 0) && (
        <Card>
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No organization documents available.
          </p>
        </Card>
      )}
    </div>
  );
};

export default OrganizationDocumentsPage;
