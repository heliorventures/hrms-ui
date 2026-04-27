import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  AdminWorkflowsDataDocument,
  type AdminWorkflowsDataQuery,
} from '../../api/graphql/graphql';

const AdminWorkflowsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<AdminWorkflowsDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(AdminWorkflowsDataDocument, { wl: 30, il: 50 });
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
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load workflows');
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
        title="Workflows"
        description="Definitions and in-flight instances (e.g. leave approval). Step rules are configured in the system; a visual designer may follow in a later release."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Definitions">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.workflows?.length ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {data.workflows.map((w) => (
              <li key={w.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{w.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {w.entityType ?? '—'} · {w.isActive ? 'active' : 'inactive'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No workflows.</p>
        )}
      </Card>
      <Card title="Instances">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.workflowInstances?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="rounded-tl-md py-2.5 pl-2 pr-3">Entity</th>
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="rounded-tr-md py-2.5 pr-2">Entity id</th>
                </tr>
              </thead>
              <tbody>
                {data.workflowInstances.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-700/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2.5 pl-2 pr-3 text-slate-800 dark:text-slate-200">
                      {i.entityType ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200">{i.status}</td>
                    <td className="py-2.5 pr-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {i.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No instances.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminWorkflowsPage;
