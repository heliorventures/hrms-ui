import type { Dispatch, SetStateAction } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import PerformanceGoalSection from './PerformanceGoalSection';
import PerformanceGoalKpis from './performance-admin/PerformanceGoalKpis';
import type {
  AppraisalQuestionRow,
  PerformanceReviewDetailRow,
} from './performanceLifecycleQueries';
import PerformanceQuestionAnswer, {
  type PerformanceQuestionAnswerValue,
} from './PerformanceQuestionAnswer';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export type PerformanceQuestionResponses = Partial<Record<string, PerformanceQuestionAnswerValue>>;

export interface PerformanceLifecycleReviewDetailProps {
  detail: PerformanceReviewDetailRow;
  canManage: boolean;
  canEvaluate: boolean;
  canSelf: boolean;
  actorEmployeeId?: string;
  responses: PerformanceQuestionResponses;
  setResponses: Dispatch<SetStateAction<PerformanceQuestionResponses>>;
  feedback: string;
  setFeedback: (value: string) => void;
  finalRating: string;
  setFinalRating: (value: string) => void;
  performanceBand: string;
  setPerformanceBand: (value: string) => void;
  acknowledgementComment: string;
  setAcknowledgementComment: (value: string) => void;
  isBusy: (key: string) => boolean;
  isGoalMutationBusy: boolean;
  goalMutationMessage?: { kind: 'error' | 'notice'; text: string };
  onReload: (participantId: string) => Promise<void>;
  onRunGoalAction: (operation: () => Promise<void>, successMessage: string) => Promise<boolean>;
  onApproveGoals: () => void;
  onAddFeedback: () => void;
  onSubmitSelf: () => void;
  onSubmitManager: () => void;
  onAcknowledge: () => void;
}

type DetailPermissions = Pick<
  PerformanceLifecycleReviewDetailProps,
  'canManage' | 'canEvaluate' | 'canSelf' | 'actorEmployeeId'
>;

const getReviewerRole = (stage: string): 'EMPLOYEE' | 'MANAGER' | null => {
  if (stage === 'SELF_REVIEW') return 'EMPLOYEE';
  if (stage === 'MANAGER_REVIEW') return 'MANAGER';
  return null;
};

const isQuestionVisible = (question: AppraisalQuestionRow, stage: string): boolean => {
  if (stage !== 'SELF_REVIEW' && stage !== 'MANAGER_REVIEW') return true;
  const role = getReviewerRole(stage);
  return question.answerer === role || question.answerer === 'BOTH';
};

const canEditQuestions = (detail: PerformanceReviewDetailRow, permissions: DetailPermissions) => {
  const { canEvaluate, canManage, canSelf, actorEmployeeId } = permissions;
  const isOwnReview = detail.review.employeeId === actorEmployeeId;
  if (detail.review.cycleStage === 'SELF_REVIEW') {
    return canSelf && isOwnReview && !detail.review.selfSubmittedAt;
  }
  return (
    detail.review.cycleStage === 'MANAGER_REVIEW' &&
    (canEvaluate || canManage) &&
    !isOwnReview &&
    !detail.review.managerSubmittedAt
  );
};

const canSubmitSelf = (detail: PerformanceReviewDetailRow, permissions: DetailPermissions) =>
  detail.review.cycleStage === 'SELF_REVIEW' &&
  permissions.canSelf &&
  detail.review.employeeId === permissions.actorEmployeeId &&
  !detail.review.selfSubmittedAt;

const canSubmitManager = (detail: PerformanceReviewDetailRow, permissions: DetailPermissions) =>
  detail.review.cycleStage === 'MANAGER_REVIEW' &&
  (permissions.canEvaluate || permissions.canManage) &&
  detail.review.employeeId !== permissions.actorEmployeeId &&
  !detail.review.managerSubmittedAt;

const GoalReview = ({
  detail,
  canManage,
  canEvaluate,
  canSelf,
  actorEmployeeId,
  isGoalMutationBusy,
  goalMutationMessage,
  onReload,
  onRunGoalAction,
  onApproveGoals,
}: DetailPermissions & {
  detail: PerformanceReviewDetailRow;
  isGoalMutationBusy: boolean;
  goalMutationMessage?: { kind: 'error' | 'notice'; text: string };
  onReload: (participantId: string) => Promise<void>;
  onRunGoalAction: (operation: () => Promise<void>, successMessage: string) => Promise<boolean>;
  onApproveGoals: () => void;
}) => (
  <>
    <PerformanceGoalSection
      key={detail.review.id}
      detail={detail}
      canManage={canManage}
      canEvaluate={canEvaluate}
      canSelf={canSelf}
      actorEmployeeId={actorEmployeeId}
      isMutationBusy={isGoalMutationBusy}
      mutationMessage={goalMutationMessage}
      onReload={onReload}
      onRunGoalAction={onRunGoalAction}
    />
    <PerformanceGoalKpis
      key={`${detail.review.id}:${detail.review.responseRevision}:${detail.review.cycleStage}`}
      detail={detail}
      canManage={canManage}
      canEvaluate={canEvaluate}
      canSelf={canSelf}
      actorEmployeeId={actorEmployeeId}
      isMutationBusy={isGoalMutationBusy}
      onReload={onReload}
      onRunGoalAction={onRunGoalAction}
    />
    {(canManage ||
      (canEvaluate &&
        Boolean(actorEmployeeId) &&
        actorEmployeeId === detail.review.managerEmployeeId)) &&
      detail.review.employeeId !== actorEmployeeId &&
      detail.review.cycleStage === 'GOAL_SETTING' && (
        <Button busy={isGoalMutationBusy} className="mt-3" size="sm" onClick={onApproveGoals}>
          Approve goals
        </Button>
      )}
  </>
);

const FeedbackReview = ({
  detail,
  canManage,
  canEvaluate,
  actorEmployeeId,
  feedback,
  setFeedback,
  isBusy,
  onAddFeedback,
}: DetailPermissions & {
  detail: PerformanceReviewDetailRow;
  feedback: string;
  setFeedback: (value: string) => void;
  isBusy: (key: string) => boolean;
  onAddFeedback: () => void;
}) => (
  <>
    <h3 className="mt-5 font-semibold">Manager feedback</h3>
    {detail.feedback.map((item) => (
      <p key={item.id} className="mt-2 rounded-md bg-surface-selected p-3 text-sm">
        <span className="font-medium">{item.observationDate}</span> · {item.comments}
      </p>
    ))}
    {(canEvaluate || canManage) && detail.review.employeeId !== actorEmployeeId && (
      <div className="mt-3 flex gap-2">
        <input
          aria-label="Performance feedback"
          className={fieldClass}
          placeholder="Specific feedback against goals or observed work"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
        />
        <Button busy={isBusy(`add-feedback:${detail.review.id}`)} onClick={onAddFeedback}>
          Add feedback
        </Button>
      </div>
    )}
  </>
);

const AppraisalReview = ({
  detail,
  permissions,
  responses,
  setResponses,
  finalRating,
  setFinalRating,
  performanceBand,
  setPerformanceBand,
  isBusy,
  onSubmitSelf,
  onSubmitManager,
}: {
  detail: PerformanceReviewDetailRow;
  permissions: DetailPermissions;
  responses: PerformanceQuestionResponses;
  setResponses: Dispatch<SetStateAction<PerformanceQuestionResponses>>;
  finalRating: string;
  setFinalRating: (value: string) => void;
  performanceBand: string;
  setPerformanceBand: (value: string) => void;
  isBusy: (key: string) => boolean;
  onSubmitSelf: () => void;
  onSubmitManager: () => void;
}) => {
  const { cycleStage } = detail.review;
  const editable = canEditQuestions(detail, permissions);
  const selfSubmitVisible = canSubmitSelf(detail, permissions);
  const managerSubmitVisible = canSubmitManager(detail, permissions);
  if (detail.template.sections.length === 0) return null;
  return (
    <div className="mt-5 space-y-4">
      <h3 className="font-semibold">Appraisal questions</h3>
      {detail.template.sections
        .flatMap((section) => section.questions)
        .filter((question) => isQuestionVisible(question, cycleStage))
        .map((question) => (
          <PerformanceQuestionAnswer
            key={question.id}
            question={question}
            reviewerRole={getReviewerRole(cycleStage)}
            value={responses[question.id] ?? {}}
            employeeAnswer={detail.answers.find((answer) => answer.questionId === question.id)}
            readOnly={!editable}
            onChange={(value) => setResponses((current) => ({ ...current, [question.id]: value }))}
          />
        ))}
      {selfSubmitVisible && (
        <Button busy={isBusy(`submit-self:${detail.review.id}`)} onClick={onSubmitSelf}>
          Submit self-appraisal
        </Button>
      )}
      {managerSubmitVisible && (
        <div className="grid gap-2 md:grid-cols-[8rem_1fr_auto]">
          <input
            aria-label="Final rating"
            className={fieldClass}
            placeholder="Rating"
            value={finalRating}
            onChange={(event) => setFinalRating(event.target.value)}
          />
          <input
            aria-label="Performance band"
            className={fieldClass}
            placeholder="Performance band (optional)"
            value={performanceBand}
            onChange={(event) => setPerformanceBand(event.target.value)}
          />
          <Button busy={isBusy(`submit-manager:${detail.review.id}`)} onClick={onSubmitManager}>
            Submit manager rating
          </Button>
        </div>
      )}
    </div>
  );
};

const AcknowledgementReview = ({
  detail,
  canSelf,
  actorEmployeeId,
  acknowledgementComment,
  setAcknowledgementComment,
  isBusy,
  onAcknowledge,
}: Pick<DetailPermissions, 'canSelf' | 'actorEmployeeId'> & {
  detail: PerformanceReviewDetailRow;
  acknowledgementComment: string;
  setAcknowledgementComment: (value: string) => void;
  isBusy: (key: string) => boolean;
  onAcknowledge: () => void;
}) => {
  const canAcknowledge =
    detail.review.cycleStage === 'EMPLOYEE_ACKNOWLEDGEMENT' &&
    canSelf &&
    detail.review.employeeId === actorEmployeeId &&
    !detail.review.acknowledgedAt;
  return (
    <>
      {canAcknowledge && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm">
            Acknowledgement comment (optional)
            <textarea
              aria-label="Acknowledgement comment"
              maxLength={2000}
              rows={3}
              className={fieldClass}
              disabled={isBusy(`acknowledge:${detail.review.id}`)}
              value={acknowledgementComment}
              onChange={(event) => setAcknowledgementComment(event.target.value)}
            />
          </label>
          <Button busy={isBusy(`acknowledge:${detail.review.id}`)} onClick={onAcknowledge}>
            Acknowledge appraisal
          </Button>
        </div>
      )}
      {detail.review.acknowledgedAt && (
        <p role="status" className="mt-4 text-sm text-status-success">
          Appraisal acknowledged.
        </p>
      )}
    </>
  );
};

const PerformanceLifecycleReviewDetail = ({
  detail,
  canManage,
  canEvaluate,
  canSelf,
  actorEmployeeId,
  responses,
  setResponses,
  feedback,
  setFeedback,
  finalRating,
  setFinalRating,
  performanceBand,
  setPerformanceBand,
  acknowledgementComment,
  setAcknowledgementComment,
  isBusy,
  isGoalMutationBusy,
  goalMutationMessage,
  onReload,
  onRunGoalAction,
  onApproveGoals,
  onAddFeedback,
  onSubmitSelf,
  onSubmitManager,
  onAcknowledge,
}: PerformanceLifecycleReviewDetailProps) => {
  const permissions = { canManage, canEvaluate, canSelf, actorEmployeeId };
  return (
    <Card title={`${detail.review.employeeName} · ${detail.review.cycleName}`}>
      <p className="text-sm text-content-secondary">
        Stage: {detail.review.cycleStage.replace(/_/g, ' ')}
      </p>
      {detail.review.finalRating && (
        <p className="mt-2 text-sm">
          Final rating: {detail.review.finalRating}
          {detail.review.performanceBand ? ` · ${detail.review.performanceBand}` : ''}
        </p>
      )}
      <GoalReview
        detail={detail}
        {...permissions}
        isGoalMutationBusy={isGoalMutationBusy}
        goalMutationMessage={goalMutationMessage}
        onReload={onReload}
        onRunGoalAction={onRunGoalAction}
        onApproveGoals={onApproveGoals}
      />
      <FeedbackReview
        detail={detail}
        {...permissions}
        feedback={feedback}
        setFeedback={setFeedback}
        isBusy={isBusy}
        onAddFeedback={onAddFeedback}
      />
      <AppraisalReview
        detail={detail}
        permissions={permissions}
        responses={responses}
        setResponses={setResponses}
        finalRating={finalRating}
        setFinalRating={setFinalRating}
        performanceBand={performanceBand}
        setPerformanceBand={setPerformanceBand}
        isBusy={isBusy}
        onSubmitSelf={onSubmitSelf}
        onSubmitManager={onSubmitManager}
      />
      <AcknowledgementReview
        detail={detail}
        canSelf={canSelf}
        actorEmployeeId={actorEmployeeId}
        acknowledgementComment={acknowledgementComment}
        setAcknowledgementComment={setAcknowledgementComment}
        isBusy={isBusy}
        onAcknowledge={onAcknowledge}
      />
    </Card>
  );
};

export default PerformanceLifecycleReviewDetail;
