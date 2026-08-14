/**
 * Module Health panel.
 *
 * Probes federated Helior HRMS subgraphs through the stitching gateway.
 */
import { useEffect, useMemo, useState } from 'react';
import { useGraphClient } from '@/hooks/useGraphClient';
import { graphQlUserMessage } from '@/utils/graphqlUserMessage';
import ModuleHealthStatusBadge from './components/ModuleHealthStatusBadge';
import { MODULE_HEALTH_PROBES } from './moduleHealthProbes';
import type { ProbeState } from './moduleHealthTypes';

const initialProbeState = () =>
  Object.fromEntries(
    MODULE_HEALTH_PROBES.map((probe) => [probe.key, { status: 'idle' } as ProbeState])
  );

const ModuleHealth = () => {
  const client = useGraphClient('client');
  const operatorClient = useGraphClient('operator');
  const [results, setResults] = useState<Record<string, ProbeState>>(initialProbeState);
  const [runToken, setRunToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      for (const probe of MODULE_HEALTH_PROBES) {
        if (cancelled) return;
        setResults((prev) => ({ ...prev, [probe.key]: { status: 'loading' } }));
        const graphClient = probe.plane === 'operator' ? operatorClient : client;
        try {
          const data = await graphClient.request<Record<string, unknown>>(probe.query);
          const [rootKey] = probe.previewFields;
          const rows = Array.isArray(data?.[rootKey]) ? (data[rootKey] as unknown[]) : [];
          setResults((prev) => ({
            ...prev,
            [probe.key]: {
              status: 'ok',
              count: rows.length,
              sample: JSON.stringify(rows[0] ?? null),
            },
          }));
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [probe.key]: {
              status: 'error',
              message: graphQlUserMessage(err),
            },
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, operatorClient, runToken]);

  const summary = useMemo(() => {
    const tally = { ok: 0, error: 0, pending: 0 };
    for (const result of Object.values(results)) {
      if (result.status === 'ok') tally.ok += 1;
      else if (result.status === 'error') tally.error += 1;
      else tally.pending += 1;
    }
    return tally;
  }, [results]);

  return (
    <div className="space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Module Health</h1>
          <p className="text-sm text-gray-500">
            Live introspection of every Helior HRMS subgraph through the stitching gateway.
            Tenant-plane queries use the current tenant id; ops-plane queries use operator headers.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          onClick={() => setRunToken((current) => current + 1)}
        >
          Re-run probes
        </button>
      </header>

      <div className="flex gap-3 text-sm">
        <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-800">
          OK: {summary.ok}
        </span>
        <span className="rounded bg-rose-100 px-2 py-1 text-rose-800">
          Failed: {summary.error}
        </span>
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-800">
          Pending: {summary.pending}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_HEALTH_PROBES.map((probe) => {
          const state = results[probe.key];
          return (
            <div
              key={probe.key}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{probe.label}</h2>
                <ModuleHealthStatusBadge state={state} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                plane: <code>{probe.plane}</code>
              </p>
              {state.status === 'ok' ? (
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-xs">
                  {state.sample}
                </pre>
              ) : null}
              {state.status === 'error' ? (
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-rose-50 p-2 text-xs text-rose-800">
                  {state.message}
                </pre>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleHealth;
