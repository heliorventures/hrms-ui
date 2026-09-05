import { useCallback, useEffect, useMemo, useState } from 'react';

import { type WorkplaceCompensationDataQuery } from '../../api/graphql/graphql';
import { scopeForPermission } from '../../auth/approvalScope';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  compensationSetupPageDocument,
  compensationDesignationsDocument,
} from './compensationSetup';

import type { CompensationSetupKind, CompensationSetupValues } from './compensationSetup';
import CompensationSetupModal from './CompensationSetupModal';

const CompensationPage = () => {
  const { can, clientSession } = useAuth();
  const canManage =
    can('compensation:manage') &&
    scopeForPermission(clientSession, 'compensation:manage') === 'ALL';
  const [editor, setEditor] = useState<{
    kind: CompensationSetupKind;
    initial?: CompensationSetupValues;
  } | null>(null);
  const edit = (kind: CompensationSetupKind, row: object) =>
    setEditor({
      kind,
      initial: Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
      ),
    });
  const [refresh, setRefresh] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplaceCompensationDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [designationError, setDesignationError] = useState<string | null>(null);
  const [designations, setDesignations] = useState<WorkplaceCompensationDataQuery['designations']>(
    []
  );
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const all: WorkplaceCompensationDataQuery['designations'] = [];
        for (let designationOffset = 0; ; designationOffset += 200) {
          const result = await client.request<Pick<WorkplaceCompensationDataQuery, 'designations'>>(
            compensationDesignationsDocument,
            { offset: designationOffset }
          );
          if (cancelled) return;
          all.push(...result.designations);
          if (result.designations.length < 200) break;
        }
        setDesignations(all);
      } catch (error) {
        if (!cancelled) setDesignationError(graphQlUserMessage(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const load = useCallback(async () => {
    const result = await client.request<Omit<WorkplaceCompensationDataQuery, 'designations'>>(
      compensationSetupPageDocument,
      { offset }
    );
    return { ...result, designations };
  }, [client, offset, designations]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) {
          setHasNext(r.salaryBands.length > 20 || r.compensationReviewCycles.length > 20);
          setData({
            ...r,
            salaryBands: r.salaryBands.slice(0, 20),
            compensationReviewCycles: r.compensationReviewCycles.slice(0, 20),
          });
        }
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load, refresh]);

  const desigById = useMemo(() => {
    const m = new Map<string, string>();
    (data?.designations ?? []).forEach((d) => m.set(d.id, d.title));
    return m;
  }, [data?.designations]);

  return (
    <div className="space-y-4">
      <PageHeader title="Compensation" />
      {(error || designationError) && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error || designationError}</p>
        </Card>
      )}
      <Card
        title={
          <span className="flex items-center justify-between gap-3">
            <span>Review Cycles</span>
            {canManage && (
              <Button size="sm" onClick={() => setEditor({ kind: 'cycle' })}>
                Create Review Cycle
              </Button>
            )}
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.compensationReviewCycles.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.compensationReviewCycles.map((c) => (
              <li key={c.id} className="py-3 first:pt-0">
                {canManage && c.status === 'DRAFT' && (
                  <Button
                    className="float-right"
                    variant="outline"
                    size="sm"
                    aria-label={`Edit review cycle ${c.name}`}
                    onClick={() => edit('cycle', c)}
                  >
                    Edit
                  </Button>
                )}
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
          <p className="text-sm text-gray-500">No Compensation Review Cycles.</p>
        )}
      </Card>
      <Card
        title={
          <span className="flex items-center justify-between gap-3">
            <span>Salary Bands</span>
            {canManage && (
              <Button size="sm" onClick={() => setEditor({ kind: 'band' })}>
                Create Salary Band
              </Button>
            )}
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.salaryBands.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-600">
                  <th className="py-2 pr-4">Designation</th>
                  <th className="py-2 pr-4">Grade</th>
                  <th className="py-2 pr-4">Min / mid / max</th>
                  <th className="py-2 pr-4">Year</th>
                  {canManage && <th className="py-2">Actions</th>}
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
                    {canManage && (
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Edit salary band ${desigById.get(b.designationId) ?? ''}`}
                          onClick={() => edit('band', b)}
                        >
                          Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No Salary Bands Defined.</p>
        )}
      </Card>
      <nav aria-label="Compensation pages" className="flex items-center justify-end gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={loading || offset === 0}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Previous
        </Button>
        <span className="text-sm">Page {Math.floor(offset / 20) + 1}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !hasNext}
          onClick={() => setOffset((value) => value + 20)}
        >
          Next
        </Button>
      </nav>
      {editor && canManage && (
        <CompensationSetupModal
          kind={editor.kind}
          initial={editor.initial}
          designations={data?.designations ?? []}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setRefresh((v) => v + 1);
          }}
        />
      )}
    </div>
  );
};

export default CompensationPage;
