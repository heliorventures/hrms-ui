import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import {
  DeletePerformanceGoalKpiDocument,
  PerformanceGoalKpisDocument,
  SavePerformanceKpiTargetDocument,
  SubmitPerformanceKpiActualDocument,
  type PerformanceGoalKpi,
} from '../performanceAdminQueries';
import type { PerformanceReviewDetailRow } from '../performanceLifecycleQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

type Goal = PerformanceReviewDetailRow['goals'][number];
type TargetDraft = Pick<PerformanceGoalKpi, 'metricName'> & { targetValue: string; unit: string };
type ActualDraft = {
  actualValue: string;
  evidence: string;
  comment: string;
  measurementDate: string;
};

const emptyTarget = (): TargetDraft => ({ metricName: '', targetValue: '', unit: '' });
const actualFrom = (kpi: PerformanceGoalKpi): ActualDraft => ({
  actualValue: kpi.actualValue ?? '',
  evidence: kpi.evidence ?? '',
  comment: kpi.comment ?? '',
  measurementDate: kpi.measurementDate ?? new Date().toISOString().slice(0, 10),
});

const canManageGoals = (
  detail: PerformanceReviewDetailRow,
  canManage: boolean,
  canEvaluate: boolean,
  actorEmployeeId?: string
) =>
  canManage ||
  (canEvaluate && Boolean(actorEmployeeId) && actorEmployeeId === detail.review.managerEmployeeId);

const canEditTarget = (
  detail: PerformanceReviewDetailRow,
  goal: Goal,
  canManage: boolean,
  canEvaluate: boolean,
  canSelf: boolean,
  actorEmployeeId?: string
) =>
  detail.review.cycleStage === 'GOAL_SETTING' &&
  (canManageGoals(detail, canManage, canEvaluate, actorEmployeeId) ||
    (canSelf && detail.review.employeeId === actorEmployeeId && goal.status === 'PROPOSED'));

const canRecordActual = (
  detail: PerformanceReviewDetailRow,
  canManage: boolean,
  canEvaluate: boolean,
  canSelf: boolean,
  actorEmployeeId?: string
) => {
  if (detail.review.cycleStage === 'SELF_REVIEW')
    return (
      canSelf && detail.review.employeeId === actorEmployeeId && !detail.review.selfSubmittedAt
    );
  return (
    detail.review.cycleStage === 'MANAGER_REVIEW' &&
    !detail.review.managerSubmittedAt &&
    canManageGoals(detail, canManage, canEvaluate, actorEmployeeId)
  );
};

const KpiTargetForm = ({
  draft,
  busy,
  editing,
  onChange,
  onSave,
  onCancel,
}: {
  draft: TargetDraft;
  busy: boolean;
  editing: boolean;
  onChange: (draft: TargetDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="mt-2 grid gap-2 md:grid-cols-5">
    <input
      aria-label="KPI metric"
      className={fieldClass}
      disabled={busy}
      placeholder="Metric"
      value={draft.metricName}
      onChange={(event) => onChange({ ...draft, metricName: event.target.value })}
    />
    <input
      aria-label="KPI target"
      className={fieldClass}
      disabled={busy}
      placeholder="Target"
      value={draft.targetValue}
      onChange={(event) => onChange({ ...draft, targetValue: event.target.value })}
    />
    <input
      aria-label="KPI unit"
      className={fieldClass}
      disabled={busy}
      placeholder="Unit"
      value={draft.unit}
      onChange={(event) => onChange({ ...draft, unit: event.target.value })}
    />
    <Button busy={busy} disabled={!draft.metricName.trim()} onClick={onSave}>
      {editing ? 'Save target' : 'Add target'}
    </Button>
    {editing && (
      <Button variant="outline" disabled={busy} onClick={onCancel}>
        Cancel
      </Button>
    )}
  </div>
);

const KpiActualForm = ({
  draft,
  busy,
  onChange,
  onSave,
  onCancel,
}: {
  draft: ActualDraft;
  busy: boolean;
  onChange: (draft: ActualDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="mt-2 grid gap-2 md:grid-cols-3">
    <input
      aria-label="KPI actual"
      className={fieldClass}
      disabled={busy}
      placeholder="Actual"
      value={draft.actualValue}
      onChange={(event) => onChange({ ...draft, actualValue: event.target.value })}
    />
    <input
      aria-label="KPI evidence"
      className={fieldClass}
      disabled={busy}
      placeholder="Evidence"
      value={draft.evidence}
      onChange={(event) => onChange({ ...draft, evidence: event.target.value })}
    />
    <input
      aria-label="KPI comment"
      className={fieldClass}
      disabled={busy}
      placeholder="Comment"
      value={draft.comment}
      onChange={(event) => onChange({ ...draft, comment: event.target.value })}
    />
    <input
      aria-label="KPI measurement date"
      className={fieldClass}
      type="date"
      disabled={busy}
      value={draft.measurementDate}
      onChange={(event) => onChange({ ...draft, measurementDate: event.target.value })}
    />
    <Button busy={busy} onClick={onSave}>
      Save actual
    </Button>
    <Button variant="outline" disabled={busy} onClick={onCancel}>
      Cancel
    </Button>
  </div>
);

interface Props {
  detail: PerformanceReviewDetailRow;
  canManage: boolean;
  canEvaluate: boolean;
  canSelf: boolean;
  actorEmployeeId?: string;
  isMutationBusy: boolean;
  onReload: (participantId: string) => Promise<void>;
  onRunGoalAction: (operation: () => Promise<void>, successMessage: string) => Promise<boolean>;
}

const PerformanceGoalKpis = ({
  detail,
  canManage,
  canEvaluate,
  canSelf,
  actorEmployeeId,
  isMutationBusy,
  onReload,
  onRunGoalAction,
}: Props) => {
  const client = useGraphClient('client');
  const [kpis, setKpis] = useState<PerformanceGoalKpi[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [targetGoalId, setTargetGoalId] = useState<string | null>(null);
  const [targetKpiId, setTargetKpiId] = useState<string | null>(null);
  const [targetDraft, setTargetDraft] = useState<TargetDraft>(emptyTarget);
  const [actualKpi, setActualKpi] = useState<PerformanceGoalKpi | null>(null);
  const [actualDraft, setActualDraft] = useState<ActualDraft>(
    actualFrom({ id: '', goalId: '', metricName: '' })
  );
  const [pendingDelete, setPendingDelete] = useState<PerformanceGoalKpi | null>(null);
  const requestId = useRef(0);
  const participantId = detail.review.id;

  const loadKpis = useCallback(async () => {
    const id = ++requestId.current;
    const result = await client.request<{ performanceGoalKpis: PerformanceGoalKpi[] }>(
      PerformanceGoalKpisDocument,
      { participantId }
    );
    if (id === requestId.current) setKpis(result.performanceGoalKpis);
  }, [client, participantId]);

  useEffect(() => {
    void loadKpis().catch((cause) => setMessage(graphQlUserMessage(cause)));
  }, [loadKpis]);

  const stopTargetEdit = () => {
    setTargetGoalId(null);
    setTargetKpiId(null);
    setTargetDraft(emptyTarget());
  };
  const saveTarget = async () => {
    if (!targetGoalId) return;
    const saved = await onRunGoalAction(
      async () => {
        await client.request(SavePerformanceKpiTargetDocument, {
          input: {
            participantId,
            goalId: targetGoalId,
            id: targetKpiId,
            metricName: targetDraft.metricName.trim(),
            targetValue: targetDraft.targetValue.trim() || null,
            unit: targetDraft.unit.trim() || null,
          },
        });
        await Promise.all([loadKpis(), onReload(participantId)]);
      },
      targetKpiId
        ? 'KPI target saved. Goal approval was reset.'
        : 'KPI target added. Goal approval was reset.'
    );
    if (saved) stopTargetEdit();
  };
  const saveActual = async () => {
    if (!actualKpi) return;
    const saved = await onRunGoalAction(async () => {
      await client.request(SubmitPerformanceKpiActualDocument, {
        input: {
          participantId,
          goalKpiId: actualKpi.id,
          expectedRevision: detail.review.responseRevision,
          actualValue: actualDraft.actualValue.trim() || null,
          evidence: actualDraft.evidence.trim() || null,
          comment: actualDraft.comment.trim() || null,
          measurementDate: actualDraft.measurementDate || null,
        },
      });
      await loadKpis();
    }, 'KPI actual recorded.');
    if (saved) setActualKpi(null);
  };
  const deleteKpi = async () => {
    if (!pendingDelete) return;
    const removed = await onRunGoalAction(async () => {
      await client.request(DeletePerformanceGoalKpiDocument, {
        participantId,
        goalKpiId: pendingDelete.id,
      });
      await Promise.all([loadKpis(), onReload(participantId)]);
    }, 'KPI target removed. Goal approval was reset.');
    if (!removed) throw new Error('KPI removal did not complete.');
    setPendingDelete(null);
  };
  const actualAllowed = canRecordActual(detail, canManage, canEvaluate, canSelf, actorEmployeeId);

  return (
    <section className="mt-4" aria-label="Goal KPIs">
      <h3 className="font-semibold">Goal KPIs</h3>
      {message && (
        <p role="alert" className="mt-2 text-sm text-status-danger">
          {message}
        </p>
      )}
      {detail.goals.map((goal) => {
        const goalKpis = kpis.filter((kpi) => kpi.goalId === goal.id);
        const targetAllowed = canEditTarget(
          detail,
          goal,
          canManage,
          canEvaluate,
          canSelf,
          actorEmployeeId
        );
        return (
          <div key={goal.id} className="mt-2 rounded-md border border-line p-3 text-sm">
            <p className="font-medium">{goal.title}</p>
            {goalKpis.map((kpi) => (
              <div key={kpi.id} className="mt-2 rounded bg-surface-selected p-2">
                {kpi.metricName}: target {kpi.targetValue ?? '—'} {kpi.unit ?? ''} · actual{' '}
                {kpi.actualValue ?? '—'}
                <div className="mt-2 flex flex-wrap gap-2">
                  {targetAllowed && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMutationBusy}
                      onClick={() => {
                        setTargetGoalId(goal.id);
                        setTargetKpiId(kpi.id);
                        setTargetDraft({
                          metricName: kpi.metricName,
                          targetValue: kpi.targetValue ?? '',
                          unit: kpi.unit ?? '',
                        });
                      }}
                    >
                      Edit target
                    </Button>
                  )}
                  {targetAllowed && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={isMutationBusy}
                      onClick={() => setPendingDelete(kpi)}
                    >
                      Remove target
                    </Button>
                  )}
                  {actualAllowed && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMutationBusy}
                      onClick={() => {
                        setActualKpi(kpi);
                        setActualDraft(actualFrom(kpi));
                      }}
                    >
                      Record actual
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {targetAllowed && targetGoalId !== goal.id && (
              <Button
                className="mt-2"
                size="sm"
                variant="outline"
                disabled={isMutationBusy}
                onClick={() => {
                  setTargetGoalId(goal.id);
                  setTargetKpiId(null);
                  setTargetDraft(emptyTarget());
                }}
              >
                Add KPI target
              </Button>
            )}
            {targetAllowed && targetGoalId === goal.id && (
              <KpiTargetForm
                draft={targetDraft}
                busy={isMutationBusy}
                editing={Boolean(targetKpiId)}
                onChange={setTargetDraft}
                onSave={() => {
                  void saveTarget();
                }}
                onCancel={stopTargetEdit}
              />
            )}
          </div>
        );
      })}
      {actualKpi && actualAllowed && (
        <KpiActualForm
          draft={actualDraft}
          busy={isMutationBusy}
          onChange={setActualDraft}
          onSave={() => {
            void saveActual();
          }}
          onCancel={() => setActualKpi(null)}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove KPI target?"
        description="Removing a KPI target invalidates the affected goal approval."
        confirmLabel="Remove target"
        tone="danger"
        busy={isMutationBusy}
        onConfirm={deleteKpi}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      />
    </section>
  );
};

export default PerformanceGoalKpis;
