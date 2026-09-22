// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { PerformanceReviewDetailRow } from '../performanceLifecycleQueries';

import PerformanceGoalKpis from './PerformanceGoalKpis';

const state = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));

const detailFor = (participantId: string): PerformanceReviewDetailRow =>
  ({
    review: {
      id: participantId,
      employeeId: 'employee-1',
      employeeName: 'Employee',
      cycleName: 'Annual',
      cycleStage: 'GOAL_SETTING',
      responseRevision: 1,
    },
    goals: [{ id: 'shared-goal', title: 'Shared goal' }],
    feedback: [],
    answers: [],
    template: { sections: [] },
  }) as unknown as PerformanceReviewDetailRow;

const kpiIdentity = (detail: PerformanceReviewDetailRow) =>
  `${detail.review.id}:${detail.review.responseRevision}:${detail.review.cycleStage}`;

const renderKpis = (detail: PerformanceReviewDetailRow) =>
  render(
    <PerformanceGoalKpis
      key={kpiIdentity(detail)}
      detail={detail}
      canManage
      canEvaluate={false}
      canSelf={false}
      isMutationBusy={false}
      onReload={async () => undefined}
      onRunGoalAction={async (operation) => {
        await operation();
        return true;
      }}
    />
  );

afterEach(cleanup);

it('clears a KPI target draft when the participant identity changes', async () => {
  state.request.mockReset();
  state.request.mockResolvedValue({ performanceGoalKpis: [] });
  const firstDetail = detailFor('participant-a');
  const { rerender } = renderKpis(firstDetail);

  fireEvent.click(await screen.findByRole('button', { name: 'Add KPI target' }));
  fireEvent.change(screen.getByLabelText('KPI metric'), { target: { value: 'Draft KPI' } });

  const nextDetail = detailFor('participant-b');
  rerender(
    <PerformanceGoalKpis
      key={kpiIdentity(nextDetail)}
      detail={nextDetail}
      canManage
      canEvaluate={false}
      canSelf={false}
      isMutationBusy={false}
      onReload={async () => undefined}
      onRunGoalAction={async (operation) => {
        await operation();
        return true;
      }}
    />
  );

  expect(screen.queryByLabelText('KPI metric')).toBeNull();
});
