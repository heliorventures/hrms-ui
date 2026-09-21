import { useCallback, useState } from 'react';

import type { PerformanceQuestionResponses } from './PerformanceLifecycleReviewDetail';

export const usePerformanceReviewDrafts = () => {
  const [acknowledgementComment, setAcknowledgementComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [finalRating, setFinalRating] = useState('');
  const [performanceBand, setPerformanceBand] = useState('');
  const [responses, setResponses] = useState<PerformanceQuestionResponses>({});

  const resetReviewDrafts = useCallback(() => {
    setResponses({});
    setAcknowledgementComment('');
    setFeedback('');
    setFinalRating('');
    setPerformanceBand('');
  }, []);

  return {
    acknowledgementComment,
    feedback,
    finalRating,
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
