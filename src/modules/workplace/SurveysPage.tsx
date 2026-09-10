import { ArrowLeft, ClipboardList, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import PageInformation from '../../components/common/PageInformation';
import Tabs from '../../components/common/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

import SurveyAdminCatalog from './SurveyAdminCatalog';
import { SurveyReportCatalog, SurveyRespondentCatalog } from './SurveyCatalogs';
import SurveyEditor from './SurveyEditor';
import SurveyResponsePanel from './SurveyResponsePanel';
import { SurveyManagementHistory } from './SurveyResultsPanel';
import SurveyReviewPage from './SurveyReviewPage';
import type { SurveyAnswerValue } from './useSurveyView';
import { useSurveyWorkspace, type SurveyWorkspaceModel } from './useSurveyWorkspace';

interface SurveysPageProps {
  respondentOnly?: boolean;
  initialSurveyId?: string;
}

const SurveyDraftPage = ({ model }: { model: SurveyWorkspaceModel }) => {
  const [copySource, setCopySource] = useState('');
  const [pendingCopy, setPendingCopy] = useState<string | null>(null);
  const selectSource = (id: string) => {
    setCopySource(id);
    if (id) void model.editSurvey(id, true);
    else model.createSurvey();
  };
  return (
    <div className="space-y-4">
      {!model.draft.id && (
        <label className="block max-w-xl text-sm font-medium">
          Start from
          <select
            className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3"
            value={copySource}
            disabled={model.isBusy('load-draft') || model.isBusy('save-survey')}
            onChange={(event) =>
              model.draftDirty
                ? setPendingCopy(event.target.value)
                : selectSource(event.target.value)
            }
          >
            <option value="">Blank survey</option>
            {model.adminSurveys.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {model.isBusy('load-draft') ? (
        <p role="status">Loading survey draft…</p>
      ) : (
        <SurveyEditor
          draft={model.draft}
          setDraft={model.setDraft}
          timezone={model.timezone}
          busy={model.isBusy('save-survey')}
          onCancel={model.backToList}
          onSave={() => void model.saveDraft()}
        />
      )}
      <ConfirmDialog
        open={pendingCopy !== null}
        title="Replace this draft?"
        description="Your unsaved changes will be replaced by the selected survey. Responses and history are never copied."
        confirmLabel="Replace draft"
        cancelLabel="Keep editing"
        onOpenChange={(open) => {
          if (!open) setPendingCopy(null);
        }}
        onConfirm={() => {
          if (pendingCopy !== null) selectSource(pendingCopy);
          setPendingCopy(null);
        }}
      />
    </div>
  );
};

const surveyTabs = (model: SurveyWorkspaceModel) => [
  ...(model.canManage ? [{ id: 'created', label: 'Surveys', panelId: 'survey-created' }] : []),
  ...(model.canRespond ? [{ id: 'mine', label: 'My surveys', panelId: 'survey-mine' }] : []),
  ...(model.canResults && !model.canManage
    ? [{ id: 'reports', label: 'Reports', panelId: 'survey-reports' }]
    : []),
];

const SurveyLists = ({ model }: { model: SurveyWorkspaceModel }) => {
  const tabs = surveyTabs(model);
  const [tab, setTab] = useState(tabs[0]?.id ?? 'mine');
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  if (tabs.length === 0) return <p>No surveys are available with your permissions.</p>;
  return (
    <>
      <Tabs tabs={tabs} value={tab} onValueChange={setTab} />
      <section role="tabpanel" id={active.panelId} aria-labelledby={`${active.panelId}-tab`}>
        {tab === 'created' && <SurveyAdminCatalog model={model} />}
        {tab === 'mine' && <SurveyRespondentCatalog model={model} />}
        {tab === 'reports' && <SurveyReportCatalog model={model} />}
      </section>
    </>
  );
};

const surveyTitle = (model: SurveyWorkspaceModel) => {
  if (model.screen === 'editor') return model.draft.id ? 'Edit survey' : 'Create survey';
  if (model.screen === 'results') return 'Survey responses';
  if (model.screen === 'survey') return model.survey?.summary.title ?? 'Survey';
  return 'Surveys';
};

const hasResponseValue = (answer: SurveyAnswerValue) =>
  Boolean(
    answer.numeric?.trim() ||
    answer.text?.trim() ||
    answer.comment?.trim() ||
    answer.options?.length
  );

const hasUnsavedChanges = (model: SurveyWorkspaceModel) => {
  if (model.screen === 'editor') return model.draftDirty;
  return (
    model.screen === 'survey' &&
    model.surveyMode === 'respond' &&
    !model.survey?.summary.completed &&
    Object.values(model.answers).some(hasResponseValue)
  );
};

const historyStatus = (model: SurveyWorkspaceModel) => {
  if (model.historyBusy) return 'Loading history...';
  if (model.historyFailed) return 'History could not be loaded. Close and try again.';
  return 'No management events recorded.';
};

const SurveyHistoryModal = ({ model }: { model: SurveyWorkspaceModel }) => (
  <Modal
    isOpen={model.historySurveyId !== null}
    onClose={model.closeHistory}
    title="Survey history"
    size="lg"
  >
    {model.events.length > 0 ? (
      <SurveyManagementHistory events={model.events} timezone={model.timezone} />
    ) : (
      <div className="py-8 text-center text-content-secondary">
        <ClipboardList className="mx-auto mb-3" aria-hidden="true" />
        {historyStatus(model)}
      </div>
    )}
  </Modal>
);

const SurveyScreen = ({ model, back }: { model: SurveyWorkspaceModel; back: () => void }) => {
  if (model.screen === 'list') return null;
  if (model.screen === 'editor')
    return model.canManage ? <SurveyDraftPage model={{ ...model, backToList: back }} /> : null;
  if (model.screen === 'results')
    return <SurveyReviewPage key={model.selectedSurveyId} model={model} />;
  if (model.survey) return <SurveyResponsePanel survey={model.survey} model={model} />;
  return model.error ? null : <p role="status">Loading survey...</p>;
};

const SurveysWorkspace = ({ respondentOnly = false, initialSurveyId }: SurveysPageProps) => {
  const model = useSurveyWorkspace(respondentOnly, initialSurveyId);
  const [confirmBack, setConfirmBack] = useState(false);
  const back = () => {
    if (hasUnsavedChanges(model)) {
      setConfirmBack(true);
    } else model.backToList();
  };
  const unsaved = hasUnsavedChanges(model);
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);
  const title = surveyTitle(model);
  const busy = model.isBusy('save-survey') || model.isBusy('submit-survey');
  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        retainTitle
        actions={
          model.screen === 'list' ? (
            model.canManage && (
              <Button startIcon={<Plus size={18} />} onClick={model.createSurvey}>
                Add survey
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              startIcon={<ArrowLeft size={16} />}
              disabled={busy}
              onClick={back}
            >
              Back to surveys
            </Button>
          )
        }
      />
      <PageInformation title="Survey privacy">
        <p>
          Names and employee identifiers are never shown with answers. Aggregate-only surveys retain
          their privacy threshold. Surveys that disclose individual review allow authorized HR/Admin
          to read unnamed submissions after closing.
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
      <div hidden={model.screen !== 'list'}>
        <SurveyLists model={model} />
      </div>
      <SurveyScreen model={model} back={back} />
      <SurveyHistoryModal model={model} />
      <ConfirmDialog
        open={confirmBack}
        title="Discard changes?"
        description="Your unsaved changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onOpenChange={setConfirmBack}
        onConfirm={() => {
          setConfirmBack(false);
          model.backToList();
        }}
      />
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
