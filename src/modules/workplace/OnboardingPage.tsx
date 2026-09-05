import { useEffect, useState } from 'react';
import { useDialogs } from '../../contexts/DialogContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { createPermissionService } from '../../auth/permissionService';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ExitRequestCard from './components/ExitRequestCard';
import OnboardingChecklistCard from './components/OnboardingChecklistCard';
import SeparationRequestsCard from './components/SeparationRequestsCard';
import {
  ApproveSeparationDocument,
  ClientOpsEnsureOffboardingDocument,
  ClientOpsFinalizeFnfDocument,
  ClientOpsSetClearanceClearedDocument,
  ClientOpsSubmitSeparationDocument,
  ClientOpsUpsertFnfDocument,
  RejectSeparationDocument,
  SetOnboardingChecklistItemDocument,
} from '../../api/graphql/graphql';
import type { FnfFormState } from './onboardingTypes';
import { useOnboardingResources } from './useOnboardingResources';

type MainTab = 'join' | 'exit';

const EMPTY_FNF_FORM: FnfFormState = { le: '', g: '', b: '', r: '' };
const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;

interface RecoveryNoticeProps {
  busy: boolean;
  message: string;
  onRetry: () => void;
}

const RecoveryNotice = ({ busy, message, onRetry }: RecoveryNoticeProps) => (
  <Card>
    <div className="flex flex-wrap items-center justify-between gap-3" role="alert">
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      <Button variant="secondary" busy={busy} busyLabel="Trying again" onClick={onRetry}>
        Try again
      </Button>
    </div>
  </Card>
);

const validateOptionalMoney = (value: string, label: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!MONEY_PATTERN.test(trimmed) || Number(trimmed) < 0) {
    return `${label} must be a non-negative amount with up to 2 decimal places.`;
  }
  return null;
};

const OnboardingPage = () => {
  const { clientSession } = useAuth();
  const permissionService = createPermissionService(clientSession);
  const canManageOnboarding = permissionService.canCapability('action.onboarding.manage');
  const client = useGraphClient('client');
  const [mainTab, setMainTab] = useState<MainTab>('join');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sepType, setSepType] = useState('RESIGNATION');
  const [lastDay, setLastDay] = useState('');
  const [resignDay, setResignDay] = useState('');
  const [reason, setReason] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openObId, setOpenObId] = useState<string | null>(null);
  const [obErr, setObErr] = useState<string | null>(null);
  const [fnfForm, setFnfForm] = useState<FnfFormState>(EMPTY_FNF_FORM);
  const [fnfBusy, setFnfBusy] = useState(false);
  const [clBusy, setClBusy] = useState<string | null>(null);
  const [ensureBusy, setEnsureBusy] = useState(false);
  const dialogs = useDialogs();
  const {
    checklist,
    offboarding,
    refreshChecklist,
    refreshOffboarding,
    refreshSeparations,
    separations,
  } = useOnboardingResources(client, mainTab, openObId);

  useEffect(() => {
    setObErr(null);
    if (!offboarding.hasResolved) {
      setFnfForm(EMPTY_FNF_FORM);
      return;
    }
    const settlement = offboarding.data.fnf;
    setFnfForm(
      settlement
        ? {
            le: settlement.leaveEncashment ?? '',
            g: settlement.gratuityAmount ?? '',
            b: settlement.bonusPayable ?? '',
            r: settlement.recoveryAmount ?? '',
          }
        : EMPTY_FNF_FORM
    );
  }, [offboarding.hasResolved, offboarding.version]);

  useEffect(() => {
    setActionId(null);
    setBusyId(null);
    setClBusy(null);
    setEnsureBusy(false);
    setError(null);
    setFnfBusy(false);
    setOpenObId(null);
    setSubmitBusy(false);
  }, [client]);

  const toggleChecklist = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await client.request(SetOnboardingChecklistItemDocument, { checklistItemId: id, isCompleted: next });
      await refreshChecklist();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const hrAction = async (id: string, approve: boolean) => {
    setActionId(id);
    setError(null);
    try {
      await client.request(approve ? ApproveSeparationDocument : RejectSeparationDocument, {
        separationId: id,
      });
      await refreshSeparations();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const saveFnf = async (separationId: string) => {
    const amountError =
      validateOptionalMoney(fnfForm.le, 'Leave encashment') ??
      validateOptionalMoney(fnfForm.g, 'Gratuity') ??
      validateOptionalMoney(fnfForm.b, 'Bonus payable') ??
      validateOptionalMoney(fnfForm.r, 'Recovery');
    if (amountError) {
      setObErr(amountError);
      return;
    }
    setFnfBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsUpsertFnfDocument, {
        input: {
          separationId,
          leaveEncashment: fnfForm.le.trim() || null,
          gratuityAmount: fnfForm.g.trim() || null,
          bonusPayable: fnfForm.b.trim() || null,
          recoveryAmount: fnfForm.r.trim() || null,
        },
      });
      await refreshOffboarding(separationId);
    } catch (err) {
      setObErr(graphQlUserMessage(err));
    } finally {
      setFnfBusy(false);
    }
  };

  const finalizeFnf = async (separationId: string) => {
    const userConfirmed = await dialogs.confirm({
      title: 'Finalize full & final settlement',
      message:
        'Once finalized, the FNF settlement becomes read-only and cannot be edited. Continue only if amounts are complete and approved.',
      confirmLabel: 'Finalize settlement',
      cancelLabel: 'Keep editing',
      variant: 'danger',
    });
    if (!userConfirmed) return;
    setFnfBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsFinalizeFnfDocument, { separationId });
      await refreshOffboarding(separationId);
    } catch (err) {
      setObErr(graphQlUserMessage(err));
    } finally {
      setFnfBusy(false);
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
      <PageHeader
        title="Onboarding & Exit"
      />

      <Tabs
        value={mainTab}
        onValueChange={(id) => setMainTab(id as MainTab)}
        tabs={[
          { id: 'join', label: 'Joining Checklist', panelId: 'onboarding-tab-join' },
          { id: 'exit', label: 'Exit & Separation', panelId: 'onboarding-tab-exit' },
        ]}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
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
                  busy={
                    offboarding.phase === 'loading' || offboarding.phase === 'refreshing'
                  }
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
                fnfBusy={fnfBusy}
                fnfForm={fnfForm}
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
                onFinalizeFnf={(id) => void finalizeFnf(id)}
                onHrAction={(id, approve) => void hrAction(id, approve)}
                onOpenObIdChange={setOpenObId}
                onSaveFnf={(id) => void saveFnf(id)}
                onToggleClearance={(separationId, clearanceId, next) =>
                  void toggleClearance(separationId, clearanceId, next)
                }
                onUpdateFnfForm={(patch) =>
                  setFnfForm((current) => ({ ...current, ...patch }))
                }
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OnboardingPage;
