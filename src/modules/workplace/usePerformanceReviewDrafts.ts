import { useCallback, useRef, useState } from 'react';

import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';
import type { PerformanceQuestionResponses } from './PerformanceLifecycleReviewDetail';

const responsesFor = (
  detail: PerformanceReviewDetailRow,
  role: 'EMPLOYEE' | 'MANAGER'
): PerformanceQuestionResponses =>
  Object.fromEntries(
    detail.template.sections
      .flatMap((section) => section.questions)
      .filter((question) => question.answerer === role || question.answerer === 'BOTH')
      .map((question) => {
        const answer = detail.answers.find((item) => item.questionId === question.id);
        const value =
          role === 'EMPLOYEE'
            ? {
                text: answer?.employeeTextAnswer ?? '',
                rating: answer?.selfRating ?? '',
                options: answer?.employeeSelectedOptionIds ?? [],
              }
            : {
                text: answer?.managerTextAnswer ?? '',
                rating: answer?.managerRating ?? '',
                options: answer?.managerSelectedOptionIds ?? [],
              };
        return [question.id, value];
      })
  );

export const usePerformanceReviewDrafts = () => {
  const [acknowledgementComment, setAcknowledgementComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [finalRating, setFinalRating] = useState('');
  const [performanceBand, setPerformanceBand] = useState('');
  const [responses, setResponses] = useState<PerformanceQuestionResponses>({});
  const hydratedRevision = useRef<string | null>(null);

  const resetReviewDrafts = useCallback(() => {
    hydratedRevision.current = null;
    setResponses({});
    setAcknowledgementComment('');
    setFeedback('');
    setFinalRating('');
    setPerformanceBand('');
  }, []);

  const hydrateReviewDrafts = useCallback((detail: PerformanceReviewDetailRow) => {
    const role = detail.review.cycleStage === 'MANAGER_REVIEW' ? 'MANAGER' : 'EMPLOYEE';
    const revisionKey = `${detail.review.id}:${detail.review.responseRevision}:${role}`;
    if (hydratedRevision.current === revisionKey) return;
    hydratedRevision.current = revisionKey;
    setResponses(responsesFor(detail, role));
    setAcknowledgementComment('');
    setFeedback('');
    setFinalRating(role === 'MANAGER' ? (detail.review.finalRating ?? '') : '');
    setPerformanceBand(role === 'MANAGER' ? (detail.review.performanceBand ?? '') : '');
  }, []);

  return {
    acknowledgementComment,
    feedback,
    finalRating,
    hydrateReviewDrafts,
    performanceBand,
    resetReviewDrafts,
    responses,
    setAcknowledgementComment,
    setFeedback,
    setFinalRating,
    setPerformanceBand,
    setResponses,
  };
};
