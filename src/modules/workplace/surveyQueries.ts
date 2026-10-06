export {
  SurveysAdminWorkspaceDocument as SurveysAdminDocument,
  SurveyDepartmentsWorkspaceDocument as SurveyDepartmentsDocument,
  SurveyAudienceWorkspaceDocument as SurveyAudienceDocument,
  SurveyAudienceOptionsWorkspaceDocument as SurveyAudienceOptionsDocument,
  SurveyManagementEventsWorkspaceDocument as SurveyManagementEventsDocument,
  AvailableSurveysWorkspaceDocument as AvailableSurveysDocument,
  SurveyResultsCatalogWorkspaceDocument as SurveyResultsCatalogDocument,
  SurveyDetailWorkspaceDocument as SurveyDetailDocument,
  SurveyResultsWorkspaceDocument as SurveyResultsDocument,
  SurveySubmissionsWorkspaceDocument as SurveySubmissionsDocument,
  SaveSurveyWorkspaceDocument as SaveSurveyDocument,
  PublishSurveyWorkspaceDocument as PublishSurveyDocument,
  CloseSurveyWorkspaceDocument as CloseSurveyDocument,
  OpenSurveyWorkspaceDocument as OpenSurveyDocument,
  SubmitSurveyWorkspaceDocument as SubmitSurveyDocument,
} from '../../api/graphql/graphql';

export interface SurveyAudienceRow {
  audienceKind: string;
  departmentIds: string[];
  locationIds: string[];
  employeeIds: string[];
  sourceSurveyId?: string | null;
}
export interface SurveyManagementEventRow {
  action: string;
  occurredAt: string;
  message: string;
}

export interface SurveySummaryRow {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  opensAt?: string | null;
  closesAt?: string | null;
  minimumReportGroupSize: number;
  completed: boolean;
  responseReviewMode?: string;
  assignedCount?: number | null;
  completedCount?: number | null;
  pendingCount?: number | null;
}
export interface SurveyQuestionRow {
  id: string;
  dimension: string;
  questionType: string;
  prompt: string;
  description?: string | null;
  commentEnabled?: boolean;
  isRequired: boolean;
  ratingMin?: string | null;
  ratingMax?: string | null;
  displayOrder: number;
  options: Array<{ id: string; label: string; score?: string | null; displayOrder: number }>;
}
export interface SurveyDetailRow {
  summary: SurveySummaryRow;
  audienceDepartmentIds: string[];
  sections: Array<{
    id: string;
    title: string;
    displayOrder: number;
    questions: SurveyQuestionRow[];
  }>;
}
export interface SurveyResultsRow {
  surveyId: string;
  suppressed: boolean;
  suppressionReason?: string | null;
  respondentCount?: number | null;
  minimumReportGroupSize: number;
  dimensions: Array<{ dimension: string; scoredAnswerCount: number; averageScore?: string | null }>;
  questions: Array<{
    questionId: string;
    prompt: string;
    dimension: string;
    responseCount: number;
    averageScore?: string | null;
    options: Array<{ optionId: string; label: string; responseCount: number }>;
    comments: string[];
    questionType?: string;
    ratingMin?: string | null;
    ratingMax?: string | null;
    skippedCount?: number | null;
    suppressed?: boolean;
    ratingDistribution?: Array<{ score: string; responseCount: number }>;
  }>;
}

export interface SurveySubmissionsRow {
  available: boolean;
  reason?: string | null;
  totalCount?: number | null;
  hasMore: boolean;
  nodes: Array<{
    number: number;
    answers: Array<{
      questionId: string;
      prompt: string;
      numericAnswer?: string | null;
      textAnswer?: string | null;
      comment?: string | null;
      selectedOptions: string[];
    }>;
  }>;
}
