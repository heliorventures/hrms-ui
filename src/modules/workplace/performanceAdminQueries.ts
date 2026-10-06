import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';

export {
  PerformanceProgramPolicyWorkspaceDocument as PerformanceProgramPolicyDocument,
  PerformancePopulationOptionsWorkspaceDocument as PerformancePopulationOptionsDocument,
  SavePerformanceProgramPolicyWorkspaceDocument as SavePerformanceProgramPolicyDocument,
  ArchivePerformanceProgramWorkspaceDocument as ArchivePerformanceProgramDocument,
  PerformanceAdminCyclesWorkspaceDocument as PerformanceAdminCyclesDocument,
  PerformanceCycleAdministrationWorkspaceDocument as PerformanceCycleAdministrationDocument,
  PerformanceReviewRevisionWorkspaceDocument as PerformanceReviewRevisionDocument,
  PrivatePerformanceFeedbackWorkspaceDocument as PrivatePerformanceFeedbackDocument,
  SavePerformanceCalibrationWorkspaceDocument as SavePerformanceCalibrationDocument,
  ReopenPerformanceReviewWorkspaceDocument as ReopenPerformanceReviewDocument,
  SetPerformanceParticipantExcludedWorkspaceDocument as SetPerformanceParticipantExcludedDocument,
  AddPrivatePerformanceFeedbackWorkspaceDocument as AddPrivatePerformanceFeedbackDocument,
  PerformanceGoalKpisWorkspaceDocument as PerformanceGoalKpisDocument,
  SavePerformanceKpiTargetWorkspaceDocument as SavePerformanceKpiTargetDocument,
  SubmitPerformanceKpiActualWorkspaceDocument as SubmitPerformanceKpiActualDocument,
  DeletePerformanceGoalKpiWorkspaceDocument as DeletePerformanceGoalKpiDocument,
  RetryPerformanceExceptionWorkspaceDocument as RetryPerformanceExceptionDocument,
} from '../../api/graphql/graphql';

export type PerformancePopulationMode = 'ALL' | 'DEPARTMENTS' | 'LOCATIONS' | 'EMPLOYEES';

export interface PerformanceProgramPolicyRow {
  performanceProgramId: string;
  archivedAt?: string | null;
  populationMode: PerformancePopulationMode;
  populationIds: string[];
  goalSettingDueDays?: number | null;
  selfReviewDueDays?: number | null;
  managerReviewDueDays?: number | null;
  calibrationDueDays?: number | null;
  acknowledgementDueDays?: number | null;
}

export interface PerformancePopulationOption {
  id: string;
  name: string;
  departmentId?: string | null;
  locationId?: string | null;
}

export interface PerformanceAdminCycleRow {
  reviewCycle: { id: string; name: string; status: string; startDate: string; endDate: string };
  currentStage: string;
  participantCount: number;
  excludedParticipantCount: number;
  actionableExceptionCount: number;
}

export interface PerformanceRevisionRow {
  revision: number;
  reopenedAt?: string | null;
  reopenedByUserId?: string | null;
  reopenReason?: string | null;
  correctionStage: string;
  selfSubmittedAt?: string | null;
  managerSubmittedAt?: string | null;
  acknowledgedAt?: string | null;
  managerRating?: string | null;
  finalRating?: string | null;
  performanceBand?: string | null;
  calibrationProvenance?: string | null;
}

export interface PerformanceAdminParticipant extends PerformanceRevisionRow {
  participantId: string;
  employeeId: string;
  employeeName: string;
  managerEmployeeId?: string | null;
  status: string;
  isExcluded: boolean;
  exclusionReason?: string | null;
  responseRevision: number;
  revisions: PerformanceRevisionRow[];
}

export interface PerformanceAdminException {
  id: string;
  exceptionCode: string;
  details: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface PerformanceCycleAdministrationRow {
  reviewCycle: PerformanceAdminCycleRow['reviewCycle'];
  currentStage: string;
  deadlines: Array<{ stage: string; dueDate: string }>;
  participants: PerformanceAdminParticipant[];
  nextParticipantCursor?: string | null;
  exceptions: PerformanceAdminException[];
}

export interface PerformanceRevisionDetailRow {
  review: PerformanceRevisionRow;
  answers: PerformanceReviewDetailRow['answers'];
  kpis: PerformanceGoalKpi[];
  calibrations: Array<{
    id: string;
    revision: number;
    finalRating: string;
    performanceBand?: string | null;
    reason: string;
    decidedByUserId: string;
    decidedAt: string;
  }>;
  acknowledgementComment?: string | null;
}

export interface PerformanceFeedbackRow {
  id: string;
  reviewCycleId?: string | null;
  goalId?: string | null;
  observationDate: string;
  comments: string;
  createdAt: string;
}

export interface PerformanceGoalKpi {
  id: string;
  goalId: string;
  metricName: string;
  targetValue?: string | null;
  actualValue?: string | null;
  unit?: string | null;
  evidence?: string | null;
  comment?: string | null;
  measurementDate?: string | null;
}
