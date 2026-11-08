import { useEffect, useState } from 'react';

import {
  ApproveSeparationDocument,
  ClientOpsEnsureOffboardingDocument,
  ClientOpsSetClearanceClearedDocument,
  ClientOpsSubmitSeparationDocument,
  RejectSeparationDocument,
  SetOnboardingChecklistItemDocument,
} from '../../api/graphql/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { useFeedbackState } from '../../hooks/useFeedbackState';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ExitFinanceReview from '../loans/ExitFinanceReview';
import FnfFinanceReview from '../loans/FnfFinanceReview';

import ExitRequestCard from './components/ExitRequestCard';
import OnboardingChecklistCard from './components/OnboardingChecklistCard';
import SeparationRequestsCard from './components/SeparationRequestsCard';
import { useOnboardingResources } from './useOnboardingResources';

type MainTab = 'join' | 'exit';

interface RecoveryNoticeProps {
  busy: boolean;
  message: string;
  onRetry: () => void;
}

const RecoveryNotice = ({ busy, message, onRetry }: RecoveryNoticeProps) => (
  <FeedbackToast
    variant={'error'}
    messageKey={message}
    action={
      <Button variant="secondary" busy={busy} busyLabel="Trying again" onClick={onRetry}>
        Try again
      </Button>
    }
  >
    <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
  </FeedbackToast>
);

const OnboardingPage = () => {
  const notifyAction = useActionFeedback();

  const { clientSession } = useAuth();
  const permissionService = createPermissionService(clientSession);
  const canManageOnboarding = permissionService.canCapability('action.onboarding.manage');
  const client = useGraphClient('client');
  const [mainTab, setMainTab] = useState<MainTab>('join');
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sepType, setSepType] = useState('RESIGNATION');
  const [lastDay, setLastDay] = useState('');
  const [resignDay, setResignDay] = useState('');
  const [reason, setReason] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openObId, setOpenObId] = useState<string | null>(null);
  const [obErr, setObErr] = useFeedbackState<string | null>(null, 'error');
  const [clBusy, setClBusy] = useState<string | null>(null);
  const [ensureBusy, setEnsureBusy] = useState(false);
  const [financeExit, setFinanceExit] = useState<string | null>(null);
  const [financeFnf, setFinanceFnf] = useState<string | null>(null);
  const {
    checklist,
    offboarding,
    refreshChecklist,
    refreshOffboarding,
    refreshSeparations,
    separations,
  } = useOnboardingResources(client, mainTab, openObId);

  useEffect(() => {
    setActionId(null);
    setBusyId(null);
    setClBusy(null);
    setEnsureBusy(false);
    setError(null);
    setFinanceExit(null);
    setFinanceFnf(null);
    setOpenObId(null);
    setSubmitBusy(false);
  }, [client, setError]);

  const toggleChecklist = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await client.request(SetOnboardingChecklistItemDocument, {
        checklistItemId: id,
        isCompleted: next,
      });
      notifyAction('updated');
      await refreshChecklist();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const hrAction = async (id: string, approve: boolean) => {
    if (approve && permissionService.canScopedPermission(PERMISSIONS.loanExitReview, ['ALL'])) {
      setFinanceExit(id);
      return;
    }
    setActionId(id);
    setError(null);
    try {
      await client.request(approve ? ApproveSeparationDocument : RejectSeparationDocument, {
        separationId: id,
      });
      notifyAction('updated');
      await refreshSeparations();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const ensureOffboardingRows = async (separationId: string) => {
    setEnsureBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsEnsureOffboardingDocument, { separationId });
      await refreshOffboarding(separationId);
    } catch (err) {
      setObErr(graphQlUserMessage(err));
    } finally {
      setEnsureBusy(false);
    }
  };

  const toggleClearance = async (separationId: string, clearanceId: string, next: boolean) => {
    setClBusy(clearanceId);
    setObErr(null);
    try {
      await client.request(ClientOpsSetClearanceClearedDocument, { clearanceId, isCleared: next });
      notifyAction('updated');
      await refreshOffboarding(separationId);
    } catch (err) {
      setObErr(graphQlUserMessage(err));
    } finally {
      setClBusy(null);
    }
  };

  const submitExit = async () => {
    if (!lastDay.trim()) {
      setError('Last working day is required');
      return;
    }
    if (resignDay.trim() && resignDay.trim() > lastDay.trim()) {
      setError('Resignation date cannot be after the last working day.');
      return;
    }
    setSubmitBusy(true);
    setError(null);
    try {
      await client.request(ClientOpsSubmitSeparationDocument, {
        input: {
          separationType: sepType,
          lastWorkingDate: lastDay,
          resignationDate: resignDay.trim() ? resignDay : null,
          reason: reason.trim() || null,
        },
      });
      notifyAction('submitted');
      await refreshSeparations();
      setReason('');
      setResignDay('');
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Onboarding & Exit" />

      <div data-tour-anchor="onboarding.sections">
        <Tabs
          value={mainTab}
          onValueChange={(id) => setMainTab(id as MainTab)}
          tabs={[
            { id: 'join', label: 'Joining Checklist', panelId: 'onboarding-tab-join' },
            { id: 'exit', label: 'Exit & Separation', panelId: 'onboarding-tab-exit' },
          ]}
        />
      </div>

      {error && (
        <FeedbackToast variant={'error'} messageKey={error}>
          {error}
        </FeedbackToast>
      )}

      <section
        id="onboarding-tab-join"
        role="tabpanel"
        aria-labelledby="onboarding-tab-join-tab"
        hidden={mainTab !== 'join'}
        className={mainTab === 'join' ? undefined : 'hidden'}
      >
        {mainTab === 'join' ? (
          <div className="space-y-4">
            {checklist.error || checklist.refreshError ? (
              <RecoveryNotice
                busy={checklist.phase === 'loading' || checklist.phase === 'refreshing'}
                message={checklist.error ?? checklist.refreshError ?? ''}
                onRetry={() => void refreshChecklist()}
              />
            ) : null}
            {!checklist.error ? (
              <OnboardingChecklistCard
                busyId={busyId}
                items={checklist.data}
                loading={checklist.phase === 'loading'}
                onToggle={(id, next) => void toggleChecklist(id, next)}
              />
            ) : null}
          </div>
        ) : null}
      </section>

      <div
        id="onboarding-tab-exit"
        role="tabpanel"
        aria-labelledby="onboarding-tab-exit-tab"
        hidden={mainTab !== 'exit'}
        className={mainTab === 'exit' ? 'grid gap-6 lg:grid-cols-2' : 'hidden'}
      >
        {mainTab === 'exit' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {separations.refreshError ? (
              <div className="lg:col-span-2">
                <RecoveryNotice
                  busy={separations.phase === 'refreshing'}
                  message={separations.refreshError}
                  onRetry={() => void refreshSeparations()}
                />
              </div>
            ) : null}
            {openObId && (offboarding.error || offboarding.refreshError) ? (
              <div className="lg:col-span-2">
                <RecoveryNotice
                  busy={offboarding.phase === 'loading' || offboarding.phase === 'refreshing'}
                  message={offboarding.error ?? offboarding.refreshError ?? ''}
                  onRetry={() => void refreshOffboarding(openObId)}
                />
              </div>
            ) : null}
            <ExitRequestCard
              lastDay={lastDay}
              reason={reason}
              resignDay={resignDay}
              sepType={sepType}
              submitBusy={submitBusy}
              onLastDayChange={setLastDay}
              onReasonChange={setReason}
              onResignDayChange={setResignDay}
              onSepTypeChange={setSepType}
              onSubmit={() => void submitExit()}
            />
            {separations.error ? (
              <RecoveryNotice
                busy={separations.phase === 'loading'}
                message={separations.error}
                onRetry={() => void refreshSeparations()}
              />
            ) : (
              <SeparationRequestsCard
                actionId={actionId}
                canManageOnboarding={canManageOnboarding}
                clBusy={clBusy}
                ensureBusy={ensureBusy}
                loading={separations.phase === 'loading'}
                obCl={offboarding.data.clearance}
                obErr={
                  obErr ??
                  (offboarding.error
                    ? 'Clearance and final settlement details are unavailable.'
                    : null)
                }
                obFnf={offboarding.data.fnf}
                obLoading={offboarding.phase === 'loading'}
                openObId={openObId}
                separations={separations.data}
                onEnsureRows={(id) => void ensureOffboardingRows(id)}
                onReviewFnf={setFinanceFnf}
                onHrAction={(id, approve) => void hrAction(id, approve)}
                onOpenObIdChange={setOpenObId}
                onToggleClearance={(separationId, clearanceId, next) =>
                  void toggleClearance(separationId, clearanceId, next)
                }
              />
            )}
          </div>
        ) : null}
      </div>
      {financeExit && (
        <ExitFinanceReview
          key={financeExit}
          separationId={financeExit}
          onClose={() => setFinanceExit(null)}
          onSaved={async () => { if (!await refreshSeparations()) throw new Error('Approval recorded. The exit list could not be refreshed; retry refresh.'); }}
        />
      )}
      {financeFnf && (
        <FnfFinanceReview
          key={financeFnf}
          separationId={financeFnf}
          onClose={() => setFinanceFnf(null)}
          onSaved={async () => { if (!await refreshOffboarding(financeFnf)) throw new Error('Financial outcome recorded. The exit list could not be refreshed; retry refresh.'); }}
        />
      )}
    </div>
  );
};

export default OnboardingPage;
