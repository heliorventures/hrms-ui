import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';

const QUERY = gql`
  query WorkplacePerformance($clim: Int! = 20, $glim: Int! = 80) {
    reviewCycles(limit: $clim) {
      id
      name
      startDate
      endDate
      status
      reviewType
    }
    goals(limit: $glim) {
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
  const client = useGraphClient('client');
  const [data, setData] = useState<{
    reviewCycles: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      status: string;
      reviewType?: string | null;
    }[];
    goals: {
      id: string;
      employeeId: string;
      reviewCycleId: string;
      title: string;
      status: string;
      weightage?: string | null;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(QUERY, { clim: 20, glim: 80 });
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
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load performance data');
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Review cycles">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.reviewCycles?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.reviewCycles.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {c.startDate} → {c.endDate} · {c.status}
                  {c.reviewType ? ` · ${c.reviewType}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No review cycles.</p>
        )}
      </Card>
      <Card title="Goals">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.goals?.length ? (
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
          <p className="text-sm text-gray-500">No goals.</p>
        )}
      </Card>
    </div>
  );
};

export default PerformancePage;
