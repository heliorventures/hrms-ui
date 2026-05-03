import { useCallback, useEffect, useMemo, useState } from 'react';
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
  InsightsIntegrationCatalogDocument,
  InsightsTenantIntegrationsDocument,
  InsightsWebhookSubscriptionsDocument,
  InsightsWebhookDeliveryLogsDocument,
  InsightsAuditLogsDocument,
  ConnectTenantIntegrationDocument,
  RegisterWebhookSubscriptionDocument,
  SetWebhookSubscriptionActiveDocument,
  type InsightsWorkforceQuery,
  type InsightsReportsSchedulesQuery,
  type InsightsDashboardsQuery,
  type InsightsOutboxQuery,
  type InsightsIntegrationCatalogQuery,
  type InsightsTenantIntegrationsQuery,
  type InsightsWebhookSubscriptionsQuery,
  type InsightsWebhookDeliveryLogsQuery,
  type InsightsAuditLogsQuery,
} from '../../api/graphql/graphql';

type Tab = 'overview' | 'reports' | 'dashboards' | 'outbox' | 'integrations';

const AnalyticsPage = () => {
  const { can } = useAuth();
  const showInsightsActions = can('analytics:read') || can('employee:write');
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

  const [integrationsErr, setIntegrationsErr] = useState<string | null>(null);
  const [icat, setIcat] = useState<InsightsIntegrationCatalogQuery | null>(null);
  const [tint, setTint] = useState<InsightsTenantIntegrationsQuery | null>(null);
  const [wsubs, setWsubs] = useState<InsightsWebhookSubscriptionsQuery | null>(null);
  const [whDel, setWhDel] = useState<InsightsWebhookDeliveryLogsQuery | null>(null);
  const [aud, setAud] = useState<InsightsAuditLogsQuery | null>(null);
  const [intLoading, setIntLoading] = useState(false);
  const [connectBusy, setConnectBusy] = useState<string | null>(null);
  const [hookBusyId, setHookBusyId] = useState<string | null>(null);
  const [whEvent, setWhEvent] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whSecret, setWhSecret] = useState('');
  const [whSubmitting, setWhSubmitting] = useState(false);

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

  const loadIntegrationsPanel = useCallback(async () => {
    setIntegrationsErr(null);
    setIntLoading(true);
    try {
      const [a, b, c, d, e] = await Promise.all([
        client.request(InsightsIntegrationCatalogDocument, { lim: 100 }),
        client.request(InsightsTenantIntegrationsDocument, { lim: 100 }),
        client.request(InsightsWebhookSubscriptionsDocument, { lim: 100 }),
        client.request(InsightsWebhookDeliveryLogsDocument, { lim: 80 }),
        client.request(InsightsAuditLogsDocument, { lim: 80 }),
      ]);
      setIcat(a);
      setTint(b);
      setWsubs(c);
      setWhDel(d);
      setAud(e);
    } catch (e) {
      setIcat(null);
      setTint(null);
      setWsubs(null);
      setWhDel(null);
      setAud(null);
      setIntegrationsErr(
        e instanceof Error &&
          (e.message.toLowerCase().includes('forbidden') ||
            e.message.toLowerCase().includes('403'))
          ? 'Integrations and audit views require HR or employee-directory access.'
          : e instanceof Error
            ? e.message
            : 'Could not load integrations / audit.'
      );
    } finally {
      setIntLoading(false);
    }
  }, [client]);

  const connectedConnectorIds = useMemo(() => {
    const s = new Set<string>();
    tint?.tenantIntegrations?.forEach((r) => {
      if (r.isActive) s.add(r.integrationConnectorId);
    });
    return s;
  }, [tint]);

  const connectIntegration = async (connectorId: string) => {
    setConnectBusy(connectorId);
    try {
      await client.request(ConnectTenantIntegrationDocument, { connectorId });
      await loadIntegrationsPanel();
    } catch (e) {
      setIntegrationsErr(e instanceof Error ? e.message : 'Connect failed.');
    } finally {
      setConnectBusy(null);
    }
  };

  const registerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whEvent.trim() || !whUrl.trim()) {
      setIntegrationsErr('Event name and endpoint URL are required.');
      return;
    }
    setWhSubmitting(true);
    setIntegrationsErr(null);
    try {
      await client.request(RegisterWebhookSubscriptionDocument, {
        input: {
          eventName: whEvent.trim(),
          endpointUrl: whUrl.trim(),
          webhookSecret: whSecret.trim() ? whSecret.trim() : null,
        },
      });
      setWhEvent('');
      setWhUrl('');
      setWhSecret('');
      await loadIntegrationsPanel();
    } catch (err) {
      setIntegrationsErr(err instanceof Error ? err.message : 'Register webhook failed.');
    } finally {
      setWhSubmitting(false);
    }
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    setHookBusyId(id);
    try {
      await client.request(SetWebhookSubscriptionActiveDocument, { id, active });
      await loadIntegrationsPanel();
    } catch (e) {
      setIntegrationsErr(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setHookBusyId(null);
    }
  };

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

  useEffect(() => {
    if (tab !== 'integrations') return;
    void loadIntegrationsPanel();
  }, [tab, loadIntegrationsPanel]);

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
          { id: 'integrations', label: 'Integrations & audit' },
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
                    {showInsightsActions && <th className="py-2">Action</th>}
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
                      {showInsightsActions && (
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

      {tab === 'integrations' && (
        <div className="space-y-4">
          {integrationsErr && (
            <Card>
              <p className="text-sm text-amber-700 dark:text-amber-300">{integrationsErr}</p>
            </Card>
          )}
          {intLoading ? (
            <Card>
              <p className="text-sm text-gray-500">Loading integrations…</p>
            </Card>
          ) : (
            <>
              <Card title="Integration catalogue (global)">
                {icat?.integrationConnectors?.length ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {icat.integrationConnectors.map((c) => {
                      const conn = connectedConnectorIds.has(c.id);
                      return (
                        <li
                          key={c.id}
                          className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-500">
                              {c.code}
                              {c.category ? ` · ${c.category}` : ''}{' '}
                              {c.authType ? `· ${c.authType}` : ''}
                            </p>
                          </div>
                          {conn ? (
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              Connected for this tenant
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={connectBusy === c.id}
                              className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-50 disabled:opacity-60 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
                              onClick={() => void connectIntegration(c.id)}
                            >
                              {connectBusy === c.id ? '…' : 'Connect'}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : integrationsErr ? null : (
                  <p className="text-sm text-gray-500">
                    No connectors in the ops catalogue yet.
                  </p>
                )}
              </Card>

              <Card title="Tenant integrations">
                {tint?.tenantIntegrations?.length ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    {tint.tenantIntegrations.map((r) => (
                      <li key={r.id} className="py-2">
                        <span className="font-mono text-xs text-gray-500">{r.integrationConnectorId}</span>
                        {' · '}
                        <span className={r.isActive ? 'text-emerald-700' : 'text-gray-500'}>
                          {r.isActive ? 'active' : 'inactive'}
                        </span>
                        {r.connectedAt ? (
                          <span className="text-gray-400"> · {String(r.connectedAt)}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : integrationsErr ? null : (
                  <p className="text-sm text-gray-500">No tenant integration rows.</p>
                )}
              </Card>

              <Card title="Outbound webhooks">
                <form
                  className="mb-6 space-y-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40"
                  onSubmit={registerWebhook}
                >
                  <p className="text-xs text-gray-500">
                    Registers a webhook (HTTPS URL). Signing secret is stored as SHA-256 hex server-side.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Event name</span>
                      <input
                        className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                        value={whEvent}
                        onChange={(e) => setWhEvent(e.target.value)}
                        placeholder="e.g. expense.approved"
                      />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-gray-600 dark:text-gray-300">Endpoint URL</span>
                      <input
                        className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                        value={whUrl}
                        onChange={(e) => setWhUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-gray-600 dark:text-gray-300">Signing secret (optional)</span>
                      <input
                        type="password"
                        autoComplete="off"
                        className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                        value={whSecret}
                        onChange={(e) => setWhSecret(e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={whSubmitting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {whSubmitting ? 'Registering…' : 'Register webhook'}
                  </button>
                </form>
                {wsubs?.webhookSubscriptions?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-gray-500">
                          <th className="py-2 pr-3">Event</th>
                          <th className="py-2 pr-3">URL</th>
                          <th className="py-2 pr-3">Active</th>
                          <th className="py-2">Toggle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wsubs.webhookSubscriptions.map((h) => (
                          <tr key={h.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 pr-3">{h.eventName}</td>
                            <td className="max-w-xs truncate py-2 pr-3" title={h.endpointUrl}>
                              {h.endpointUrl}
                            </td>
                            <td className="py-2 pr-3">{h.isActive ? 'yes' : 'no'}</td>
                            <td className="py-2">
                              <button
                                type="button"
                                disabled={hookBusyId === h.id}
                                className="text-xs underline text-indigo-700 dark:text-indigo-400 disabled:opacity-50"
                                onClick={() => void toggleWebhook(h.id, !h.isActive)}
                              >
                                {hookBusyId === h.id ? '…' : h.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : integrationsErr ? null : (
                  <p className="text-sm text-gray-500">No webhook subscriptions.</p>
                )}
              </Card>

              <Card title="Webhook deliveries (recent)">
                {whDel?.webhookDeliveryLogs?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b uppercase text-gray-500">
                          <th className="py-2 pr-2">Delivered</th>
                          <th className="py-2 pr-2">Event</th>
                          <th className="py-2 pr-2">Sub</th>
                          <th className="py-2 pr-2">HTTP</th>
                          <th className="py-2 pr-2">OK</th>
                          <th className="py-2">Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whDel.webhookDeliveryLogs.map((row) => {
                          const resp =
                            row.responseBody && row.responseBody.length > 120
                              ? `${row.responseBody.slice(0, 120)}…`
                              : (row.responseBody ?? '—');
                          return (
                            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-2 pr-2 whitespace-nowrap text-gray-500">
                                {String(row.deliveredAt)}
                              </td>
                              <td className="py-2 pr-2">{row.eventName ?? '—'}</td>
                              <td className="max-w-[7rem] truncate py-2 pr-2 font-mono" title={row.webhookSubscriptionId}>
                                {row.webhookSubscriptionId.slice(0, 8)}…
                              </td>
                              <td className="py-2 pr-2">{row.httpStatus ?? '—'}</td>
                              <td className="py-2 pr-2">{row.isSuccess ? 'yes' : 'no'}</td>
                              <td className="max-w-md truncate py-2" title={row.responseBody ?? ''}>
                                {resp}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : integrationsErr ? null : (
                  <p className="text-sm text-gray-500">No delivery attempts logged yet.</p>
                )}
              </Card>

              <Card title="Audit log (recent)">
                {aud?.auditLogs?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b uppercase text-gray-500">
                          <th className="py-2 pr-2">When</th>
                          <th className="py-2 pr-2">Action</th>
                          <th className="py-2 pr-2">Entity</th>
                          <th className="py-2 pr-2">User</th>
                          <th className="py-2">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aud.auditLogs.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 pr-2 whitespace-nowrap text-gray-500">
                              {String(row.createdAt)}
                            </td>
                            <td className="py-2 pr-2">{row.action}</td>
                            <td className="py-2 pr-2">{row.entityType}</td>
                            <td className="py-2 pr-2 font-mono">{row.userId?.slice(0, 8) ?? '—'}</td>
                            <td className="max-w-md truncate py-2" title={row.afterJson ?? row.beforeJson ?? ''}>
                              {row.ipAddress ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : integrationsErr ? null : (
                  <p className="text-sm text-gray-500">No audit rows.</p>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
