import Button from '../../components/common/Button';

import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export type Goal = PerformanceReviewDetailRow['goals'][number];
export interface GoalDraft {
  title: string;
  description: string;
  weightage: string;
}

interface GoalListProps {
  goals: Goal[];
  canEditGoal: (goal: Goal) => boolean;
  isMutationBusy: boolean;
  onEdit: (goal: Goal) => void;
  onRemove: (goal: Goal) => void;
}

export const GoalList = ({
  goals,
  canEditGoal,
  isMutationBusy,
  onEdit,
  onRemove,
}: GoalListProps) => {
  if (!goals.length) return <p className="text-sm text-content-secondary">No goals proposed.</p>;

  return (
    <ul className="divide-y divide-line">
      {goals.map((goal) => (
        <li key={goal.id} className="flex flex-wrap items-start justify-between gap-2 py-2 text-sm">
          <div>
            <p className="font-medium">
              {goal.title} · {goal.weightage ?? 'Not set'}% · {goal.status}
            </p>
            {goal.description && <p className="text-content-secondary">{goal.description}</p>}
          </div>
          {canEditGoal(goal) && (
            <span className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isMutationBusy}
                onClick={() => onEdit(goal)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={isMutationBusy}
                onClick={() => onRemove(goal)}
              >
                Remove
              </Button>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

interface GoalEditorProps {
  draft: GoalDraft;
  editing: boolean;
  isMutationBusy: boolean;
  onCancel: () => void;
  onChange: (draft: GoalDraft) => void;
  onSave: () => void;
}

export const GoalEditor = ({
  draft,
  editing,
  isMutationBusy,
  onCancel,
  onChange,
  onSave,
}: GoalEditorProps) => (
  <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_8rem_auto_auto]">
    <input
      aria-label="Goal title"
      placeholder="Goal"
      className={fieldClass}
      disabled={isMutationBusy}
      value={draft.title}
      onChange={(event) => onChange({ ...draft, title: event.target.value })}
    />
    <input
      aria-label="Goal description"
      placeholder="Description"
      className={fieldClass}
      disabled={isMutationBusy}
      value={draft.description}
      onChange={(event) => onChange({ ...draft, description: event.target.value })}
    />
    <input
      aria-label="Goal weight"
      placeholder="Weight %"
      className={fieldClass}
      disabled={isMutationBusy}
      value={draft.weightage}
      onChange={(event) => onChange({ ...draft, weightage: event.target.value })}
    />
    <Button busy={isMutationBusy} onClick={onSave}>
      {editing ? 'Save goal' : 'Add goal'}
    </Button>
    {editing && (
      <Button variant="outline" disabled={isMutationBusy} onClick={onCancel}>
        Cancel
      </Button>
    )}
  </div>
);
