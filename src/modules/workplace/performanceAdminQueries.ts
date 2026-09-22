import { gql } from 'graphql-request';

import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';

export const PerformanceProgramPolicyDocument = gql`
  query PerformanceProgramPolicyWorkspace($performanceProgramId: ID!) {
    performanceProgramPolicy(performanceProgramId: $performanceProgramId) {
      performanceProgramId
      archivedAt
      populationMode
      populationIds
      goalSettingDueDays
      selfReviewDueDays
      managerReviewDueDays
      calibrationDueDays
      acknowledgementDueDays
    }
  }
`;

export const PerformancePopulationOptionsDocument = gql`
  query PerformancePopulationOptionsWorkspace($input: PerformancePopulationOptionsInput!) {
    performancePopulationOptions(input: $input) {
      items {
        id
        name
        departmentId
        locationId
      }
      nextCursor
    }
  }
`;

export const SavePerformanceProgramPolicyDocument = gql`
  mutation SavePerformanceProgramPolicyWorkspace($input: PerformanceProgramPolicyInput!) {
    savePerformanceProgramPolicy(input: $input) {
      performanceProgramId
      archivedAt
      populationMode
      populationIds
      goalSettingDueDays
      selfReviewDueDays
      managerReviewDueDays
      calibrationDueDays
      acknowledgementDueDays
    }
  }
`;

export const ArchivePerformanceProgramDocument = gql`
  mutation ArchivePerformanceProgramWorkspace($performanceProgramId: ID!, $reason: String!) {
    archivePerformanceProgram(performanceProgramId: $performanceProgramId) {
      id
      status
    }
  }
`;

export const PerformanceAdminCyclesDocument = gql`
  query PerformanceAdminCyclesWorkspace($input: PerformanceAdminCyclesInput!) {
    performanceAdminCycles(input: $input) {
      items {
        reviewCycle {
          id
          name
          status
          startDate
          endDate
        }
        currentStage
        participantCount
        excludedParticipantCount
        actionableExceptionCount
      }
      nextCursor
    }
  }
`;

export const PerformanceCycleAdministrationDocument = gql`
  query PerformanceCycleAdministrationWorkspace($reviewCycleId: ID!, $cursor: String, $limit: Int) {
    performanceCycleAdministration(reviewCycleId: $reviewCycleId, cursor: $cursor, limit: $limit) {
      reviewCycle {
        id
        name
        status
        startDate
        endDate
      }
      currentStage
      deadlines {
        stage
        dueDate
      }
      participants {
        participantId
        employeeId
        employeeName
        managerEmployeeId
        status
        isExcluded
        exclusionReason
        responseRevision
        selfSubmittedAt
        managerSubmittedAt
        acknowledgedAt
        managerRating
        finalRating
        performanceBand
        calibrationProvenance
        revisions {
          revision
          reopenedAt
          reopenedByUserId
          reopenReason
          correctionStage
          selfSubmittedAt
          managerSubmittedAt
          acknowledgedAt
          managerRating
          finalRating
          performanceBand
          calibrationProvenance
        }
      }
      nextParticipantCursor
      exceptions {
        id
        exceptionCode
        details
        resolvedAt
        createdAt
      }
    }
  }
`;

export const PerformanceReviewRevisionDocument = gql`
  query PerformanceReviewRevisionWorkspace($participantId: ID!, $revision: Int!) {
    performanceReviewRevision(participantId: $participantId, revision: $revision) {
      review {
        revision
        reopenedAt
        reopenedByUserId
        reopenReason
        correctionStage
        selfSubmittedAt
        managerSubmittedAt
        acknowledgedAt
        managerRating
        finalRating
        performanceBand
        calibrationProvenance
      }
      answers {
        questionId
        employeeTextAnswer
        employeeSelectedOptionIds
        selfRating
        managerTextAnswer
        managerSelectedOptionIds
        managerRating
      }
      kpis {
        id
        goalId
        metricName
        targetValue
        actualValue
        unit
        evidence
        comment
        measurementDate
      }
      calibrations {
        id
        revision
        finalRating
        performanceBand
        reason
        decidedByUserId
        decidedAt
      }
      acknowledgementComment
    }
  }
`;

export const PrivatePerformanceFeedbackDocument = gql`
  query PrivatePerformanceFeedbackWorkspace($input: PrivatePerformanceFeedbackInput!) {
    privatePerformanceFeedback(input: $input) {
      items {
        id
        reviewCycleId
        goalId
        observationDate
        comments
        createdAt
      }
      nextCursor
    }
  }
`;

export const SavePerformanceCalibrationDocument = gql`
  mutation SavePerformanceCalibrationWorkspace($input: SavePerformanceCalibrationInput!) {
    savePerformanceCalibration(input: $input) {
      participantId
      responseRevision
      finalRating
      performanceBand
    }
  }
`;

export const ReopenPerformanceReviewDocument = gql`
  mutation ReopenPerformanceReviewWorkspace($input: ReopenPerformanceReviewInput!) {
    reopenPerformanceReview(input: $input) {
      participantId
      responseRevision
      status
    }
  }
`;

export const SetPerformanceParticipantExcludedDocument = gql`
  mutation SetPerformanceParticipantExcludedWorkspace(
    $input: SetPerformanceParticipantExcludedInput!
  ) {
    setPerformanceParticipantExcluded(input: $input) {
      participantId
      isExcluded
      exclusionReason
    }
  }
`;

export const AddPrivatePerformanceFeedbackDocument = gql`
  mutation AddPrivatePerformanceFeedbackWorkspace($input: AddPrivatePerformanceFeedbackInput!) {
    addPrivatePerformanceFeedback(input: $input) {
      id
      comments
      observationDate
    }
  }
`;

export const PerformanceGoalKpisDocument = gql`
  query PerformanceGoalKpisWorkspace($participantId: ID!, $goalId: ID) {
    performanceGoalKpis(participantId: $participantId, goalId: $goalId) {
      id
      goalId
      metricName
      targetValue
      actualValue
      unit
      evidence
      comment
      measurementDate
    }
  }
`;

export const SavePerformanceKpiTargetDocument = gql`
  mutation SavePerformanceKpiTargetWorkspace($input: SavePerformanceKpiTargetInput!) {
    savePerformanceKpiTarget(input: $input) {
      id
      goalId
      metricName
      targetValue
      actualValue
      unit
      evidence
      comment
      measurementDate
    }
  }
`;

export const SubmitPerformanceKpiActualDocument = gql`
  mutation SubmitPerformanceKpiActualWorkspace($input: SubmitPerformanceKpiActualInput!) {
    submitPerformanceKpiActual(input: $input) {
      id
      goalId
      metricName
      targetValue
      actualValue
      unit
      evidence
      comment
      measurementDate
    }
  }
`;

export const DeletePerformanceGoalKpiDocument = gql`
  mutation DeletePerformanceGoalKpiWorkspace($participantId: ID!, $goalKpiId: ID!) {
    deletePerformanceGoalKpi(participantId: $participantId, goalKpiId: $goalKpiId)
  }
`;

export const RetryPerformanceExceptionDocument = gql`
  mutation RetryPerformanceExceptionWorkspace($exceptionId: ID!) {
    retryPerformanceException(exceptionId: $exceptionId) {
      id
      exceptionCode
      details
      resolvedAt
      createdAt
    }
  }
`;

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
