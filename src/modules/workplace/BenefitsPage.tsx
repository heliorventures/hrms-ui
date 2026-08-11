import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  WorkplaceBenefitsDocument,
  MyBenefitEnrollmentsDocument,
  EnrollInBenefitPlanDocument,
} from '../../api/graphql/graphql';

type BenefitsHead = {
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
};

const BenefitsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<BenefitsHead | null>(null);
  const [enrollments, setEnrollments] = useState<
    {
      id: string;
      benefitPlanId: string;
      status: string;
      enrolledOn?: string | null;
      effectiveFrom: string;
      employeeContributionAmount?: string | null;
      employerContributionAmount?: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollBusyId, setEnrollBusyId] = useState<string | null>(null);

  const enrolledPlanIds = useMemo(
    () => new Set(enrollments.map((e) => e.benefitPlanId)),
    [enrollments]
  );

  const planNameById = useMemo(() => {
    const m = new Map<string, string>();
    data?.benefitPlans.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [data?.benefitPlans]);

  const benefitCategoryLabel = useMemo(() => {
    const m = new Map<string, string>();
    const types = data?.benefitTypes ?? [];
    data?.benefitPlans.forEach((p) => {
      const tn = types.find((t) => t.id === p.benefitTypeId)?.name;
      if (tn) m.set(p.id, tn);
    });
    return m;
  }, [data?.benefitPlans, data?.benefitTypes]);

  const load = useCallback(async () => {
    const [b, e] = await Promise.all([
      client.request(WorkplaceBenefitsDocument, { tlim: 50, plim: 50 }),
      client.request(MyBenefitEnrollmentsDocument, { limit: 50 }),
    ]);
    setData({
      benefitTypes: b.benefitTypes,
      benefitPlans: b.benefitPlans,
    });
    setEnrollments(e.myBenefitEnrollments ?? []);
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const enrollIn = async (benefitPlanId: string) => {
    setEnrollBusyId(benefitPlanId);
    setError(null);
    try {
      await client.request(EnrollInBenefitPlanDocument, { benefitPlanId });
      await load();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setEnrollBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benefits</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="My Enrollments">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : enrollments.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {enrollments.map((row) => {
              const planTitle =
                planNameById.get(row.benefitPlanId) ?? `Plan ${row.benefitPlanId.slice(0, 8)}…`;
              const cat = benefitCategoryLabel.get(row.benefitPlanId);
              return (
              <li key={row.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{planTitle}</p>
                {cat ? (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">{cat}</p>
                ) : null}
                <p className="text-xs text-gray-500">
                  {row.status}
                  {' · '}effective {String(row.effectiveFrom)}
                  {row.enrolledOn ? ` · enrolled ${String(row.enrolledOn)}` : ''}
                </p>
                {(row.employerContributionAmount || row.employeeContributionAmount) && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    {row.employerContributionAmount
                      ? `Employer ${row.employerContributionAmount}`
                      : ''}
                    {row.employerContributionAmount && row.employeeContributionAmount ? ' · ' : ''}
                    {row.employeeContributionAmount
                      ? `Employee ${row.employeeContributionAmount}`
                      : ''}
                  </p>
                )}
              </li>
            );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Enrollments Yet - Pick A Plan Below.</p>
        )}
      </Card>
      <Card title="Benefit Types">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
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
          <p className="text-sm text-gray-500">No Benefit Types Configured.</p>
        )}
      </Card>
      <Card title="Active Plans">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.benefitPlans?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.benefitPlans.map((p) => {
              const enrolled = enrolledPlanIds.has(p.id);
              return (
                <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.isMandatory ? 'Mandatory' : 'Optional'}
                      {p.contributionType ? ` · ${p.contributionType}` : ''}
                      {enrolled ? (
                        <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                          enrolled
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {!enrolled ? (
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-50 disabled:opacity-60 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
                      disabled={enrollBusyId === p.id}
                      onClick={() => void enrollIn(p.id)}
                    >
                      {enrollBusyId === p.id ? 'Enrolling…' : 'Enroll'}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Active Plans.</p>
        )}
      </Card>
    </div>
  );
};

export default BenefitsPage;
