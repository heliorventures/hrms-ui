import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { WorkplaceRecruitmentDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

const RecruitmentPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<{
    jobPostings: {
      id: string;
      title: string;
      status: string;
      vacancies: number;
      employmentType?: string | null;
      openDate?: string | null;
      closeDate?: string | null;
    }[];
    applications: {
      id: string;
      jobId: string;
      candidateName: string;
      candidateEmail: string;
      status: string;
      appliedAt: string;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceRecruitmentDocument, { jlim: 30, alim: 50 });
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
        if (!c) setError(graphQlUserMessage(e));
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Job postings">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.jobPostings?.length ? (
          <ul className="space-y-3">
            {data.jobPostings.map((j) => (
              <li
                key={j.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{j.title}</p>
                  <Badge variant="neutral">{j.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Vacancies: {j.vacancies}
                  {j.employmentType ? ` · ${j.employmentType}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No job postings.</p>
        )}
      </Card>
      <Card title="Applications">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.applications?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.applications.map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{a.candidateName}</p>
                <p className="text-xs text-gray-500">{a.candidateEmail}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {a.status} · {new Date(a.appliedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No applications.</p>
        )}
      </Card>
    </div>
  );
};

export default RecruitmentPage;
