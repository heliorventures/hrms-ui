import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { canFillSurvey, surveyAvailabilityLabel } from './surveyAvailability';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

export const SurveyRespondentCatalog = ({ model }: { model: SurveyWorkspaceModel }) => (
  <Card title="My surveys">
    {model.available.length === 0 ? (
      <p className="text-sm text-content-secondary">No surveys assigned.</p>
    ) : (
      <ul className="divide-y divide-line">
        {model.available.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-content-secondary">
                {item.completed ? 'Submitted' : surveyAvailabilityLabel(item)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              busy={model.isBusy(`open:${item.id}`)}
              disabled={!canFillSurvey(item)}
              onClick={() => void model.openSurvey(item.id, 'respond')}
            >
              {item.completed ? 'Completed' : 'Fill survey'}
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
export const SurveyReportCatalog = ({ model }: { model: SurveyWorkspaceModel }) => (
  <Card title="Survey reports">
    {model.resultsCatalog.length === 0 ? (
      <p className="text-sm text-content-secondary">No published survey results are available.</p>
    ) : (
      <ul className="divide-y divide-line">
        {model.resultsCatalog.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-content-secondary">
                {surveyAvailabilityLabel(item)} · privacy threshold {item.minimumReportGroupSize}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void model.openResults(item.id)}>
              Aggregate results
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
