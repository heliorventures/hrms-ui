import PageInformation from '../../components/common/PageInformation';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

import SurveyAdminCatalog from './SurveyAdminCatalog';
import { SurveyReportCatalog, SurveyRespondentCatalog } from './SurveyCatalogs';
import SurveyEditor from './SurveyEditor';
import SurveyResponsePanel from './SurveyResponsePanel';
import SurveyResultsPanel, { SurveyManagementHistory } from './SurveyResultsPanel';
import { useSurveyWorkspace, type SurveyWorkspaceModel } from './useSurveyWorkspace';

interface SurveysPageProps {
  respondentOnly?: boolean;
  initialSurveyId?: string;
}
const SurveyManagement = ({ model }: { model: SurveyWorkspaceModel }) => {
  if (!model.canManage) return null;
  return (
    <>
      <SurveyEditor
        draft={model.draft}
        setDraft={model.setDraft}
        timezone={model.timezone}
        busy={model.isBusy('save-survey') || model.isBusy('load-draft')}
        onCancel={model.cancelDraft}
        onSave={() => void model.saveDraft()}
      />
      <SurveyAdminCatalog model={model} />
    </>
  );
};
const SurveyCatalogs = ({
  model,
  initialSurveyId,
}: {
  model: SurveyWorkspaceModel;
  initialSurveyId?: string;
}) => (
  <>
    {model.canRespond && !initialSurveyId && <SurveyRespondentCatalog model={model} />}
    {model.canResults && !model.canManage && <SurveyReportCatalog model={model} />}
  </>
);
const SurveysWorkspace = ({ respondentOnly = false, initialSurveyId }: SurveysPageProps) => {
  const model = useSurveyWorkspace(respondentOnly, initialSurveyId);
  return (
    <div className="space-y-4">
      <h1 className="sr-only">{respondentOnly ? 'Survey / Feedback' : 'Surveys'}</h1>
      <PageInformation title="Survey privacy">
        <p className="text-sm text-content-secondary">
          Employee responses are reported only as privacy-thresholded totals, scores, and comment
          groups.
        </p>
      </PageInformation>
      {model.notice && (
        <p role="status" className="text-sm text-status-success">
          {model.notice}
        </p>
      )}
      {model.error && (
        <p role="alert" className="text-sm text-status-danger">
          {model.error}
        </p>
      )}
      <SurveyManagement model={model} />
      <SurveyCatalogs model={model} initialSurveyId={initialSurveyId} />
      {model.survey && <SurveyResponsePanel survey={model.survey} model={model} />}
      {model.canManage && model.events.length > 0 && (
        <SurveyManagementHistory events={model.events} timezone={model.timezone} />
      )}
      {model.results && <SurveyResultsPanel results={model.results} />}
    </div>
  );
};
const SurveysPage = (props: SurveysPageProps = {}) => {
  const { currentTenant } = useTenant();
  const { user, clientSession } = useAuth();
  const scope = ['survey:manage', 'survey:respond', 'survey:results'].map((permission) => [
    permission,
    clientSession?.permissions.has(permission) ?? false,
    clientSession?.permissionScopes[permission],
  ]);
  // A different tenant, viewer, scope or entry workflow owns different form/results state.
  const key = JSON.stringify([
    currentTenant.id,
    currentTenant.timezone,
    user?.id,
    clientSession?.employeeId,
    scope,
    clientSession?.resourceScopes,
    props.respondentOnly,
    props.initialSurveyId,
  ]);
  return <SurveysWorkspace key={key} {...props} />;
};
export default SurveysPage;
