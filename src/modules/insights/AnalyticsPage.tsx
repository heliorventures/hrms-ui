import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import TabBar from '../../components/common/TabBar';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  InsightsWorkforceDocument,
  InsightsReportsSchedulesDocument,
  InsightsDashboardsDocument,
  InsightsOutboxDocument,
  RequeueOutboxDocument,
  type InsightsWorkforceQuery,
  type InsightsReportsSchedulesQuery,
  type InsightsDashboardsQuery,
  type InsightsOutboxQuery,
} from '../../api/graphql/graphql';

type Tab = 'overview' | 'reports' | 'dashboards' | 'outbox';

const AnalyticsPage = () => {
  const { role } = useAuth();
  const client = useGraphClient('client');
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [w, setW] = useState<InsightsWorkforceQuery | null>(null);
  const [rep, setRep] = useState<InsightsReportsSchedulesQuery | null>(null);
  const [dash, setDash] = useState<InsightsDashboardsQuery | null>(null);
  const [out, setOut] = useState<InsightsOutboxQuery | null>(null);
  const [outErr, setOutErr] = useState<string | null>(null);
  const [requeueBusy, setRequeueBusy] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    setOutErr(null);
    const [wf, r, d] = await Promise.all([
      client.request(InsightsWorkforceDocument, { lim: 24 }),
      client.request(InsightsReportsSchedulesDocument, {}),
      client.request(InsightsDashboardsDocument, {}),
    ]);
    setW(wf);
    setRep(r);
    setDash(d);
    try {
      const o = await client.request(InsightsOutboxDocument, { lim: 50 });
      setOut(o);
    } catch (e) {
      setOut(null);
      setOutErr(
        e instanceof Error && e.message.toLowerCase().includes('forbidden')
          ? 'Event queue is limited to HR or directory managers.'
          : e instanceof Error
            ? e.message
            : 'Could not load outbox'
      );
    }
  }, [client]);

  const requeue = async (id: string) => {
    setRequeueBusy(id);
    setOutErr(null);
    try {
      await client.request(RequeueOutboxDocument, { id });
      const o = await client.request(InsightsOutboxDocument, { lim: 50 });
      setOut(o);
    } catch (e) {
      setOutErr(
        e instanceof Error ? e.message : 'Requeue failed — deploy latest kabipay-analytics (4029)?'
      );
    } finally {
      setRequeueBusy(null);
    }
  };

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        await loadAll();
      } catch (e) {
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load insights');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [loadAll]);

  return (
    <div>
      <PageHeader
        title="Insights"
        description="Workforce trends, reports, and dashboards. The event queue shows transactional outbox events; HR can requeue failed or stuck processing items after deploying the outbox hardening build."
      />

      <TabBar
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
          { id: 'overview', label: 'Workforce' },
          { id: 'reports', label: 'Reports & schedules' },
          { id: 'dashboards', label: 'Dashboards' },
          { id: 'outbox', label: 'Event queue' },
        ]}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <Card>
              <p className="text-sm text-gray-500">Loading…</p>
            </Card>
          ) : w?.workforceSnapshots?.length ? (
            w.workforceSnapshots.map((s) => (
              <Card key={s.id} title={`Snapshot · ${String(s.snapshotDate)}`}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Headcount</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {s.totalHeadcount ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Active</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {s.activeEmployees ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">New joiners</dt>
                    <dd>{s.newJoiners ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Separations</dt>
                    <dd>{s.separations ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Open roles</dt>
                    <dd>{s.openPositions ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Avg tenure (mo.)</dt>
                    <dd>{s.averageTenureMonths ?? '—'}</dd>
                  </div>
                </dl>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-gray-500">No workforce snapshots yet.</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <Card title="Report definitions">
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : rep?.reportDefinitions?.length ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {rep.reportDefinitions.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0">
                    <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">
                      {r.entityType ?? '—'} · {r.chartType ?? '—'} {r.isPublic ? '· public' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No report definitions.</p>
            )}
          </Card>
          <Card title="Schedules">
            {loading ? null : rep?.reportSchedules?.length ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {rep.reportSchedules.map((s) => (
                  <li key={s.id} className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {s.frequency} · {s.isActive ? 'active' : 'paused'} · {s.deliveryFormat ?? '—'}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No schedules.</p>
            )}
          </Card>
        </div>
      )}

      {tab === 'dashboards' && (
        <div className="space-y-4">
          <Card title="Boards">
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : dash?.dashboards?.length ? (
              <ul className="space-y-3">
                {dash.dashboards.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-indigo-100 bg-white/60 p-4 dark:border-indigo-900/40 dark:bg-gray-800/50"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {b.name}
                      {b.isDefault ? (
                        <span className="ml-2 text-xs font-normal text-indigo-600 dark:text-indigo-400">
                          default
                        </span>
                      ) : null}
                    </p>
                    {b.description ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{b.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No dashboards.</p>
            )}
          </Card>
          <Card title="Widgets">
            {!loading && dash?.dashboardWidgets?.length ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {dash.dashboardWidgets.map((w) => (
                  <li key={w.id} className="py-2 text-sm">
                    <span className="font-medium">{w.title ?? w.widgetType ?? 'Widget'}</span>
                    <span className="text-gray-500"> · {w.widgetType ?? '—'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No widgets.</p>
            )}
          </Card>
        </div>
      )}

      {tab === 'outbox' && (
        <Card title="Outbox (transactional events)">
          {outErr && <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">{outErr}</p>}
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : out?.outboxEvents?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Aggregate</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Created</th>
                    <th className="py-2 pr-3">Retries</th>
                    <th className="py-2 pr-3">Last error</th>
                    {role === 'admin' && <th className="py-2">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {out.outboxEvents.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 pr-3">{e.eventType}</td>
                      <td className="py-2 pr-3">{e.aggregateType}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={
                            e.status === 'PROCESSED'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : e.status === 'FAILED'
                                ? 'text-red-600 dark:text-red-400'
                                : e.status === 'PENDING' || e.status === 'PROCESSING'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-600'
                          }
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-500">{String(e.createdAt)}</td>
                      <td className="py-2 pr-3">{e.retryCount}</td>
                      <td
                        className="max-w-xs truncate py-2 pr-3 text-xs text-gray-500"
                        title={e.lastError ?? ''}
                      >
                        {e.lastError ?? '—'}
                      </td>
                      {role === 'admin' && (
                        <td className="py-2">
                          {(e.status === 'FAILED' || e.status === 'PROCESSING') && (
                            <button
                              type="button"
                              className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
                              disabled={requeueBusy === e.id}
                              onClick={() => void requeue(e.id)}
                            >
                              {requeueBusy === e.id ? '…' : 'Requeue'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !outErr ? (
            <p className="text-sm text-gray-500">
              No outbox events (approve a leave to generate one).
            </p>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
