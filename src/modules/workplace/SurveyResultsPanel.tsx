import Card from '../../components/common/Card';

import { surveyDisplayKeys } from './surveyDisplayKeys';
import type { SurveyManagementEventRow, SurveyResultsRow } from './surveyQueries';

const ResultBar = ({ label, count, total }: { label: string; count: number; total: number }) => {
  const percent = total > 0 ? Math.round((count * 100) / total) : 0;
  return (
    <li className="space-y-1">
      <div className="flex justify-between gap-3 text-sm">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0 tabular-nums">
          {count} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-selected" aria-hidden="true">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </li>
  );
};
const questionResponseLabel = (item: SurveyResultsRow['questions'][number]) => {
  if (!item.responseCount)
    return item.suppressed === false ? 'No answers yet' : 'Hidden below privacy threshold';
  const average =
    item.averageScore === null || item.averageScore === undefined
      ? ''
      : ` - average ${item.averageScore}`;
  return `${item.responseCount} responses${average}`;
};
const QuestionResult = ({ item }: { item: SurveyResultsRow['questions'][number] }) => (
  <div className="rounded-md border border-line p-3">
    <p className="font-medium">{item.prompt}</p>
    <p className="text-sm text-content-secondary">
      {questionResponseLabel(item)}
      {item.skippedCount !== null &&
        item.skippedCount !== undefined &&
        ` - ${item.skippedCount} skipped`}
    </p>
    {(item.ratingDistribution?.length ?? 0) > 0 && (
      <ul aria-label={`Rating distribution: ${item.prompt}`} className="mt-4 space-y-3">
        {item.ratingDistribution?.map((bucket) => (
          <ResultBar
            key={bucket.score}
            label={`${bucket.score} ${Number(bucket.score) === 1 ? 'star' : 'stars'}`}
            count={bucket.responseCount}
            total={item.responseCount}
          />
        ))}
      </ul>
    )}
    {item.options.length > 0 && (
      <ul aria-label={`Option counts: ${item.prompt}`} className="mt-4 space-y-3">
        {item.options.map((option) => (
          <ResultBar
            key={option.optionId}
            label={option.label}
            count={option.responseCount}
            total={item.responseCount}
          />
        ))}
      </ul>
    )}
    {item.questionType === 'MULTIPLE_CHOICE' && (
      <p className="mt-2 text-xs text-content-secondary">
        Percentages use people who answered this question. Multiple selections can total more than
        100%.
      </p>
    )}
    {item.comments.length > 0 && (
      <details className="mt-4 rounded-md bg-surface-selected p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Notes and comments ({item.comments.length})
        </summary>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          {surveyDisplayKeys(item.comments, (comment) => comment).map(({ item: comment, key }) => (
            <li key={key} className="whitespace-pre-wrap break-words">
              {comment}
            </li>
          ))}
        </ul>
      </details>
    )}
  </div>
);
export const SurveyManagementHistory = ({
  events,
  timezone,
}: {
  events: SurveyManagementEventRow[];
  timezone: string;
}) => (
  <Card title="Survey management history">
    <ul className="space-y-2">
      {surveyDisplayKeys(events, (event) => JSON.stringify(event)).map(({ item: event, key }) => (
        <li key={key} className="text-sm">
          <strong>{event.action}</strong> ·{' '}
          {new Date(event.occurredAt).toLocaleString(undefined, { timeZone: timezone })} ({timezone}
          )<p>{event.message}</p>
        </li>
      ))}
    </ul>
  </Card>
);
const SurveyResultsPanel = ({ results }: { results: SurveyResultsRow }) => (
  <Card title="Question analytics">
    {results.suppressed ? (
      <p className="text-sm text-content-secondary">
        {results.suppressionReason ||
          `Results remain hidden until at least ${results.minimumReportGroupSize} responses are available in your authorized group.`}{' '}
        Small groups or matching comments can reveal an author&apos;s identity even without names.
      </p>
    ) : (
      <>
        <p className="text-sm text-content-secondary">
          {results.respondentCount} qualifying responses. No respondent identities are available.
        </p>
        {results.dimensions.length > 0 && <h2 className="mt-4 font-semibold">Scores by area</h2>}
        {results.dimensions.length > 0 && (
          <p className="text-sm text-content-secondary">
            Area averages use configured numeric and option scores without normalization. Compare
            the question charts when rating scales differ.
          </p>
        )}
        <ul className="mt-2 grid gap-2 md:grid-cols-3">
          {results.dimensions.map((item) => (
            <li key={item.dimension} className="rounded-md bg-surface-selected p-3">
              <p className="text-sm font-medium">{item.dimension}</p>
              <p className="text-2xl font-semibold">{item.averageScore ?? 'Hidden'}</p>
            </li>
          ))}
        </ul>
        <h2 className="mt-4 font-semibold">Question results and comments</h2>
        <p className="text-sm text-content-secondary">
          Comments are not automatically anonymized. Avoid identifying authors from their wording or
          combining comments to infer who responded.
        </p>
        <div className="mt-2 space-y-3">
          {results.questions.map((item) => (
            <QuestionResult key={item.questionId} item={item} />
          ))}
        </div>
      </>
    )}
  </Card>
);
export default SurveyResultsPanel;
