import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  AdminWorkflowsDataDocument,
  AdminWorkflowsStepsDataDocument,
  type AdminWorkflowsDataQuery,
  type AdminWorkflowsStepsDataQuery,
} from '../../api/graphql/graphql';

const AdminWorkflowsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<AdminWorkflowsDataQuery | null>(null);
  const [stepsData, setStepsData] = useState<AdminWorkflowsStepsDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const base = await client.request<AdminWorkflowsDataQuery>(AdminWorkflowsDataDocument, {
      wl: 30,
      il: 50,
    });
    try {
      const withSteps = await client.request<AdminWorkflowsStepsDataQuery>(
        AdminWorkflowsStepsDataDocument,
        { wl: 30 },
      );
      return { base, withSteps };
    } catch {
      return { base, withSteps: null as AdminWorkflowsStepsDataQuery | null };
    }
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (c) return;
        setData(r.base);
        setStepsData(r.withSteps);
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
        description="Definitions (with step order) and in-flight instances. Approver type and SLAs are read from the graph; this page is a read-only board — editing definitions is a future step."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Definitions & steps">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : stepsData?.workflowsWithSteps && stepsData.workflowsWithSteps.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {stepsData.workflowsWithSteps.map((row) => (
              <li key={row.workflow.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{row.workflow.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {row.workflow.entityType ?? '—'} · {row.workflow.isActive ? 'active' : 'inactive'}
                </p>
                {row.steps?.length > 0 ? (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {row.steps.map((s) => (
                      <li key={s.id}>
                        <span className="font-medium">{s.sequenceOrder}.</span> {s.stepName}
                        {s.approverType ? (
                          <span className="text-slate-500"> · {s.approverType}</span>
                        ) : null}
                        {s.slaHours != null ? (
                          <span className="text-slate-500"> · SLA {s.slaHours}h</span>
                        ) : null}
                        {s.canSkip ? <span className="text-amber-600"> · can skip</span> : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">No steps in graph.</p>
                )}
              </li>
            ))}
          </ul>
        ) : data?.workflows && data.workflows.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {data.workflows.map((w) => (
              <li key={w.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{w.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {w.entityType ?? '—'} · {w.isActive ? 'active' : 'inactive'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Step list requires a gateway with <span className="font-mono">workflowsWithSteps</span> from
                  kabipay-workflow. Restart the gateway / subgraph after upgrade.
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
