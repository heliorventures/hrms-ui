import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { WorkplaceBenefitsDocument } from '../../api/graphql/graphql';

const BenefitsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<{
    benefitTypes: { id: string; name: string; code: string; category?: string | null }[];
    benefitPlans: {
      id: string;
      name: string;
      benefitTypeId: string;
      employerContribution?: string | null;
      employeeContribution?: string | null;
      contributionType?: string | null;
      isMandatory: boolean;
      isActive: boolean;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceBenefitsDocument, { tlim: 50, plim: 50 });
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
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load benefits');
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benefits</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Benefit types">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.benefitTypes?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.benefitTypes.map((t) => (
              <li key={t.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-500">
                  {t.code}
                  {t.category ? ` · ${t.category}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No benefit types configured.</p>
        )}
      </Card>
      <Card title="Active plans">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.benefitPlans?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.benefitPlans.map((p) => (
              <li key={p.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.isMandatory ? 'Mandatory' : 'Optional'}
                  {p.contributionType ? ` · ${p.contributionType}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No active plans.</p>
        )}
      </Card>
    </div>
  );
};

export default BenefitsPage;
