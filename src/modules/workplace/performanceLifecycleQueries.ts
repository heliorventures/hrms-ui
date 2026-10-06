export {
  PerformanceProgramsWorkspaceDocument as PerformanceProgramsDocument,
  AppraisalTemplatesWorkspaceDocument as AppraisalTemplatesDocument,
  MyPerformanceReviewsWorkspaceDocument as MyPerformanceReviewsDocument,
  TeamPerformanceReviewsWorkspaceDocument as TeamPerformanceReviewsDocument,
  PerformanceReviewDetailWorkspaceDocument as PerformanceReviewDetailDocument,
  SavePerformanceProgramWorkspaceDocument as SavePerformanceProgramDocument,
  SaveAppraisalTemplateWorkspaceDocument as SaveAppraisalTemplateDocument,
  PublishAppraisalTemplateWorkspaceDocument as PublishAppraisalTemplateDocument,
  ActivatePerformanceProgramWorkspaceDocument as ActivatePerformanceProgramDocument,
  LaunchPerformanceCycleWorkspaceDocument as LaunchPerformanceCycleDocument,
  AdvancePerformanceCycleWorkspaceDocument as AdvancePerformanceCycleDocument,
  ApprovePerformanceGoalsWorkspaceDocument as ApprovePerformanceGoalsDocument,
  AddPerformanceFeedbackWorkspaceDocument as AddPerformanceFeedbackDocument,
  SubmitSelfAppraisalWorkspaceDocument as SubmitSelfAppraisalDocument,
  SubmitManagerAppraisalWorkspaceDocument as SubmitManagerAppraisalDocument,
  AcknowledgePerformanceReviewWorkspaceDocument as AcknowledgePerformanceReviewDocument,
} from '../../api/graphql/graphql';

export interface PerformanceProgramRow {
  id: string;
  name: string;
  description?: string | null;
  cadence: string;
  anchorDate: string;
  status: string;
  includeCalibration: boolean;
  includeAcknowledgement: boolean;
  goalWeightRequired: string;
  ratingMin: string;
  ratingMax: string;
}
export interface AppraisalOptionRow {
  id: string;
  label: string;
  score?: string | null;
  displayOrder: number;
}
export interface AppraisalQuestionRow {
  id: string;
  parentQuestionId?: string | null;
  questionType: string;
  prompt: string;
  isRequired: boolean;
  answerer: string;
  selfRatingEnabled: boolean;
  managerRatingEnabled: boolean;
  displayOrder: number;
  options: AppraisalOptionRow[];
}
export interface AppraisalTemplateRow {
  id: string;
  performanceProgramId: string;
  version: number;
  name: string;
  status: string;
  publishedAt?: string | null;
  sections: Array<{
    id: string;
    title: string;
    description?: string | null;
    displayOrder: number;
    questions: AppraisalQuestionRow[];
  }>;
}
export interface PerformanceReviewRow {
  id: string;
  reviewCycleId: string;
  employeeId: string;
  employeeName: string;
  managerEmployeeId?: string | null;
  managerName?: string | null;
  appraisalTemplateId: string;
  cycleName: string;
  cycleStartDate: string;
  cycleEndDate: string;
  cycleStage: string;
  status: string;
  selfSubmittedAt?: string | null;
  managerSubmittedAt?: string | null;
  acknowledgedAt?: string | null;
  responseRevision: number;
  finalRating?: string | null;
  performanceBand?: string | null;
}
export interface PerformanceReviewDetailRow {
  review: PerformanceReviewRow;
  goals: Array<{
    id: string;
    employeeId?: string;
    reviewCycleId?: string;
    title: string;
    description?: string | null;
    weightage?: string | null;
    status: string;
  }>;
  feedback: Array<{
    id: string;
    goalId?: string | null;
    observationDate: string;
    comments: string;
    createdAt: string;
  }>;
  template: AppraisalTemplateRow;
  answers: Array<{
    questionId: string;
    employeeTextAnswer?: string | null;
    employeeSelectedOptionIds: string[];
    selfRating?: string | null;
    managerTextAnswer?: string | null;
    managerSelectedOptionIds: string[];
    managerRating?: string | null;
  }>;
}
