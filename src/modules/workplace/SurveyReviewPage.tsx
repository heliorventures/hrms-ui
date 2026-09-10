import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';

import { surveyDisplayKeys } from './surveyDisplayKeys';
import type { SurveySubmissionsRow } from './surveyQueries';
import SurveyResultsPanel from './SurveyResultsPanel';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

type SubmissionAnswer = SurveySubmissionsRow['nodes'][number]['answers'][number];
const hasAnswer = (answer: SubmissionAnswer) =>
  (answer.numericAnswer !== null && answer.numericAnswer !== undefined) ||
  Boolean(answer.textAnswer?.trim()) ||
  answer.selectedOptions.length > 0;

const SubmissionList = ({ model }: { model: SurveyWorkspaceModel }) => {
  const { submissions, selectedSurveyId, submissionOffset } = model;
  const load = (offset: number) => {
    if (selectedSurveyId) void model.openSubmissions(selectedSurveyId, offset);
  };
  if (!submissions)
    return model.submissionsFailed ? (
      <Button variant="outline" onClick={() => load(submissionOffset)}>
        Retry submissions
      </Button>
    ) : (
      <p role="status">Loading submissions…</p>
    );
  if (!submissions.available)
    return (
      <Card title="Individual submissions">
        <p className="text-sm text-content-secondary">
          {submissions.reason ||
            'Individual review is available after closing surveys that disclosed unnamed submission review before publication.'}
        </p>
      </Card>
    );
  return (
    <div className="space-y-4">
      <p className="text-sm text-content-secondary">
        {submissions.totalCount ?? 0} unnamed submissions. Numbers identify entries in this report,
        not employees. Comments may contain identifying information supplied by their authors.
      </p>
      {submissions.nodes.length === 0 && <p>No submissions to display.</p>}
      {submissions.nodes.map((submission) => (
        <details key={submission.number} className="rounded-lg border border-line bg-surface p-4">
          <summary className="cursor-pointer font-medium">
            Submission {submission.number}{' '}
            <span className="text-sm font-normal text-content-secondary">
              · {submission.answers.filter(hasAnswer).length} answered questions
            </span>
          </summary>
          <dl className="mt-4 space-y-4">
            {submission.answers.map((answer) => (
              <div key={answer.questionId} className="border-t border-line pt-3">
                <dt className="font-medium">{answer.prompt}</dt>
                <dd className="mt-1 space-y-2 text-sm">
                  {!hasAnswer(answer) && <p className="text-content-secondary">Not answered</p>}
                  {answer.numericAnswer !== null && answer.numericAnswer !== undefined && (
                    <p>
                      Rating: <strong>{answer.numericAnswer}</strong>
                    </p>
                  )}
                  {answer.selectedOptions.length > 0 && (
                    <ul className="list-disc pl-5">
                      {surveyDisplayKeys(answer.selectedOptions, (value) => value).map(
                        ({ item, key }) => (
                          <li key={key}>{item}</li>
                        )
                      )}
                    </ul>
                  )}
                  {answer.textAnswer && (
                    <p className="whitespace-pre-wrap break-words">{answer.textAnswer}</p>
                  )}
                  {answer.comment && (
                    <p className="whitespace-pre-wrap break-words rounded-md bg-surface-selected p-3">
                      <span className="font-medium">Comment: </span>
                      {answer.comment}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={submissionOffset === 0}
          onClick={() => load(Math.max(0, submissionOffset - 20))}
        >
          Previous submissions
        </Button>
        <span className="text-sm text-content-secondary">
          Page {Math.floor(submissionOffset / 20) + 1}
        </span>
        <Button
          variant="outline"
          disabled={!submissions.hasMore}
          onClick={() => load(submissionOffset + 20)}
        >
          Next submissions
        </Button>
      </div>
    </div>
  );
};

const AnalyticsView = ({ model }: { model: SurveyWorkspaceModel }) => {
  if (model.results) return <SurveyResultsPanel results={model.results} />;
  if (model.resultsFailed)
    return (
      <Button
        variant="outline"
        onClick={() => {
          if (model.selectedSurveyId) void model.openResults(model.selectedSurveyId);
        }}
      >
        Retry results
      </Button>
    );
  return <p role="status">Loading results...</p>;
};

const SurveyReviewPage = ({ model }: { model: SurveyWorkspaceModel }) => {
  const [tab, setTab] = useState('analytics');
  const summary = [...model.adminSurveys, ...model.resultsCatalog].find(
    (item) => item.id === model.selectedSurveyId
  );
  const tabs = [
    { id: 'analytics', label: 'Question analytics', panelId: 'survey-analytics' },
    ...(model.canReviewSubmissions
      ? [{ id: 'submissions', label: 'Individual submissions', panelId: 'survey-submissions' }]
      : []),
  ];
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  return (
    <div className="space-y-4">
      {summary && <h2 className="text-lg font-semibold">{summary.title}</h2>}
      <Tabs
        tabs={tabs}
        value={tab}
        onValueChange={(next) => {
          setTab(next);
          if (next === 'submissions' && !model.submissions && model.selectedSurveyId)
            void model.openSubmissions(model.selectedSurveyId);
        }}
      />
      <section role="tabpanel" id={active.panelId} aria-labelledby={`${active.panelId}-tab`}>
        {tab === 'analytics' ? <AnalyticsView model={model} /> : <SubmissionList model={model} />}
      </section>
    </div>
  );
};
export default SurveyReviewPage;
