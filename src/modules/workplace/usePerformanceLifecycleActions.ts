import { useCallback, type MutableRefObject } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  AdvancePerformanceCycleDocument,
  ApprovePerformanceGoalsDocument,
  LaunchPerformanceCycleDocument,
  type PerformanceReviewDetailRow,
  type PerformanceReviewRow,
} from './performanceLifecycleQueries';
import type { usePerformanceGoalActions } from './usePerformanceGoalActions';

type RunAction = ReturnType<typeof useKeyedAction>['run'];
type RunGoalAction = ReturnType<typeof usePerformanceGoalActions>['runGoalAction'];

interface Props {
  launchTemplateId: string;
  loadReviewDetail: (id: string, select?: boolean, expectedRevision?: number) => Promise<void>;
  loadReviews: () => Promise<void>;
  periodDate: string;
  run: RunAction;
  runSerializedGoalAction: RunGoalAction;
  selectedProgram: string;
  selectedReviewId: MutableRefObject<string | null>;
  selectedReviewRevision: MutableRefObject<number>;
}

export const usePerformanceLifecycleActions = ({
  launchTemplateId,
  loadReviewDetail,
  loadReviews,
  periodDate,
  run,
  runSerializedGoalAction,
  selectedProgram,
  selectedReviewId,
  selectedReviewRevision,
}: Props) => {
  const client = useGraphClient('client');

  const runGoalAction = useCallback(
    (
      participantId: string,
      revision: number,
      operation: () => Promise<void>,
      successMessage: string
    ) =>
      runSerializedGoalAction({
        participantId,
        operation,
        successMessage,
        isCurrent: () =>
          selectedReviewId.current === participantId && selectedReviewRevision.current === revision,
      }),
    [runSerializedGoalAction, selectedReviewId, selectedReviewRevision]
  );

  const approveGoals = useCallback(
    (detail: PerformanceReviewDetailRow) => {
      const revision = selectedReviewRevision.current;
      void runGoalAction(
        detail.review.id,
        revision,
        async () => {
          await client.request(ApprovePerformanceGoalsDocument, { id: detail.review.id });
          await loadReviewDetail(detail.review.id, false, revision);
        },
        'Goals approved.'
      );
    },
    [client, loadReviewDetail, runGoalAction, selectedReviewRevision]
  );

  const launchCycle = useCallback(() => {
    void run(
      `launch-cycle:${selectedProgram}`,
      async () => {
        await client.request(LaunchPerformanceCycleDocument, {
          input: {
            performanceProgramId: selectedProgram,
            appraisalTemplateId: launchTemplateId,
            periodDate,
          },
        });
        await loadReviews();
      },
      'Appraisal cycle launched for eligible employees.'
    );
  }, [client, launchTemplateId, loadReviews, periodDate, run, selectedProgram]);

  const advanceCycle = useCallback(
    (review: PerformanceReviewRow) => {
      const revision = selectedReviewRevision.current;
      void run(
        `advance:${review.reviewCycleId}`,
        async () => {
          await client.request(AdvancePerformanceCycleDocument, { id: review.reviewCycleId });
          await loadReviews();
          await loadReviewDetail(review.id, false, revision);
        },
        'Cycle moved to its next configured step.',
        () =>
          selectedReviewId.current === review.id && selectedReviewRevision.current === revision
      );
    },
    [client, loadReviewDetail, loadReviews, run, selectedReviewRevision]
  );

  return { advanceCycle, approveGoals, launchCycle, runGoalAction };
};
