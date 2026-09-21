import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  MyPerformanceReviewsDocument,
  PerformanceReviewDetailDocument,
  TeamPerformanceReviewsDocument,
  type PerformanceReviewDetailRow,
  type PerformanceReviewRow,
} from './performanceLifecycleQueries';

type RunAction = ReturnType<typeof useKeyedAction>['run'];

interface UsePerformanceReviewDataOptions {
  actorEmployeeId?: string;
  clearGoalResult: () => void;
  initialReviewId?: string | null;
  resetReviewDrafts: () => void;
  run: RunAction;
  showProcess: boolean;
  showSelf: boolean;
  showTeam: boolean;
  tab: string;
}

export const usePerformanceReviewData = ({
  actorEmployeeId,
  clearGoalResult,
  initialReviewId,
  resetReviewDrafts,
  run,
  showProcess,
  showSelf,
  showTeam,
  tab,
}: UsePerformanceReviewDataOptions) => {
  const client = useGraphClient('client');
  const [selfReviews, setSelfReviews] = useState<PerformanceReviewRow[]>([]);
  const [teamReviews, setTeamReviews] = useState<PerformanceReviewRow[]>([]);
  const [detail, setDetail] = useState<PerformanceReviewDetailRow | null>(null);
  const detailRequest = useRef(0);
  const selectedReviewId = useRef<string | null>(null);
  const selectedReviewRevision = useRef(0);

  const loadReviews = useCallback(async () => {
    const tasks: Promise<void>[] = [];
    if (showSelf) {
      tasks.push(
        client
          .request<{ myPerformanceReviews: PerformanceReviewRow[] }>(MyPerformanceReviewsDocument)
          .then((result) => setSelfReviews(result.myPerformanceReviews))
      );
    }
    if (showTeam) {
      tasks.push(
        client
          .request<{
            myTeamPerformanceReviews: PerformanceReviewRow[];
          }>(TeamPerformanceReviewsDocument)
          .then((result) => setTeamReviews(result.myTeamPerformanceReviews))
      );
    }
    await Promise.all(tasks);
  }, [client, showSelf, showTeam]);

  const selectReview = useCallback(
    (id: string) => {
      const isDistinctReview = selectedReviewId.current !== id;
      if (isDistinctReview) {
        selectedReviewId.current = id;
        selectedReviewRevision.current += 1;
        clearGoalResult();
      }
      return isDistinctReview;
    },
    [clearGoalResult]
  );

  const loadReviewDetail = useCallback(
    async (id: string, select = false, expectedRevision?: number) => {
      const resetDrafts = select && selectReview(id);
      const isExpectedRevision =
        expectedRevision === undefined || selectedReviewRevision.current === expectedRevision;
      const isActiveRequest =
        isExpectedRevision && (resetDrafts || selectedReviewId.current === id);
      const requestId = isActiveRequest ? ++detailRequest.current : detailRequest.current;
      if (!isActiveRequest) return;
      const result = await client.request<{
        performanceReviewDetail: PerformanceReviewDetailRow;
      }>(PerformanceReviewDetailDocument, { participantId: id });

      setSelfReviews((rows) =>
        rows.map((row) => (row.id === id ? result.performanceReviewDetail.review : row))
      );
      setTeamReviews((rows) =>
        rows.map((row) => (row.id === id ? result.performanceReviewDetail.review : row))
      );
      if (
        !isActiveRequest ||
        requestId !== detailRequest.current ||
        selectedReviewId.current !== id ||
        (expectedRevision !== undefined && selectedReviewRevision.current !== expectedRevision)
      )
        return;

      setDetail(result.performanceReviewDetail);
      if (resetDrafts) resetReviewDrafts();
    },
    [client, resetReviewDrafts, selectReview]
  );

  const openReview = useCallback(
    (id: string) => run(`open:${id}`, () => loadReviewDetail(id, true), ''),
    [loadReviewDetail, run]
  );

  useEffect(() => {
    void run(`reviews:${tab}`, loadReviews, '');
  }, [loadReviews, run, tab]);

  useEffect(() => {
    if (initialReviewId && (showSelf || showTeam)) void openReview(initialReviewId);
  }, [initialReviewId, openReview, showSelf, showTeam]);

  const allReviews = useMemo(() => {
    const rows = new Map<string, { row: PerformanceReviewRow; lane: 'self' | 'team' }>();
    if (showSelf) selfReviews.forEach((row) => rows.set(row.id, { row, lane: 'self' }));
    if (showTeam)
      teamReviews
        .filter((row) => showProcess || row.employeeId !== actorEmployeeId)
        .forEach((row) =>
          rows.set(row.id, {
            row,
            lane: row.employeeId === actorEmployeeId ? 'self' : 'team',
          })
        );
    return [...rows.values()];
  }, [actorEmployeeId, selfReviews, showProcess, showSelf, showTeam, teamReviews]);

  return {
    allReviews,
    detail,
    loadReviewDetail,
    loadReviews,
    openReview,
    selectedReviewId,
    selectedReviewRevision,
  };
};
