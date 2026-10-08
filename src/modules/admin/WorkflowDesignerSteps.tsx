import { approverLabel } from './workflowSetup';
import { useEffect, useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminWorkflowsStepsDataQuery } from '../../api/graphql/graphql';

type WorkflowWithStepsRow = NonNullable<
  NonNullable<AdminWorkflowsStepsDataQuery['workflowsWithSteps']>[number]
>;
export type WorkflowStepLite = NonNullable<NonNullable<WorkflowWithStepsRow['steps']>[number]>;

type Props = {
  workflowId: string;
  steps: WorkflowStepLite[];
  onReorder: (workflowId: string, orderedStepIds: string[]) => Promise<void>;
  reorderBusy: boolean;
  delStepBusy: string | null;
  onDeleteStep: (stepId: string) => void;
};

const SortableRow = ({
  step,
  reorderBusy,
  delStepBusy,
  onDeleteStep,
}: {
  step: WorkflowStepLite;
  reorderBusy: boolean;
  delStepBusy: string | null;
  onDeleteStep: (stepId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 text-sm md:flex-nowrap ${
        isDragging
          ? 'border-indigo-300 bg-indigo-50/90 shadow-md dark:border-indigo-500/50 dark:bg-indigo-950/60'
          : 'border-transparent bg-transparent hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none select-none text-slate-400 hover:text-indigo-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-indigo-300"
        {...attributes}
        {...listeners}
        aria-label="Drag To Reorder Step"
        disabled={reorderBusy}
      >
        <span aria-hidden className="text-base leading-none">
          ⠿
        </span>
      </button>
      <span className="min-w-0 flex-1 text-slate-700 dark:text-slate-200">
        <span className="font-medium">{step.sequenceOrder}.</span> {step.stepName}
        {step.approverType ? (
          <span className="text-slate-500"> · {approverLabel(step.approverType)}</span>
        ) : null}
        {step.slaHours != null ? (
          <span className="text-slate-500"> · SLA {step.slaHours}h</span>
        ) : null}
        {step.canSkip ? <span className="text-amber-600"> · can skip</span> : null}
      </span>
      <button
        type="button"
        disabled={delStepBusy === step.id || reorderBusy}
        className="shrink-0 text-xs text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
        onClick={() => void onDeleteStep(step.id)}
        title={
          delStepBusy === step.id
            ? 'Removing...'
            : 'Remove step (blocked if approvals ran on this step)'
        }
      >
        {delStepBusy === step.id ? 'Removing...' : 'Remove'}
      </button>
    </li>
  );
};

const WorkflowDesignerSteps = ({
  workflowId,
  steps,
  onReorder,
  reorderBusy,
  delStepBusy,
  onDeleteStep,
}: Props) => {
  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0)),
    [steps]
  );

  const stepSync = useMemo(
    () => sortedSteps.map((s) => `${s.id}:${s.sequenceOrder}`).join('|'),
    [sortedSteps]
  );

  const [orderIds, setOrderIds] = useState<string[]>(() => sortedSteps.map((s) => s.id));

  useEffect(() => {
    setOrderIds(sortedSteps.map((s) => s.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when server-sent order or membership changes
  }, [stepSync]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const orderedSteps = orderIds
    .map((id) => sortedSteps.find((s) => s.id === id))
    .filter(Boolean) as WorkflowStepLite[];

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = orderIds.indexOf(String(active.id));
    const newIndex = orderIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = [...orderIds];
    const moved = arrayMove(orderIds, oldIndex, newIndex);
    setOrderIds(moved);
    try {
      await onReorder(workflowId, moved);
    } catch {
      setOrderIds(previous);
    }
  };

  if (sortedSteps.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Drag the handle to reorder approval steps — order saves when you drop.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(ev) => void handleDragEnd(ev)}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1 md:gap-2">
            {orderedSteps.map((s) => (
              <SortableRow
                key={s.id}
                step={s}
                reorderBusy={reorderBusy}
                delStepBusy={delStepBusy}
                onDeleteStep={onDeleteStep}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default WorkflowDesignerSteps;
