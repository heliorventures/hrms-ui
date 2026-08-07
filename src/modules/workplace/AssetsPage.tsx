import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { WorkplaceAssetsDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

const AssetsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<{
    assetCategories: { id: string; name: string; code?: string | null }[];
    assets: {
      id: string;
      name: string;
      assetCategoryId: string;
      serialNumber?: string | null;
      assetTag?: string | null;
      status: string;
      purchaseDate?: string | null;
      purchaseValue?: string | null;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceAssetsDocument, { calim: 40, alim: 100 });
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Categories">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.assetCategories?.length ? (
          <ul className="flex flex-wrap gap-2">
            {data.assetCategories.map((x) => (
              <li
                key={x.id}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
              >
                {x.name}
                {x.code ? ` (${x.code})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No categories.</p>
        )}
      </Card>
      <Card title="Inventory">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.assets?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.assets.map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{a.name}</p>
                <p className="text-xs text-gray-500">
                  {a.status}
                  {a.assetTag ? ` · tag ${a.assetTag}` : ''}
                  {a.serialNumber ? ` · S/N ${a.serialNumber}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No assets.</p>
        )}
      </Card>
    </div>
  );
};

export default AssetsPage;
