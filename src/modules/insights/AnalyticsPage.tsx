import { useEffect, useRef, useState } from 'react';

import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  WorkplaceSuccessionDataDocument,
  type WorkplaceSuccessionDataQuery,
} from '../../api/graphql/graphql';

type Tab = 'workplace';
type WorkplaceRequestState =
  | { client: object; status: 'loading' }
  | { client: object; status: 'error' }
  | { client: object; status: 'success'; data: WorkplaceSuccessionDataQuery };

const AnalyticsPage = () => {
  const client = useGraphClient('client');
  const [tab, setTab] = useState<Tab>('workplace');
  const [requestState, setRequestState] = useState<WorkplaceRequestState>({
    client,
    status: 'loading',
  });
  const requestVersionRef = useRef(0);
  const visibleState: WorkplaceRequestState =
    requestState.client === client ? requestState : { client, status: 'loading' };

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;
    let active = true;

    setRequestState({ client, status: 'loading' });
    void client
      .request(WorkplaceSuccessionDataDocument, { clim: 100, plim: 50 })
      .then((data) => {
        if (!active || requestVersion !== requestVersionRef.current) return;
        setRequestState({ client, status: 'success', data });
      })
      .catch(() => {
        if (!active || requestVersion !== requestVersionRef.current) return;
        setRequestState({ client, status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [client]);

  return (
    <div>
      <PageHeader
        title="Insights"
        description="Review workplace competencies and talent pools used for succession planning."
      />

      <Tabs
        value={tab}
        onValueChange={(id) => setTab(id as Tab)}
        tabs={[{ id: 'workplace', label: 'Workplace', panelId: 'analytics-tab-workplace' }]}
      />

      <section
        id="analytics-tab-workplace"
        role="tabpanel"
        aria-labelledby="analytics-tab-workplace-tab"
        aria-busy={visibleState.status === 'loading'}
        className="grid gap-4 md:grid-cols-2"
      >
        {visibleState.status === 'loading' ? (
          <Card>
            <p
              role="status"
              aria-label="Loading workplace insights…"
              className="text-sm text-gray-500"
            >
              Loading workplace insights…
            </p>
          </Card>
        ) : visibleState.status === 'error' ? (
          <Card>
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              Workplace insights could not be loaded. Try again.
            </p>
          </Card>
        ) : (
          <>
            <Card title="Competencies">
              {visibleState.data.competencies?.length ? (
                <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
                  {visibleState.data.competencies.map((row) => (
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
                <p className="text-sm text-gray-500">No competencies are available yet.</p>
              )}
            </Card>
            <Card title="Talent Pools">
              {visibleState.data.talentPools?.length ? (
                <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
                  {visibleState.data.talentPools.map((row) => (
                    <li key={row.id} className="py-3 first:pt-0">
                      <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                      {row.description ? (
                        <p className="text-xs text-gray-500">{row.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No talent pools are available yet.</p>
              )}
            </Card>
          </>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;
