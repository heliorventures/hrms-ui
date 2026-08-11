import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import TabBar from '../../components/common/TabBar';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { createPermissionService } from '../../auth/permissionService';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ExitRequestCard from './components/ExitRequestCard';
import OnboardingChecklistCard from './components/OnboardingChecklistCard';
import SeparationRequestsCard from './components/SeparationRequestsCard';
import {
  ApproveSeparationDocument,
  ClientOpsClearanceBySeparationDocument,
  ClientOpsClearanceBySeparationQuery,
  ClientOpsEnsureOffboardingDocument,
  ClientOpsFinalizeFnfDocument,
  ClientOpsFnfBySeparationDocument,
  ClientOpsSeparationsListDocument,
  ClientOpsSetClearanceClearedDocument,
  ClientOpsSubmitSeparationDocument,
  ClientOpsUpsertFnfDocument,
  OnboardingChecklistDocument,
  RejectSeparationDocument,
  SetOnboardingChecklistItemDocument,
} from '../../api/graphql/graphql';
import type {
  ChecklistItem,
  ClearanceItemRow,
  FnfFormState,
  FnfSettlementRow,
  SeparationRow,
} from './onboardingTypes';

type MainTab = 'join' | 'exit';

const EMPTY_FNF_FORM: FnfFormState = { le: '', g: '', b: '', r: '' };
const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;

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
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [separations, setSeparations] = useState<SeparationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sepType, setSepType] = useState('RESIGNATION');
  const [lastDay, setLastDay] = useState('');
  const [resignDay, setResignDay] = useState('');
  const [reason, setReason] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openObId, setOpenObId] = useState<string | null>(null);
  const [obFnf, setObFnf] = useState<FnfSettlementRow | null>(null);
  const [obCl, setObCl] = useState<ClearanceItemRow[]>([]);
  const [obLoading, setObLoading] = useState(false);
  const [obErr, setObErr] = useState<string | null>(null);
  const [fnfForm, setFnfForm] = useState<FnfFormState>(EMPTY_FNF_FORM);
  const [fnfBusy, setFnfBusy] = useState(false);
  const [clBusy, setClBusy] = useState<string | null>(null);
  const [ensureBusy, setEnsureBusy] = useState(false);

  const loadChecklist = useCallback(async () => {
    const response = await client.request(OnboardingChecklistDocument, { limit: 100 });
    return response.onboardingChecklist;
  }, [client]);

  const loadSeparations = useCallback(async () => {
    const response = await client.request(ClientOpsSeparationsListDocument, { limit: 50 });
    return response.separations;
  }, [client]);

  const loadOffboardingDetail = useCallback(
    async (separationId: string) => {
      setObLoading(true);
      setObErr(null);
      try {
        const [fnfResponse, clearanceResponse] = await Promise.all([
          client.request(ClientOpsFnfBySeparationDocument, { separationId }),
          client.request<ClientOpsClearanceBySeparationQuery>(
            ClientOpsClearanceBySeparationDocument,
            { separationId }
          ),
        ]);
        const settlement = fnfResponse.fnfSettlement;
        setObFnf(settlement ?? null);
        setObCl(clearanceResponse.clearanceChecklist);
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
      } catch (err) {
        setObErr(graphQlUserMessage(err));
        setObFnf(null);
        setObCl([]);
      } finally {
        setObLoading(false);
      }
    },
    [client]
  );

  useEffect(() => {
    if (openObId) void loadOffboardingDetail(openObId);
  }, [openObId, loadOffboardingDetail]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const [checklist, separationRows] = await Promise.all([loadChecklist(), loadSeparations()]);
        if (!cancelled) {
          setItems(checklist);
          setSeparations(separationRows);
        }
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadChecklist, loadSeparations]);

  const toggleChecklist = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await client.request(SetOnboardingChecklistItemDocument, { checklistItemId: id, isCompleted: next });
      setItems(await loadChecklist());
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
      setSeparations(await loadSeparations());
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
      await loadOffboardingDetail(separationId);
    } catch (err) {
      setObErr(graphQlUserMessage(err));
    } finally {
      setFnfBusy(false);
    }
  };

  const finalizeFnf = async (separationId: string) => {
    if (!window.confirm('Mark this FNF as processed? Amounts can no longer be edited.')) return;
    setFnfBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsFinalizeFnfDocument, { separationId });
      await loadOffboardingDetail(separationId);
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
      await loadOffboardingDetail(separationId);
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
      await loadOffboardingDetail(separationId);
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
      setSeparations(await loadSeparations());
      setReason('');
      setResignDay('');
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding & Exit"
        description="Complete joining tasks; file exit requests, HR approval, department clearance, and FNF settlement."
      />

      <TabBar
        value={mainTab}
        onChange={(id) => setMainTab(id as MainTab)}
        tabs={[
          { id: 'join', label: 'Joining Checklist' },
          { id: 'exit', label: 'Exit & Separation' },
        ]}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {mainTab === 'join' ? (
        <OnboardingChecklistCard
          busyId={busyId}
          items={items}
          loading={loading}
          onToggle={(id, next) => void toggleChecklist(id, next)}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
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
          <SeparationRequestsCard
            actionId={actionId}
            canManageOnboarding={canManageOnboarding}
            clBusy={clBusy}
            ensureBusy={ensureBusy}
            fnfBusy={fnfBusy}
            fnfForm={fnfForm}
            loading={loading}
            obCl={obCl}
            obErr={obErr}
            obFnf={obFnf}
            obLoading={obLoading}
            openObId={openObId}
            separations={separations}
            onEnsureRows={(id) => void ensureOffboardingRows(id)}
            onFinalizeFnf={(id) => void finalizeFnf(id)}
            onHrAction={(id, approve) => void hrAction(id, approve)}
            onOpenObIdChange={setOpenObId}
            onSaveFnf={(id) => void saveFnf(id)}
            onToggleClearance={(separationId, clearanceId, next) =>
              void toggleClearance(separationId, clearanceId, next)
            }
            onUpdateFnfForm={(patch) => setFnfForm((current) => ({ ...current, ...patch }))}
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
