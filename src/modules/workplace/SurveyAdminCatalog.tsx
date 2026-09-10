import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

import { surveyAvailabilityLabel } from './surveyAvailability';
import type { SurveySummaryRow } from './surveyQueries';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

const OpenSurveyAction = ({
  item,
  model,
}: {
  item: SurveySummaryRow;
  model: SurveyWorkspaceModel;
}) => {
  const [confirming, setConfirming] = useState(false);
  const busy = model.isBusy(`open-now:${item.id}`);
  if (!confirming)
    return (
      <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
        Open now
      </Button>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-content-secondary">
        Open this survey immediately for its already assigned audience?
      </p>
      <Button size="sm" busy={busy} onClick={() => void model.transition(item.id, 'open-now')}>
        Confirm open now
      </Button>
      <Button size="sm" variant="quiet" disabled={busy} onClick={() => setConfirming(false)}>
        Cancel opening
      </Button>
    </div>
  );
};
const SurveyLifecycleActions = ({
  item,
  model,
}: {
  item: SurveySummaryRow;
  model: SurveyWorkspaceModel;
}) => (
  <>
    {item.status === 'DRAFT' && (
      <Button
        size="sm"
        disabled={
          model.draft.id === item.id || model.isBusy('save-survey') || model.isBusy('load-draft')
        }
        busy={model.isBusy(`publish:${item.id}`)}
        onClick={() => void model.transition(item.id, 'publish')}
      >
        Publish
      </Button>
    )}
    {surveyAvailabilityLabel(item) === 'Scheduled' && (
      <OpenSurveyAction item={item} model={model} />
    )}
    {item.status === 'PUBLISHED' && (
      <Button
        size="sm"
        variant="outline"
        busy={model.isBusy(`close:${item.id}`)}
        onClick={() => void model.transition(item.id, 'close')}
      >
        Close
      </Button>
    )}
  </>
);
const SurveyAdminRow = ({
  item,
  model,
}: {
  item: SurveySummaryRow;
  model: SurveyWorkspaceModel;
}) => (
  <li className="flex flex-wrap items-center justify-between gap-3 py-3">
    <div>
      <p className="font-medium">{item.title}</p>
      <p className="text-xs text-content-secondary">
        {surveyAvailabilityLabel(item)} ·{' '}
        {item.responseReviewMode === 'ANONYMOUS_SUBMISSIONS'
          ? 'Unnamed submission review'
          : 'Aggregate reporting'}
      </p>
      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {(
          [
            ['Assigned', item.assignedCount],
            ['Completed', item.completedCount],
            ['Pending', item.pendingCount],
          ] as const
        ).map(([label, count]) => (
          <div key={label} className="flex gap-1.5">
            <dt className="text-content-secondary">{label}</dt>
            <dd className="font-semibold tabular-nums">{count ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={model.isBusy('save-survey') || model.isBusy('load-draft')}
        onClick={() => void model.editSurvey(item.id, item.status !== 'DRAFT')}
      >
        {item.status === 'DRAFT' ? 'Edit' : 'Copy as new'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => void model.openSurvey(item.id, 'admin')}>
        View
      </Button>
      <Button size="sm" variant="quiet" onClick={() => void model.openHistory(item.id)}>
        History
      </Button>
      <SurveyLifecycleActions item={item} model={model} />
      {model.canResults && item.status !== 'DRAFT' && (
        <Button size="sm" variant="quiet" onClick={() => void model.openResults(item.id)}>
          Responses
        </Button>
      )}
    </div>
  </li>
);
const SurveyAdminCatalog = ({ model }: { model: SurveyWorkspaceModel }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const visible = model.adminSurveys.filter(
    (item) =>
      item.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (status === 'ALL' || item.status === status)
  );
  return (
    <Card title="Created surveys">
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="flex-1 text-sm">
          Search surveys
          <input
            className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            className="mt-1 block min-h-11 rounded-md border border-line bg-surface px-3"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={model.adminSurveys.length ? 'No matching surveys' : 'No surveys created yet'}
          description={
            model.adminSurveys.length
              ? 'Try another title or status.'
              : 'Choose Add survey to start with a blank questionnaire or copy a previous one.'
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((item) => (
            <SurveyAdminRow key={item.id} item={item} model={model} />
          ))}
        </ul>
      )}
    </Card>
  );
};
export default SurveyAdminCatalog;
