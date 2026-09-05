import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { EnrollInBenefitPlanDocument } from '../../api/graphql/graphql';

import { gql } from 'graphql-request';
import { useAuth } from '../../contexts/AuthContext';
import { scopeForPermission } from '../../auth/approvalScope';
import {
  SetupModal,
  SaveBenefitType,
  SaveBenefitPlan,
  benefitTypeFields,
  BenefitTypeOptionsDocument,
  loadBenefitTypeOptions,
  type SetupEditor,
} from './benefitsSetup';
const WorkplaceBenefitsDocument = gql`
  query BenefitsSetup($activeOnly: Boolean!, $typeOffset: Int!, $planOffset: Int!) {
    benefitTypes(limit: 21, offset: $typeOffset) {
      id
      name
      code
      category
    }
    benefitPlans(limit: 21, offset: $planOffset, activeOnly: $activeOnly) {
      id
      name
      benefitTypeId
      employerContribution
      employeeContribution
      contributionType
      isMandatory
      isActive
    }
  }
`;
const MyBenefitEnrollmentsDocument = gql`
  query BenefitsSetupEnrollments($limit: Int!) {
    myBenefitEnrollments(limit: $limit) {
      id
      benefitPlanId
      benefitPlanName
      status
      enrolledOn
      effectiveFrom
      employeeContributionAmount
      employerContributionAmount
    }
  }
`;
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
  const { can, clientSession } = useAuth();
  const canManage =
    can('benefits:manage') && scopeForPermission(clientSession, 'benefits:manage') === 'ALL';
  const canEnroll =
    Boolean(clientSession?.employeeId) && (can('benefits:self') || can('benefits:manage'));
  const [typeOffset, setTypeOffset] = useState(0);
  const [planOffset, setPlanOffset] = useState(0);
  const currentPage = useRef('');
  currentPage.current = `${typeOffset}:${planOffset}:${canManage}:${canEnroll}`;
  const [preparingPlan, setPreparingPlan] = useState(false);
  const [editor, setEditor] = useState<SetupEditor | null>(null);
  const editType = (type?: BenefitsHead['benefitTypes'][number]) =>
    setEditor({
      title: type ? 'Edit benefit type' : 'Create benefit type',
      id: type?.id,
      mutation: SaveBenefitType,
      fields: benefitTypeFields,
      values: { name: type?.name ?? '', code: type?.code ?? '', category: type?.category ?? '' },
    });
  const editPlan = async (plan?: BenefitsHead['benefitPlans'][number]) => {
    setPreparingPlan(true);
    setError(null);
    try {
      const options = await loadBenefitTypeOptions(async (offset) => {
        const result = await client.request<{ benefitTypes: { id: string; name: string }[] }>(
          BenefitTypeOptionsDocument,
          { offset }
        );
        return result.benefitTypes;
      });
      setEditor({
        title: plan ? 'Edit benefit plan' : 'Create benefit plan',
        id: plan?.id,
        mutation: SaveBenefitPlan,
        fields: [
          { name: 'name', label: 'Name', required: true, maxLength: 255 },
          {
            name: 'benefitTypeId',
            label: 'Benefit type',
            required: true,
            options,
          },
          {
            name: 'employerContribution',
            label: 'Employer contribution',
            type: 'number',
            step: '0.0001',
          },
          {
            name: 'employeeContribution',
            label: 'Employee contribution',
            type: 'number',
            step: '0.0001',
          },
          { name: 'contributionType', label: 'Contribution type', maxLength: 50 },
          { name: 'isMandatory', label: 'Mandatory', type: 'checkbox' },
          { name: 'isActive', label: 'Active', type: 'checkbox' },
        ],
        values: {
          name: plan?.name ?? '',
          benefitTypeId: plan?.benefitTypeId ?? '',
          employerContribution: plan?.employerContribution ?? '',
          employeeContribution: plan?.employeeContribution ?? '',
          contributionType: plan?.contributionType ?? '',
          isMandatory: plan?.isMandatory ?? false,
          isActive: plan?.isActive ?? true,
        },
      });
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setPreparingPlan(false);
    }
  };
  const [data, setData] = useState<BenefitsHead | null>(null);
  const [enrollments, setEnrollments] = useState<
    {
      id: string;
      benefitPlanId: string;
      benefitPlanName?: string | null;
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
      client.request<BenefitsHead>(WorkplaceBenefitsDocument, {
        activeOnly: !canManage,
        typeOffset,
        planOffset,
      }),
      canEnroll
        ? client.request<{ myBenefitEnrollments: typeof enrollments }>(
            MyBenefitEnrollmentsDocument,
            { limit: 50 }
          )
        : Promise.resolve({ myBenefitEnrollments: [] }),
    ]);
    return { data: b, enrollments: e.myBenefitEnrollments ?? [] };
  }, [client, canManage, canEnroll, typeOffset, planOffset]);

  const refresh = async () => {
    const page = `${typeOffset}:${planOffset}:${canManage}:${canEnroll}`;
    const result = await load();
    if (currentPage.current !== page) return;
    setData(result.data);
    setEnrollments(result.enrollments);
  };

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await load();
        if (!c) {
          setData(result.data);
          setEnrollments(result.enrollments);
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
  }, [load]);

  const enrollIn = async (benefitPlanId: string) => {
    setEnrollBusyId(benefitPlanId);
    setError(null);
    try {
      await client.request(EnrollInBenefitPlanDocument, { benefitPlanId });
      await refresh();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setEnrollBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benefits</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {canEnroll && (
        <Card title="My Enrollments">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : enrollments.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {enrollments.map((row) => {
                const planTitle =
                  row.benefitPlanName ?? planNameById.get(row.benefitPlanId) ?? 'Benefit plan';
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
                        {row.employerContributionAmount && row.employeeContributionAmount
                          ? ' · '
                          : ''}
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
      )}
      {canManage && (
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            onClick={() => editType()}
          >
            Create benefit type
          </button>
          <button
            disabled={preparingPlan || loading}
            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 disabled:opacity-50 dark:text-indigo-300"
            onClick={() => void editPlan()}
          >
            {preparingPlan ? 'Loading benefit types...' : 'Create benefit plan'}
          </button>
        </div>
      )}
      {editor && canManage && (
        <SetupModal editor={editor} onClose={() => setEditor(null)} onSaved={refresh} />
      )}
      <Card title="Benefit Types">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.benefitTypes?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.benefitTypes.slice(0, 20).map((t) => (
              <li key={t.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                {canManage && (
                  <button
                    className="text-sm font-medium text-indigo-600"
                    onClick={() => editType(t)}
                  >
                    Edit
                  </button>
                )}
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
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous benefit types"
            disabled={loading || typeOffset === 0}
            onClick={() => setTypeOffset((offset) => Math.max(0, offset - 20))}
          >
            Previous
          </Button>
          <span className="text-sm text-content-muted">Page {typeOffset / 20 + 1}</span>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next benefit types"
            disabled={loading || (data?.benefitTypes.length ?? 0) <= 20}
            onClick={() => setTypeOffset((offset) => offset + 20)}
          >
            Next
          </Button>
        </div>
      </Card>
      <Card title={canManage ? 'Benefit Plans' : 'Active Plans'}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.benefitPlans?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.benefitPlans.slice(0, 20).map((p) => {
              const enrolled = enrolledPlanIds.has(p.id);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                    {canManage && (
                      <button
                        className="text-sm font-medium text-indigo-600"
                        disabled={preparingPlan}
                        onClick={() => void editPlan(p)}
                      >
                        Edit
                      </button>
                    )}
                    {!p.isActive && <span className="ml-2 text-xs text-gray-500">Inactive</span>}
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
                  {canEnroll && !enrolled && p.isActive ? (
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
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous benefit plans"
            disabled={loading || planOffset === 0}
            onClick={() => setPlanOffset((offset) => Math.max(0, offset - 20))}
          >
            Previous
          </Button>
          <span className="text-sm text-content-muted">Page {planOffset / 20 + 1}</span>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next benefit plans"
            disabled={loading || (data?.benefitPlans.length ?? 0) <= 20}
            onClick={() => setPlanOffset((offset) => offset + 20)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BenefitsPage;
