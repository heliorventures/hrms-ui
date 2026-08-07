import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  WorkplaceSuccessionDataDocument,
  type WorkplaceSuccessionDataQuery,
} from '../../api/graphql/graphql';

const SuccessionPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplaceSuccessionDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceSuccessionDataDocument, { clim: 100, plim: 50 });
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) setData(r);
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
    <div className="space-y-6">
      <PageHeader
        title="Succession"
        description="Competency catalog and talent pools for planning coverage and development."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Competencies">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.competencies?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.competencies.map((row) => (
              <li key={row.id} className="py-3 first:pt-0">
                <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                <p className="text-xs text-gray-500">
                  {row.category ?? '—'}
                  {row.description ? ` · ${row.description}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No competencies in catalog.</p>
        )}
      </Card>
      <Card title="Talent pools">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.talentPools?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.talentPools.map((p) => (
              <li key={p.id} className="py-3 first:pt-0">
                <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                {p.description ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{p.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No talent pools defined.</p>
        )}
      </Card>
    </div>
  );
};

export default SuccessionPage;
