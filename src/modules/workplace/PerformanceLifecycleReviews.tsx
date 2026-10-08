import PerformanceLifecycleReviewDetail from './PerformanceLifecycleReviewDetail';
import PerformanceReviewList from './PerformanceReviewList';
import type { usePerformanceGoalActions } from './usePerformanceGoalActions';
import type { usePerformanceLifecycleActions } from './usePerformanceLifecycleActions';
import type { usePerformanceReviewActions } from './usePerformanceReviewActions';
import type { usePerformanceReviewData } from './usePerformanceReviewData';
import type { usePerformanceReviewDrafts } from './usePerformanceReviewDrafts';

interface Props {
  actorEmployeeId?: string;
  canEvaluate: boolean;
  canManage: boolean;
  canSelf: boolean;
  detailRevision: number;
  goalActions: ReturnType<typeof usePerformanceGoalActions>;
  isBusy: (key: string) => boolean;
  lifecycleActions: ReturnType<typeof usePerformanceLifecycleActions>;
  reviewActions: ReturnType<typeof usePerformanceReviewActions>;
  reviewData: ReturnType<typeof usePerformanceReviewData>;
  reviewDrafts: ReturnType<typeof usePerformanceReviewDrafts>;
  showProcess: boolean;
  showSelf: boolean;
  showTeam: boolean;
  tab: string;
}

const isVisibleReview = (
  employeeId: string,
  actorEmployeeId: string | undefined,
  showSelf: boolean,
  showTeam: boolean
) =>
  (showSelf && employeeId === actorEmployeeId) || (showTeam && employeeId !== actorEmployeeId);

const PerformanceLifecycleReviews = ({
  actorEmployeeId,
  canEvaluate,
  canManage,
  canSelf,
  detailRevision,
  goalActions,
  isBusy,
  lifecycleActions,
  reviewActions,
  reviewData,
  reviewDrafts,
  showProcess,
  showSelf,
  showTeam,
  tab,
}: Props) => {
  const detail = reviewData.detail;
  const visibleDetail =
    detail && isVisibleReview(detail.review.employeeId, actorEmployeeId, showSelf, showTeam)
      ? detail
      : null;

  return (
    <>
      {(showSelf || showTeam) && (
        <PerformanceReviewList
          canManage={canManage}
          canSelf={canSelf}
          isBusy={isBusy}
          onAdvance={lifecycleActions.advanceCycle}
          onOpen={(reviewId) => void reviewData.openReview(reviewId)}
          reviews={reviewData.allReviews}
          showProcess={showProcess}
          showSelf={showSelf}
          tab={tab}
        />
      )}
      {visibleDetail && (
        <PerformanceLifecycleReviewDetail
          detail={visibleDetail}
          canManage={canManage}
          canEvaluate={canEvaluate}
          canSelf={canSelf}
          actorEmployeeId={actorEmployeeId}
          responses={reviewDrafts.responses}
          setResponses={reviewDrafts.setResponses}
          feedback={reviewDrafts.feedback}
          setFeedback={reviewDrafts.setFeedback}
          finalRating={reviewDrafts.finalRating}
          setFinalRating={reviewDrafts.setFinalRating}
          performanceBand={reviewDrafts.performanceBand}
          setPerformanceBand={reviewDrafts.setPerformanceBand}
          acknowledgementComment={reviewDrafts.acknowledgementComment}
          setAcknowledgementComment={reviewDrafts.setAcknowledgementComment}
          isBusy={isBusy}
          isGoalMutationBusy={goalActions.isBusy(visibleDetail.review.id)}
          goalMutationMessage={
            goalActions.result?.participantId === visibleDetail.review.id
              ? { kind: goalActions.result.kind, text: goalActions.result.message }
              : undefined
          }
          onReload={(participantId) =>
            reviewData.loadReviewDetail(participantId, false, detailRevision)
          }
          onRunGoalAction={(operation, successMessage) =>
            lifecycleActions.runGoalAction(
              visibleDetail.review.id,
              detailRevision,
              operation,
              successMessage
            )
          }
          onApproveGoals={() => lifecycleActions.approveGoals(visibleDetail)}
          onAddFeedback={() => reviewActions.addFeedback(visibleDetail)}
          onSubmitSelf={() => reviewActions.submitSelf(visibleDetail)}
          onSubmitManager={() => reviewActions.submitManager(visibleDetail)}
          onAcknowledge={() => reviewActions.acknowledge(visibleDetail)}
        />
      )}
    </>
  );
};

export default PerformanceLifecycleReviews;
