import Card from '../../components/common/Card';

import { surveyDisplayKeys } from './surveyDisplayKeys';
import type { SurveyManagementEventRow, SurveyResultsRow } from './surveyQueries';

const QuestionResult = ({ item }: { item: SurveyResultsRow['questions'][number] }) => (
  <div className="rounded-md border border-line p-3">
    <p className="font-medium">{item.prompt}</p>
    <p className="text-sm text-content-secondary">
      {item.responseCount
        ? `${item.responseCount} responses${item.averageScore ? ` · average ${item.averageScore}` : ''}`
        : 'Hidden below privacy threshold'}
    </p>
    {item.options.length > 0 && (
      <ul className="mt-2 text-sm">
        {item.options.map((option) => (
          <li key={option.optionId}>
            {option.label}: {option.responseCount}
          </li>
        ))}
      </ul>
    )}
    {item.comments.length > 0 && (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {surveyDisplayKeys(item.comments, (comment) => comment).map(({ item: comment, key }) => (
          <li key={key}>{comment}</li>
        ))}
      </ul>
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
  <Card title="Aggregate survey results">
    {results.suppressed ? (
      <p className="text-sm text-content-secondary">
        Results remain hidden until at least {results.minimumReportGroupSize} responses are
        available in your authorized group.
      </p>
    ) : (
      <>
        <p className="text-sm text-content-secondary">
          {results.respondentCount} qualifying responses. No respondent identities are available.
        </p>
        <h2 className="mt-4 font-semibold">Scores by area</h2>
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
