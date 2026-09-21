import PerformanceAppraisalTemplateSetup from './PerformanceAppraisalTemplateSetup';
import PerformanceCycleLaunchCards from './PerformanceCycleLaunchCards';
import type { DraftQuestion } from './performanceDraftQuestion';
import type { AppraisalTemplateRow, PerformanceProgramRow } from './performanceLifecycleQueries';
import PerformanceProgramSetupCard from './PerformanceProgramSetupCard';
import type { PerformanceProgramDraft } from './usePerformanceProgramActions';

interface Props {
  activeProgram?: PerformanceProgramRow;
  isBusy: (key: string) => boolean;
  launchTemplateId: string;
  onActivateProgram: (programId: string) => void;
  onAddQuestion: () => void;
  onLaunchCycle: () => void;
  onPeriodDateChange: (date: string) => void;
  onProgramDraftChange: (draft: PerformanceProgramDraft) => void;
  onPublishTemplate: (templateId: string) => void;
  onRemoveQuestion: (index: number) => void;
  onSaveProgram: () => void;
  onSaveTemplate: () => void;
  onSelectedProgramChange: (programId: string) => void;
  onTemplateNameChange: (templateName: string) => void;
  onTemplateSelectionChange: (templateId: string) => void;
  onUpdateQuestion: (index: number, patch: Partial<DraftQuestion>) => void;
  periodDate: string;
  programDraft: PerformanceProgramDraft;
  programs: PerformanceProgramRow[];
  publishedTemplates: AppraisalTemplateRow[];
  questions: DraftQuestion[];
  selectedProgram: string;
  showProcess: boolean;
  showSetup: boolean;
  templateName: string;
  templates: AppraisalTemplateRow[];
}

const PerformanceLifecycleSetup = ({
  activeProgram,
  isBusy,
  launchTemplateId,
  onActivateProgram,
  onAddQuestion,
  onLaunchCycle,
  onPeriodDateChange,
  onProgramDraftChange,
  onPublishTemplate,
  onRemoveQuestion,
  onSaveProgram,
  onSaveTemplate,
  onSelectedProgramChange,
  onTemplateNameChange,
  onTemplateSelectionChange,
  onUpdateQuestion,
  periodDate,
  programDraft,
  programs,
  publishedTemplates,
  questions,
  selectedProgram,
  showProcess,
  showSetup,
  templateName,
  templates,
}: Props) => (
  <>
    {showSetup && (
      <PerformanceProgramSetupCard
        activeProgram={activeProgram}
        isBusy={isBusy}
        onActivate={onActivateProgram}
        onDraftChange={onProgramDraftChange}
        onSave={onSaveProgram}
        onSelectedProgramChange={onSelectedProgramChange}
        programDraft={programDraft}
        programs={programs}
        selectedProgram={selectedProgram}
      />
    )}
    {showSetup && selectedProgram && (
      <PerformanceAppraisalTemplateSetup
        isBusy={isBusy}
        onAddQuestion={onAddQuestion}
        onPublishTemplate={onPublishTemplate}
        onRemoveQuestion={onRemoveQuestion}
        onSaveTemplate={onSaveTemplate}
        onTemplateNameChange={onTemplateNameChange}
        onUpdateQuestion={onUpdateQuestion}
        questions={questions}
        selectedProgram={selectedProgram}
        templateName={templateName}
        templates={templates}
      />
    )}
    {showProcess && (
      <PerformanceCycleLaunchCards
        activeProgram={activeProgram}
        isBusy={isBusy}
        launchTemplateId={launchTemplateId}
        onLaunch={onLaunchCycle}
        onPeriodDateChange={onPeriodDateChange}
        onProgramChange={onSelectedProgramChange}
        onTemplateChange={onTemplateSelectionChange}
        periodDate={periodDate}
        programs={programs}
        publishedTemplates={publishedTemplates}
        selectedProgram={selectedProgram}
      />
    )}
  </>
);

export default PerformanceLifecycleSetup;
