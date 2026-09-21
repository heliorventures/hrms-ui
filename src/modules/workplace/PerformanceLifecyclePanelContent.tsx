import type { Dispatch, SetStateAction } from 'react';

import PerformanceLifecycleReviews from './PerformanceLifecycleReviews';
import PerformanceLifecycleSetup from './PerformanceLifecycleSetup';
import type { usePerformanceGoalActions } from './usePerformanceGoalActions';
import type { usePerformanceLifecycleActions } from './usePerformanceLifecycleActions';
import type { PerformanceProgramDraft } from './usePerformanceProgramActions';
import type { usePerformanceReviewActions } from './usePerformanceReviewActions';
import type { usePerformanceReviewData } from './usePerformanceReviewData';
import type { usePerformanceReviewDrafts } from './usePerformanceReviewDrafts';
import type { usePerformanceSetupData } from './usePerformanceSetupData';
import type { usePerformanceTemplateActions } from './usePerformanceTemplateActions';

interface Props {
  activeProgram: ReturnType<typeof usePerformanceSetupData>['programs'][number] | undefined;
  actorEmployeeId?: string;
  canEvaluate: boolean;
  canManage: boolean;
  canSelf: boolean;
  detailRevision: number;
  goalActions: ReturnType<typeof usePerformanceGoalActions>;
  isBusy: (key: string) => boolean;
  lifecycleActions: ReturnType<typeof usePerformanceLifecycleActions>;
  periodDate: string;
  programActions: { activateProgram: (programId: string) => void; saveProgram: () => void };
  programDraft: PerformanceProgramDraft;
  reviewActions: ReturnType<typeof usePerformanceReviewActions>;
  reviewData: ReturnType<typeof usePerformanceReviewData>;
  reviewDrafts: ReturnType<typeof usePerformanceReviewDrafts>;
  setPeriodDate: Dispatch<SetStateAction<string>>;
  setProgramDraft: Dispatch<SetStateAction<PerformanceProgramDraft>>;
  setup: ReturnType<typeof usePerformanceSetupData>;
  showProcess: boolean;
  showSelf: boolean;
  showSetup: boolean;
  showTeam: boolean;
  tab: string;
  templateActions: ReturnType<typeof usePerformanceTemplateActions>;
}

const PerformanceLifecyclePanelContent = ({
  activeProgram,
  actorEmployeeId,
  canEvaluate,
  canManage,
  canSelf,
  detailRevision,
  goalActions,
  isBusy,
  lifecycleActions,
  periodDate,
  programActions,
  programDraft,
  reviewActions,
  reviewData,
  reviewDrafts,
  setPeriodDate,
  setProgramDraft,
  setup,
  showProcess,
  showSelf,
  showSetup,
  showTeam,
  tab,
  templateActions,
}: Props) => {
  return (
    <>
      <PerformanceLifecycleSetup
        activeProgram={activeProgram}
        isBusy={isBusy}
        launchTemplateId={setup.launchTemplateId}
        onActivateProgram={programActions.activateProgram}
        onAddQuestion={templateActions.addQuestion}
        onLaunchCycle={lifecycleActions.launchCycle}
        onPeriodDateChange={setPeriodDate}
        onProgramDraftChange={setProgramDraft}
        onPublishTemplate={templateActions.publishTemplate}
        onRemoveQuestion={templateActions.removeQuestion}
        onSaveProgram={programActions.saveProgram}
        onSaveTemplate={templateActions.saveTemplate}
        onSelectedProgramChange={showProcess ? setup.selectProcess : setup.setSelectedProgram}
        onTemplateNameChange={templateActions.setTemplateName}
        onTemplateSelectionChange={setup.setSelectedTemplate}
        onUpdateQuestion={templateActions.updateQuestion}
        periodDate={periodDate}
        programDraft={programDraft}
        programs={setup.programs}
        publishedTemplates={setup.publishedTemplates}
        questions={templateActions.questions}
        selectedProgram={setup.selectedProgram}
        showProcess={showProcess}
        showSetup={showSetup}
        templateName={templateActions.templateName}
        templates={setup.templates}
      />
      <PerformanceLifecycleReviews
        actorEmployeeId={actorEmployeeId}
        canEvaluate={canEvaluate}
        canManage={canManage}
        canSelf={canSelf}
        detailRevision={detailRevision}
        goalActions={goalActions}
        isBusy={isBusy}
        lifecycleActions={lifecycleActions}
        reviewActions={reviewActions}
        reviewData={reviewData}
        reviewDrafts={reviewDrafts}
        showProcess={showProcess}
        showSelf={showSelf}
        showTeam={showTeam}
        tab={tab}
      />
    </>
  );
};

export default PerformanceLifecyclePanelContent;
