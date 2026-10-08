import { useState } from 'react';

import { useKeyedAction } from '../../hooks/useKeyedAction';

import PerformanceLifecyclePanelContent from './PerformanceLifecyclePanelContent';
import { usePerformanceGoalActions } from './usePerformanceGoalActions';
import { usePerformanceLifecycleActions } from './usePerformanceLifecycleActions';
import { usePerformanceProgramActions } from './usePerformanceProgramActions';
import { usePerformanceReviewActions } from './usePerformanceReviewActions';
import { usePerformanceReviewData } from './usePerformanceReviewData';
import { usePerformanceReviewDrafts } from './usePerformanceReviewDrafts';
import { usePerformanceSetupData } from './usePerformanceSetupData';
import { usePerformanceTemplateActions } from './usePerformanceTemplateActions';

interface Props {
  actorEmployeeId?: string;
  canEvaluate: boolean;
  canManage: boolean;
  canSelf: boolean;
  initialReviewId?: string | null;
  tab: string;
}

const currentDate = () => new Date().toISOString().slice(0, 10);

const PerformanceLifecyclePanel = ({
  actorEmployeeId,
  canEvaluate,
  canManage,
  canSelf,
  initialReviewId,
  tab,
}: Props) => {
  const { error, isBusy, notice, run, setError } = useKeyedAction();
  const goalActions = usePerformanceGoalActions();
  const { clearResult: clearGoalResult, runGoalAction: runSerializedGoalAction } = goalActions;
  const showSetup = canManage && tab === 'setup';
  const showProcess = canManage && tab === 'process';
  const showAdministration = canManage && tab === 'administration';
  const showAdmin = showSetup || showProcess || showAdministration;
  const showTeam =
    (canEvaluate || canManage) && (tab === 'team' || tab === 'review' || showProcess);
  const showSelf = canSelf && tab === 'my';
  const [programDraft, setProgramDraft] = useState({
    name: '',
    cadence: 'QUARTERLY',
    anchorDate: currentDate(),
    includeCalibration: false,
    includeAcknowledgement: true,
  });
  const [periodDate, setPeriodDate] = useState(currentDate());
  const setup = usePerformanceSetupData({ run, setError, showAdmin });
  const reviewDrafts = usePerformanceReviewDrafts();
  const reviewData = usePerformanceReviewData({
    actorEmployeeId,
    clearGoalResult,
    hydrateReviewDrafts: reviewDrafts.hydrateReviewDrafts,
    initialReviewId,
    run,
    showProcess,
    showSelf,
    showTeam,
    tab,
  });
  const reviewActions = usePerformanceReviewActions({
    acknowledgementComment: reviewDrafts.acknowledgementComment,
    feedback: reviewDrafts.feedback,
    finalRating: reviewDrafts.finalRating,
    loadReviewDetail: reviewData.loadReviewDetail,
    performanceBand: reviewDrafts.performanceBand,
    responses: reviewDrafts.responses,
    run,
    selectedReviewId: reviewData.selectedReviewId,
    selectedReviewRevision: reviewData.selectedReviewRevision,
    setAcknowledgementComment: reviewDrafts.setAcknowledgementComment,
    setFeedback: reviewDrafts.setFeedback,
  });
  const { activateProgram, saveProgram } = usePerformanceProgramActions({
    loadPrograms: setup.loadPrograms,
    programDraft,
    run,
    setProgramDraft,
  });
  const templateActions = usePerformanceTemplateActions({
    loadTemplates: setup.loadTemplates,
    run,
    selectedProgram: setup.selectedProgram,
  });
  const activeProgram = setup.programs.find((program) => program.id === setup.selectedProgram);
  const detailRevision = reviewData.selectedReviewRevision.current;
  const lifecycleActions = usePerformanceLifecycleActions({
    launchTemplateId: setup.launchTemplateId,
    loadReviewDetail: reviewData.loadReviewDetail,
    loadReviews: reviewData.loadReviews,
    periodDate,
    run,
    runSerializedGoalAction,
    selectedProgram: setup.selectedProgram,
    selectedReviewId: reviewData.selectedReviewId,
    selectedReviewRevision: reviewData.selectedReviewRevision,
  });

  return (
    <div className="space-y-4">
      {notice && (
        <p role="status" className="text-sm text-status-success">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      )}
      <PerformanceLifecyclePanelContent
        activeProgram={activeProgram}
        actorEmployeeId={actorEmployeeId}
        canEvaluate={canEvaluate}
        canManage={canManage}
        canSelf={canSelf}
        detailRevision={detailRevision}
        goalActions={goalActions}
        isBusy={isBusy}
        lifecycleActions={lifecycleActions}
        periodDate={periodDate}
        programActions={{ activateProgram, saveProgram }}
        programDraft={programDraft}
        reviewActions={reviewActions}
        reviewData={reviewData}
        reviewDrafts={reviewDrafts}
        setPeriodDate={setPeriodDate}
        setProgramDraft={setProgramDraft}
        setup={setup}
        showAdministration={showAdministration}
        showSetup={showSetup}
        showProcess={showProcess}
        showSelf={showSelf}
        showTeam={showTeam}
        tab={tab}
        templateActions={templateActions}
      />
    </div>
  );
};

export default PerformanceLifecyclePanel;
