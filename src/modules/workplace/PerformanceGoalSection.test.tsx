// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformanceGoalSection from './PerformanceGoalSection';
import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';

const request = vi.fn();
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));

const createDetail = (status = 'PROPOSED'): PerformanceReviewDetailRow => ({
  review: {
    id: 'participant-1',
    reviewCycleId: 'cycle-1',
    employeeId: 'employee-1',
    employeeName: 'Employee',
    managerEmployeeId: 'manager-1',
    managerName: 'Manager',
    appraisalTemplateId: 'template-1',
    cycleName: 'Annual',
    cycleStartDate: '2026-01-01',
    cycleEndDate: '2026-12-31',
    cycleStage: 'GOAL_SETTING',
    status: 'PENDING',
  },
  goals: [
    {
      id: 'goal-1',
      employeeId: 'employee-1',
      reviewCycleId: 'cycle-1',
      title: 'Ship',
      description: 'Original description',
      weightage: '40',
      status,
    },
  ],
  feedback: [],
  template: {
    id: 'template-1',
    performanceProgramId: 'program-1',
    version: 1,
    name: 'Annual template',
    status: 'PUBLISHED',
    sections: [],
  },
  answers: [],
});

const renderGoalSection = (
  overrides: Partial<ComponentProps<typeof PerformanceGoalSection>> = {}
) => {
  const onReload = vi.fn().mockResolvedValue(undefined);
  const onRunGoalAction = vi.fn(async (operation: () => Promise<void>) => {
    try {
      await operation();
      return true;
    } catch {
      return false;
    }
  });
  return {
    onReload,
    onRunGoalAction,
    ...render(
      <PerformanceGoalSection
        detail={createDetail()}
        canManage={false}
        canEvaluate={false}
        canSelf
        actorEmployeeId="employee-1"
        isMutationBusy={false}
        onReload={onReload}
        onRunGoalAction={onRunGoalAction}
        {...overrides}
      />
    ),
  };
};

afterEach(cleanup);
beforeEach(() => request.mockReset());

it('preserves the saved description while an employee edits a proposal', async () => {
  request.mockResolvedValue({ updatePerformanceGoal: { id: 'goal-1' } });
  const { onReload } = renderGoalSection();

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.getByLabelText<HTMLInputElement>('Goal description').value).toBe(
    'Original description'
  );
  fireEvent.change(screen.getByLabelText('Goal title'), { target: { value: 'Ship safely' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save goal' }));

  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('UpdatePerformanceGoalWorkspace'),
      {
        goalId: 'goal-1',
        input: {
          participantId: 'participant-1',
          title: 'Ship safely',
          description: 'Original description',
          weightage: '40',
        },
      }
    )
  );
  expect(onReload).toHaveBeenCalledWith('participant-1');
});

it('retains an employee draft when the save fails', async () => {
  const onRunGoalAction = vi.fn().mockResolvedValue(false);
  renderGoalSection({ onRunGoalAction });

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Goal title'), { target: { value: 'Keep this draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save goal' }));

  await waitFor(() => expect(onRunGoalAction).toHaveBeenCalledTimes(1));
  expect(screen.getByLabelText<HTMLInputElement>('Goal title').value).toBe('Keep this draft');
});

it('clears review-scoped editor state when a different keyed review opens', () => {
  const onReload = vi.fn().mockResolvedValue(undefined);
  const onRunGoalAction = vi.fn().mockResolvedValue(false);
  const view = render(
    <PerformanceGoalSection
      key="participant-1"
      detail={createDetail()}
      canManage={false}
      canEvaluate={false}
      canSelf
      actorEmployeeId="employee-1"
      isMutationBusy={false}
      onReload={onReload}
      onRunGoalAction={onRunGoalAction}
    />
  );
  fireEvent.change(screen.getByLabelText('Goal title'), { target: { value: 'Draft for A' } });

  const detailForB = createDetail();
  detailForB.review.id = 'participant-2';
  view.rerender(
    <PerformanceGoalSection
      key="participant-2"
      detail={detailForB}
      canManage={false}
      canEvaluate={false}
      canSelf
      actorEmployeeId="employee-1"
      isMutationBusy={false}
      onReload={onReload}
      onRunGoalAction={onRunGoalAction}
    />
  );

  expect(screen.getByLabelText<HTMLInputElement>('Goal title').value).toBe('');
});

it('allows employee changes only for proposed goals', () => {
  renderGoalSection({ detail: createDetail('APPROVED') });

  expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
});

it.each([
  {
    label: 'assigned manager',
    canManage: false,
    canEvaluate: true,
    actorEmployeeId: 'manager-1',
    expected: true,
  },
  {
    label: 'manage-only actor without employee identity',
    canManage: true,
    canEvaluate: false,
    actorEmployeeId: undefined,
    expected: true,
  },
  {
    label: 'unrelated manager',
    canManage: false,
    canEvaluate: true,
    actorEmployeeId: 'manager-2',
    expected: false,
  },
])('applies goal authority for $label', ({ canManage, canEvaluate, actorEmployeeId, expected }) => {
  renderGoalSection({ canManage, canEvaluate, canSelf: false, actorEmployeeId });

  expect(Boolean(screen.queryByRole('button', { name: 'Edit' }))).toBe(expected);
});

it('keeps a confirmed removal from running when cancelled', () => {
  const { onRunGoalAction } = renderGoalSection();

  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(onRunGoalAction).not.toHaveBeenCalled();
});

it('disables goal controls during a conflicting participant mutation', () => {
  renderGoalSection({ isMutationBusy: true });

  expect(screen.getByLabelText<HTMLInputElement>('Goal title').disabled).toBe(true);
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Edit' }).disabled).toBe(true);
});

it('presents the active review mutation result', () => {
  renderGoalSection({ mutationMessage: { kind: 'error', text: 'Retry the goal update.' } });

  expect(screen.getByRole('alert').textContent).toBe('Retry the goal update.');
});
