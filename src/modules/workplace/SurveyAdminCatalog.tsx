import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

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
        {surveyAvailabilityLabel(item)} · reporting threshold {item.minimumReportGroupSize}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={model.isBusy('save-survey') || model.isBusy('load-draft')}
        onClick={() => void model.editSurvey(item.id, item.status !== 'DRAFT')}
      >
        {item.status === 'DRAFT' ? 'Edit draft' : 'Copy as new draft'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => void model.openSurvey(item.id, 'admin')}>
        View
      </Button>
      <Button size="sm" variant="quiet" onClick={() => void model.openHistory(item.id)}>
        Management history
      </Button>
      <SurveyLifecycleActions item={item} model={model} />
      {model.canResults && item.status !== 'DRAFT' && (
        <Button size="sm" variant="quiet" onClick={() => void model.openResults(item.id)}>
          Aggregate results
        </Button>
      )}
    </div>
  </li>
);
const SurveyAdminCatalog = ({ model }: { model: SurveyWorkspaceModel }) => (
  <Card title="Survey administration">
    {model.adminSurveys.length === 0 ? (
      <p className="text-sm text-content-secondary">No surveys created.</p>
    ) : (
      <ul className="divide-y divide-line">
        {model.adminSurveys.map((item) => (
          <SurveyAdminRow key={item.id} item={item} model={model} />
        ))}
      </ul>
    )}
  </Card>
);
export default SurveyAdminCatalog;
