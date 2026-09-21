import { useState } from 'react';

import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useGraphClient } from '../../hooks/useGraphClient';

import { GoalEditor, GoalList, type Goal, type GoalDraft } from './PerformanceGoalEditor';
import {
  DeletePerformanceGoalDocument,
  ProposePerformanceGoalDocument,
  UpdatePerformanceGoalDocument,
} from './performanceGoalQueries';
import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';

interface Props {
  detail: PerformanceReviewDetailRow;
  canManage: boolean;
  canEvaluate: boolean;
  canSelf: boolean;
  actorEmployeeId?: string;
  isMutationBusy: boolean;
  mutationMessage?: { kind: 'error' | 'notice'; text: string };
  onReload: (participantId: string) => Promise<void>;
  onRunGoalAction: (operation: () => Promise<void>, successMessage: string) => Promise<boolean>;
}

const emptyDraft = (): GoalDraft => ({ title: '', description: '', weightage: '' });

const getGoalAuthority = (
  detail: PerformanceReviewDetailRow,
  canManage: boolean,
  canEvaluate: boolean,
  canSelf: boolean,
  actorEmployeeId?: string
) => {
  const isGoalSetting = detail.review.cycleStage === 'GOAL_SETTING';
  const isAssignedManager = actorEmployeeId === detail.review.managerEmployeeId;
  const canManageGoals =
    canManage || (canEvaluate && Boolean(actorEmployeeId) && isAssignedManager);
  const isOwnReview = detail.review.employeeId === actorEmployeeId;
  return {
    canCreate: isGoalSetting && (canManageGoals || (canSelf && isOwnReview)),
    canEdit: (goal: Goal) =>
      isGoalSetting && (canManageGoals || (canSelf && isOwnReview && goal.status === 'PROPOSED')),
  };
};

const GoalMutationMessage = ({ message }: { message?: Props['mutationMessage'] }) => {
  if (!message) return null;
  const isNotice = message.kind === 'notice';
  return (
    <p
      role={isNotice ? 'status' : 'alert'}
      className={isNotice ? 'mb-2 text-sm text-status-success' : 'mb-2 text-sm text-status-danger'}
    >
      {message.text}
    </p>
  );
};

const PerformanceGoalSection = ({
  detail,
  canManage,
  canEvaluate,
  canSelf,
  actorEmployeeId,
  isMutationBusy,
  mutationMessage,
  onReload,
  onRunGoalAction,
}: Props) => {
  const client = useGraphClient('client');
  const participantId = detail.review.id;
  const [draft, setDraft] = useState<GoalDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Goal | null>(null);
  const authority = getGoalAuthority(detail, canManage, canEvaluate, canSelf, actorEmployeeId);

  const resetDraft = () => {
    setDraft(emptyDraft());
    setEditingId(null);
  };

  const saveGoal = async () => {
    const goalId = editingId;
    const input = { participantId, ...draft };
    const saved = await onRunGoalAction(
      async () => {
        if (goalId) await client.request(UpdatePerformanceGoalDocument, { goalId, input });
        else await client.request(ProposePerformanceGoalDocument, { input });
        await onReload(participantId);
      },
      goalId ? 'Goal updated.' : 'Goal proposed.'
    );
    if (saved) resetDraft();
  };

  const confirmRemove = async () => {
    if (!pendingRemoval) return;
    const goal = pendingRemoval;
    const removed = await onRunGoalAction(async () => {
      await client.request(DeletePerformanceGoalDocument, { participantId, goalId: goal.id });
      await onReload(participantId);
    }, 'Goal removed.');
    if (!removed) throw new Error('Goal removal did not complete.');
    if (editingId === goal.id) resetDraft();
  };

  return (
    <Card title="Goals">
      <GoalMutationMessage message={mutationMessage} />
      <GoalList
        goals={detail.goals}
        canEditGoal={authority.canEdit}
        isMutationBusy={isMutationBusy}
        onEdit={(goal) => {
          setEditingId(goal.id);
          setDraft({
            title: goal.title,
            description: goal.description ?? '',
            weightage: goal.weightage ?? '',
          });
        }}
        onRemove={setPendingRemoval}
      />
      {authority.canCreate && (
        <GoalEditor
          draft={draft}
          editing={Boolean(editingId)}
          isMutationBusy={isMutationBusy}
          onCancel={resetDraft}
          onChange={setDraft}
          onSave={() => void saveGoal()}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title="Remove goal?"
        description={pendingRemoval ? `Remove “${pendingRemoval.title}” from this review?` : ''}
        confirmLabel="Remove goal"
        tone="danger"
        busy={isMutationBusy}
        onConfirm={confirmRemove}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
      />
    </Card>
  );
};

export default PerformanceGoalSection;
