import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  WorkplaceCompensationDataDocument,
  type WorkplaceCompensationDataQuery,
} from '../../api/graphql/graphql';

const CompensationPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplaceCompensationDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceCompensationDataDocument, { blim: 100, clim: 20, dlim: 200 });
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
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load compensation data');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const desigById = useMemo(() => {
    const m = new Map<string, string>();
    (data?.designations ?? []).forEach((d) => m.set(d.id, d.title));
    return m;
  }, [data?.designations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compensation"
        description="Review cycles, salary bands, and structure aligned to your organization’s comp philosophy."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Review cycles">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.compensationReviewCycles?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.compensationReviewCycles.map((c) => (
              <li key={c.id} className="py-3 first:pt-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {c.name} <span className="text-sm font-normal text-gray-500">({c.year})</span>
                </p>
                <p className="text-xs text-gray-500">
                  {c.startDate} → {c.endDate} · {c.status}
                  {c.budgetPercentage != null && c.budgetPercentage !== ''
                    ? ` · budget ${c.budgetPercentage}%`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No compensation review cycles.</p>
        )}
      </Card>
      <Card title="Salary bands">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.salaryBands?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-600">
                  <th className="py-2 pr-4">Designation</th>
                  <th className="py-2 pr-4">Grade</th>
                  <th className="py-2 pr-4">Min / mid / max</th>
                  <th className="py-2 pr-4">Year</th>
                </tr>
              </thead>
              <tbody>
                {data.salaryBands.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">
                      {desigById.get(b.designationId) ?? b.designationId}
                    </td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{b.grade ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">
                      {[b.minSalary, b.midSalary, b.maxSalary].filter(Boolean).join(' · ') || '—'}
                      {b.currency ? ` ${b.currency}` : ''}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{b.effectiveYear ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No salary bands defined.</p>
        )}
      </Card>
    </div>
  );
};

export default CompensationPage;
