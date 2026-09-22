import { useCallback, type MutableRefObject } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  AcknowledgePerformanceReviewDocument,
  AddPerformanceFeedbackDocument,
  SubmitManagerAppraisalDocument,
  SubmitSelfAppraisalDocument,
  type PerformanceReviewDetailRow,
} from './performanceLifecycleQueries';
import type { PerformanceQuestionResponses } from './PerformanceLifecycleReviewDetail';

type RunAction = ReturnType<typeof useKeyedAction>['run'];

interface Props {
  acknowledgementComment: string;
  feedback: string;
  finalRating: string;
  loadReviewDetail: (id: string, select?: boolean, expectedRevision?: number) => Promise<void>;
  performanceBand: string;
  responses: PerformanceQuestionResponses;
  run: RunAction;
  selectedReviewId: MutableRefObject<string | null>;
  selectedReviewRevision: MutableRefObject<number>;
  setAcknowledgementComment: (value: string) => void;
  setFeedback: (value: string) => void;
}

const answerPayload = (
  detail: PerformanceReviewDetailRow,
  responses: PerformanceQuestionResponses,
  role: 'EMPLOYEE' | 'MANAGER'
) =>
  detail.template.sections
    .flatMap((section) => section.questions)
    .filter((question) => question.answerer === role || question.answerer === 'BOTH')
    .map((question) => ({
      questionId: question.id,
      textAnswer: responses[question.id]?.text?.trim() || null,
      rating: responses[question.id]?.rating?.trim() || null,
      selectedOptionIds: responses[question.id]?.options ?? [],
    }));

export const usePerformanceReviewActions = ({
  acknowledgementComment,
  feedback,
  finalRating,
  loadReviewDetail,
  performanceBand,
  responses,
  run,
  selectedReviewId,
  selectedReviewRevision,
  setAcknowledgementComment,
  setFeedback,
}: Props) => {
  const client = useGraphClient('client');

  const isCurrent = useCallback(
    (participantId: string, revision: number) =>
      selectedReviewId.current === participantId && selectedReviewRevision.current === revision,
    [selectedReviewId, selectedReviewRevision]
  );

  const reloadCurrent = useCallback(
    (participantId: string, revision: number) =>
      loadReviewDetail(participantId, false, revision),
    [loadReviewDetail]
  );

  const addFeedback = useCallback(
    (detail: PerformanceReviewDetailRow) => {
      const revision = selectedReviewRevision.current;
      void run(
        `add-feedback:${detail.review.id}`,
        async () => {
          await client.request(AddPerformanceFeedbackDocument, {
            input: {
              participantId: detail.review.id,
              observationDate: new Date().toISOString().slice(0, 10),
              comments: feedback,
            },
          });
          if (isCurrent(detail.review.id, revision)) setFeedback('');
          await reloadCurrent(detail.review.id, revision);
        },
        'Feedback recorded and visible to the employee.',
        () => isCurrent(detail.review.id, revision)
      );
    },
    [client, feedback, isCurrent, reloadCurrent, run, selectedReviewRevision, setFeedback]
  );

  const submitSelf = useCallback(
    (detail: PerformanceReviewDetailRow) => {
      const revision = selectedReviewRevision.current;
      void run(
        `submit-self:${detail.review.id}`,
        async () => {
          await client.request(SubmitSelfAppraisalDocument, {
            id: detail.review.id,
            answers: answerPayload(detail, responses, 'EMPLOYEE'),
            expectedRevision: detail.review.responseRevision,
          });
          await reloadCurrent(detail.review.id, revision);
        },
        'Self-appraisal submitted.',
        () => isCurrent(detail.review.id, revision)
      );
    },
    [client, reloadCurrent, responses, run, selectedReviewRevision]
  );

  const submitManager = useCallback(
    (detail: PerformanceReviewDetailRow) => {
      const revision = selectedReviewRevision.current;
      void run(
        `submit-manager:${detail.review.id}`,
        async () => {
          await client.request(SubmitManagerAppraisalDocument, {
            id: detail.review.id,
            answers: answerPayload(detail, responses, 'MANAGER'),
            rating: finalRating,
            band: performanceBand || null,
            expectedRevision: detail.review.responseRevision,
          });
          await reloadCurrent(detail.review.id, revision);
        },
        'Manager appraisal submitted.',
        () => isCurrent(detail.review.id, revision)
      );
    },
    [client, finalRating, performanceBand, reloadCurrent, responses, run, selectedReviewRevision]
  );

  const acknowledge = useCallback(
    (detail: PerformanceReviewDetailRow) => {
      const revision = selectedReviewRevision.current;
      void run(
        `acknowledge:${detail.review.id}`,
        async () => {
          await client.request(AcknowledgePerformanceReviewDocument, {
            id: detail.review.id,
            comment: acknowledgementComment.trim() || null,
            expectedRevision: detail.review.responseRevision,
          });
          if (isCurrent(detail.review.id, revision)) setAcknowledgementComment('');
          await reloadCurrent(detail.review.id, revision);
        },
        'Appraisal acknowledged.',
        () => isCurrent(detail.review.id, revision)
      );
    },
    [
      acknowledgementComment,
      client,
      isCurrent,
      reloadCurrent,
      run,
      selectedReviewRevision,
      setAcknowledgementComment,
    ]
  );

  return {
    acknowledge,
    addFeedback,
    submitManager,
    submitSelf,
  };
};
