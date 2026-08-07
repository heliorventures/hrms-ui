import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import TabBar from '../../components/common/TabBar';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AnalyticsWebhookDeliveryLogsDocument,
  WorkplaceSuccessionDataDocument,
  type AnalyticsWebhookDeliveryLogsQuery,
  type WorkplaceSuccessionDataQuery,
} from '../../api/graphql/graphql';

type Tab = 'workplace' | 'webhooks';

const AnalyticsPage = () => {
  const client = useGraphClient('client');
  const [tab, setTab] = useState<Tab>('workplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workplace, setWorkplace] = useState<WorkplaceSuccessionDataQuery | null>(null);
  const [whErr, setWhErr] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<AnalyticsWebhookDeliveryLogsQuery | null>(null);

  const loadWorkplace = useCallback(async () => {
    const data = await client.request(WorkplaceSuccessionDataDocument, {
      clim: 100,
      plim: 50,
    });
    setWorkplace(data);
  }, [client]);

  const loadWebhooks = useCallback(async () => {
    setWhErr(null);
    try {
      const data = await client.request(AnalyticsWebhookDeliveryLogsDocument, { lim: 80 });
      setDeliveries(data);
    } catch (e) {
      setDeliveries(null);
      setWhErr(graphQlUserMessage(e));
    }
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadWorkplace();
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [loadWorkplace]);

  useEffect(() => {
    if (tab !== 'webhooks') return;
    void loadWebhooks();
  }, [tab, loadWebhooks]);

  return (
    <div>
      <PageHeader
        title="Insights"
        description="Workplace talent data from succession services. Webhook delivery logs appear when the API exposes them. Full analytics (workforce snapshots, curated reports, outbox admin) requires the analytics subgraph in the gateway supergraph."
      />

      <TabBar
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
          { id: 'workplace', label: 'Workplace' },
          { id: 'webhooks', label: 'Webhook deliveries' },
        ]}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card className="mb-4 border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Dashboards, scheduled reports, and transactional outbox tools are not wired through this gateway
          build yet. Use HR and ops surfaces for day-to-day flows; reconnect analytics federation when
          the subgraph is published.
        </p>
      </Card>

      {tab === 'workplace' && (
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <Card>
              <p className="text-sm text-gray-500">Loading…</p>
            </Card>
          ) : (
            <>
              <Card title="Competencies">
                {workplace?.competencies?.length ? (
                  <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
                    {workplace.competencies.map((row) => (
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
                  <p className="text-sm text-gray-500">No competencies returned.</p>
                )}
              </Card>
              <Card title="Talent pools">
                {workplace?.talentPools?.length ? (
                  <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
                    {workplace.talentPools.map((row) => (
                      <li key={row.id} className="py-3 first:pt-0">
                        <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                        {row.description ? (
                          <p className="text-xs text-gray-500">{row.description}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No talent pools returned.</p>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'webhooks' && (
        <Card title="Webhook deliveries (recent)">
          {whErr && (
            <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">{whErr}</p>
          )}
          {!whErr && !deliveries ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : deliveries?.webhookDeliveryLogs?.length ? (
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
                  {deliveries.webhookDeliveryLogs.map((row) => {
                    const resp =
                      row.responseBody && row.responseBody.length > 120
                        ? `${row.responseBody.slice(0, 120)}…`
                        : (row.responseBody ?? '—');
                    return (
                      <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="whitespace-nowrap py-2 pr-2 text-gray-500">
                          {String(row.deliveredAt)}
                        </td>
                        <td className="py-2 pr-2">{row.eventName ?? '—'}</td>
                        <td
                          className="max-w-[7rem] truncate py-2 pr-2 font-mono"
                          title={row.webhookSubscriptionId}
                        >
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
          ) : !whErr ? (
            <p className="text-sm text-gray-500">No delivery attempts logged yet.</p>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
