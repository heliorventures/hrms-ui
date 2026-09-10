import { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { scopeForPermission } from '../../auth/approvalScope';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { usePageTabs } from '../../hooks/usePageTabs';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { SetupModal, type SetupEditor } from './benefitsSetup';
import { SaveJobPosting, validateJobPosting } from './recruitmentSetup';

const WorkplaceRecruitmentDocument = gql`
  query RecruitmentSetup($jlim: Int!, $alim: Int!, $jobOffset: Int!) {
    jobPostings(limit: $jlim, offset: $jobOffset) {
      id
      title
      description
      status
      vacancies
      employmentType
      openDate
      closeDate
    }
    applications(limit: $alim) {
      id
      jobId
      candidateName
      candidateEmail
      status
      appliedAt
    }
  }
`;

const RecruitmentPage = () => {
  const tabs = [
    { id: 'jobs', label: 'Job Openings' },
    { id: 'applicants', label: 'Applicants' },
  ];
  const { tab, setTab } = usePageTabs(tabs);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('job') ?? '';
  const showApplicants = (jobId: string) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('tab', 'applicants');
        if (jobId) next.set('job', jobId);
        else next.delete('job');
        return next;
      },
      { preventScrollReset: true }
    );
  const client = useGraphClient('client');
  const { can, clientSession } = useAuth();
  const canManage =
    can('recruitment:manage') && scopeForPermission(clientSession, 'recruitment:manage') === 'ALL';
  const [jobOffset, setJobOffset] = useState(0);
  const [editor, setEditor] = useState<SetupEditor | null>(null);
  const editJob = (job?: NonNullable<typeof data>['jobPostings'][number]) =>
    setEditor({
      title: job ? 'Edit job opening' : 'Create job opening',
      id: job?.id,
      mutation: SaveJobPosting,
      fields: [
        { name: 'title', label: 'Job title', required: true, maxLength: 500 },
        { name: 'description', label: 'Description', type: 'textarea', maxLength: 20000 },
        { name: 'employmentType', label: 'Employment type', maxLength: 50 },
        { name: 'vacancies', label: 'Vacancies', type: 'number', required: true, step: '1' },
        {
          name: 'status',
          label: 'Status',
          required: true,
          options: ['DRAFT', 'OPEN', 'ON_HOLD', 'CLOSED'].map((value) => ({
            value,
            label: value.replace('_', ' '),
          })),
        },
        { name: 'openDate', label: 'Open date', type: 'date' },
        { name: 'closeDate', label: 'Close date', type: 'date' },
      ],
      values: {
        title: job?.title ?? '',
        description: job?.description ?? '',
        employmentType: job?.employmentType ?? '',
        vacancies: job?.vacancies ?? 1,
        status: job?.status ?? 'DRAFT',
        openDate: job?.openDate ?? '',
        closeDate: job?.closeDate ?? '',
      },
      validate: (values) =>
        validateJobPosting({
          title: String(values.title ?? ''),
          vacancies: Number(values.vacancies),
          openDate: String(values.openDate ?? ''),
          closeDate: String(values.closeDate ?? ''),
        }),
    });
  const [data, setData] = useState<{
    jobPostings: {
      id: string;
      title: string;
      description?: string | null;
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
    return client.request<NonNullable<typeof data>>(WorkplaceRecruitmentDocument, {
      jlim: 21,
      jobOffset,
      alim: 50,
    });
  }, [client, jobOffset]);

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

  const applicants = (data?.applications ?? []).filter(
    (applicant) => !selectedJobId || applicant.jobId === selectedJobId
  );
  const selectedJob = data?.jobPostings.find((job) => job.id === selectedJobId);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Hiring</h1>
      <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {canManage && tab === 'jobs' && (
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => editJob()}
        >
          Create job opening
        </button>
      )}
      {editor && canManage && (
        <SetupModal
          editor={editor}
          onClose={() => setEditor(null)}
          onSaved={async () => {
            setData(await load());
          }}
        />
      )}
      <PageTabPanel id="jobs" activeTab={tab}>
        <Card title="Job Openings">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : data?.jobPostings.length ? (
            <ul className="space-y-3">
              {data.jobPostings.slice(0, 20).map((j) => (
                <li
                  key={j.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{j.title}</p>
                    <Badge variant="neutral">{j.status}</Badge>
                    {canManage && (
                      <button
                        className="text-sm font-medium text-indigo-600"
                        onClick={() => editJob(j)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    aria-label={`View applicants for ${j.title}`}
                    onClick={() => showApplicants(j.id)}
                  >
                    View applicants
                  </Button>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Vacancies: {j.vacancies}
                    {j.employmentType ? ` · ${j.employmentType}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No job openings yet.</p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous job postings"
              disabled={loading || jobOffset === 0}
              onClick={() => setJobOffset((offset) => Math.max(0, offset - 20))}
            >
              Previous
            </Button>
            <span className="text-sm text-content-muted">Page {jobOffset / 20 + 1}</span>
            <Button
              variant="outline"
              size="sm"
              aria-label="Next job postings"
              disabled={loading || (data?.jobPostings.length ?? 0) <= 20}
              onClick={() => setJobOffset((offset) => offset + 20)}
            >
              Next
            </Button>
          </div>
        </Card>
      </PageTabPanel>
      <PageTabPanel id="applicants" activeTab={tab}>
        <Card title="Applicants">
          {selectedJobId ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                Applicants for {selectedJob?.title ?? 'the selected job opening'}
              </p>
              <Button variant="outline" size="sm" onClick={() => showApplicants('')}>
                Show all applicants
              </Button>
            </div>
          ) : null}
          <p className="mb-3 text-xs text-content-muted">
            Showing up to 50 recent applications{selectedJobId ? ', filtered by job opening' : ''}.
          </p>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : applicants.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {applicants.map((a) => (
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
            <p className="text-sm text-gray-500">No recent applicants match this view.</p>
          )}
        </Card>
      </PageTabPanel>
    </div>
  );
};

export default RecruitmentPage;
