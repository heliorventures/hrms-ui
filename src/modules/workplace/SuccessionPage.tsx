import { useCallback, useEffect, useState } from 'react';

import { type WorkplaceSuccessionDataQuery } from '../../api/graphql/graphql';
import { scopeForPermission } from '../../auth/approvalScope';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { successionSetupPageDocument } from './successionSetup';

import type { SuccessionSetupValues } from './successionSetup';
import SuccessionSetupModal from './SuccessionSetupModal';

const SuccessionPage = () => {
  const { can, clientSession } = useAuth();
  const canManage =
    can('succession:manage') && scopeForPermission(clientSession, 'succession:manage') === 'ALL';
  const [editor, setEditor] = useState<{
    kind: 'competency' | 'pool';
    initial?: SuccessionSetupValues;
  } | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplaceSuccessionDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request<WorkplaceSuccessionDataQuery>(successionSetupPageDocument, { offset });
  }, [client, offset]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) {
          setHasNext(r.competencies.length > 20 || r.talentPools.length > 20);
          setData({
            ...r,
            competencies: r.competencies.slice(0, 20),
            talentPools: r.talentPools.slice(0, 20),
          });
        }
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load, refresh]);

  return (
    <div className="space-y-4">
      <PageHeader title="Succession" />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card
        title={
          <span className="flex items-center justify-between gap-3">
            <span>Competencies</span>
            {canManage && (
              <Button size="sm" onClick={() => setEditor({ kind: 'competency' })}>
                Create Competency
              </Button>
            )}
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.competencies.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.competencies.map((row) => (
              <li key={row.id} className="py-3 first:pt-0">
                {canManage && (
                  <Button
                    className="float-right"
                    variant="outline"
                    size="sm"
                    aria-label={`Edit competency ${row.name}`}
                    onClick={() => setEditor({ kind: 'competency', initial: row })}
                  >
                    Edit
                  </Button>
                )}
                <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                <p className="text-xs text-gray-500">
                  {row.category ?? '—'}
                  {row.description ? ` · ${row.description}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Competencies In Catalog.</p>
        )}
      </Card>
      <Card
        title={
          <span className="flex items-center justify-between gap-3">
            <span>Talent Pools</span>
            {canManage && (
              <Button size="sm" onClick={() => setEditor({ kind: 'pool' })}>
                Create Talent Pool
              </Button>
            )}
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.talentPools.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.talentPools.map((p) => (
              <li key={p.id} className="py-3 first:pt-0">
                {canManage && (
                  <Button
                    className="float-right"
                    variant="outline"
                    size="sm"
                    aria-label={`Edit talent pool ${p.name}`}
                    onClick={() => setEditor({ kind: 'pool', initial: p })}
                  >
                    Edit
                  </Button>
                )}
                <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                {p.description ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{p.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Talent Pools Defined.</p>
        )}
      </Card>
      <nav aria-label="Succession pages" className="flex items-center justify-end gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={loading || offset === 0}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Previous
        </Button>
        <span className="text-sm">Page {Math.floor(offset / 20) + 1}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !hasNext}
          onClick={() => setOffset((value) => value + 20)}
        >
          Next
        </Button>
      </nav>
      {editor && canManage && (
        <SuccessionSetupModal
          kind={editor.kind}
          initial={editor.initial}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setRefresh((v) => v + 1);
          }}
        />
      )}
    </div>
  );
};

export default SuccessionPage;
