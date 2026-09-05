import { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';

import type { WorkplacePerformanceQuery } from '../../api/graphql/graphql';
import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { cycleFields, SaveReviewCycleDocument } from './performanceSetup';
import { SetupEditor } from './performanceSetupEditor';

const PerformanceCatalogDocument = gql`
  query PerformanceCatalog($offset: Int!) {
    reviewCycles(limit: 20, offset: $offset) {
      id
      name
      startDate
      endDate
      status
      reviewType
    }
    goals(limit: 80) {
      id
      employeeId
      reviewCycleId
      title
      status
      weightage
    }
  }
`;

const PerformancePage = () => {
  const { clientSession } = useAuth();
  const canManage = createPermissionService(clientSession).canScopedPermission(
    'performance:manage',
    ['ALL']
  );
  const [editor, setEditor] = useState<{
    id?: string;
    name: string;
    startDate: string;
    endDate: string;
    reviewType: string;
  } | null>(null);
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplacePerformanceQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request<WorkplacePerformanceQuery>(PerformanceCatalogDocument, { offset });
  }, [client, offset]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setData(null);
        setError(null);
        const r = await load();
        if (!c) setData(r as typeof data);
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance</h1>
      {notice && (
        <p role="status" className="text-sm text-content-secondary">
          {notice}
        </p>
      )}
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Review Cycles">
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            className="mb-3 text-sm font-medium text-primary-600"
            onClick={() => setEditor({ name: '', startDate: '', endDate: '', reviewType: '' })}
          >
            Create review cycle
          </Button>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.reviewCycles.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.reviewCycles.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                {canManage && c.status.toUpperCase() === 'DRAFT' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm text-primary-600"
                    onClick={() => setEditor({ ...c, reviewType: c.reviewType ?? '' })}
                  >
                    Edit review cycle
                  </Button>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {c.startDate} → {c.endDate} · {c.status}
                  {c.reviewType ? ` · ${c.reviewType}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Review Cycles.</p>
        )}
      </Card>
      <Card title="Goals">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.goals.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.goals.map((g) => (
              <li key={g.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{g.title}</p>
                <p className="text-xs text-gray-500">
                  {g.status}
                  {g.weightage ? ` · weight ${g.weightage}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Goals.</p>
        )}
      </Card>
      <nav aria-label="Performance pagination" className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={loading || offset === 0}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Previous
        </Button>
        <span className="text-sm text-content-secondary">Page {offset / 20 + 1}</span>
        <Button
          variant="outline"
          disabled={loading || !(data && data.reviewCycles.length === 20)}
          onClick={() => setOffset((value) => value + 20)}
        >
          Next
        </Button>
      </nav>
      {editor && canManage && (
        <SetupEditor
          title={editor.id ? 'Edit review cycle' : 'Create review cycle'}
          fields={cycleFields}
          initial={editor}
          onClose={() => setEditor(null)}
          onSave={async (values) => {
            await client.request(SaveReviewCycleDocument, {
              input: {
                id: editor.id ?? null,
                name: String(values.name).trim(),
                startDate: values.startDate,
                endDate: values.endDate,
                reviewType: String(values.reviewType).trim() || null,
              },
            });
            setNotice('Saved. Use Previous and Next to browse the catalog.');
            try {
              setData(await load());
              setError(null);
            } catch (e) {
              setError('Saved, but the list could not refresh. ' + graphQlUserMessage(e));
            }
          }}
        />
      )}
    </div>
  );
};

export default PerformancePage;
