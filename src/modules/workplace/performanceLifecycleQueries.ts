import { gql } from 'graphql-request';

export const PerformanceProgramsDocument = gql`
  query PerformanceProgramsWorkspace {
    performancePrograms {
      id
      name
      description
      cadence
      anchorDate
      status
      includeCalibration
      includeAcknowledgement
      goalWeightRequired
      ratingMin
      ratingMax
    }
  }
`;

export const AppraisalTemplatesDocument = gql`
  query AppraisalTemplatesWorkspace($programId: ID!) {
    appraisalTemplates(performanceProgramId: $programId) {
      id
      performanceProgramId
      version
      name
      status
      publishedAt
      sections {
        id
        title
        description
        displayOrder
        questions {
          id
          parentQuestionId
          questionType
          prompt
          isRequired
          answerer
          selfRatingEnabled
          managerRatingEnabled
          displayOrder
          options {
            id
            label
            score
            displayOrder
          }
        }
      }
    }
  }
`;

export const MyPerformanceReviewsDocument = gql`
  query MyPerformanceReviewsWorkspace {
    myPerformanceReviews {
      id
      reviewCycleId
      employeeId
      employeeName
      managerEmployeeId
      managerName
      appraisalTemplateId
      cycleName
      cycleStartDate
      cycleEndDate
      cycleStage
      status
      selfSubmittedAt
      managerSubmittedAt
      acknowledgedAt
      finalRating
      performanceBand
    }
  }
`;

export const TeamPerformanceReviewsDocument = gql`
  query TeamPerformanceReviewsWorkspace {
    myTeamPerformanceReviews {
      id
      reviewCycleId
      employeeId
      employeeName
      managerEmployeeId
      managerName
      appraisalTemplateId
      cycleName
      cycleStartDate
      cycleEndDate
      cycleStage
      status
      selfSubmittedAt
      managerSubmittedAt
      acknowledgedAt
      finalRating
      performanceBand
    }
  }
`;

export const PerformanceReviewDetailDocument = gql`
  query PerformanceReviewDetailWorkspace($participantId: ID!) {
    performanceReviewDetail(participantId: $participantId) {
      review {
        id
        reviewCycleId
        employeeId
        employeeName
        managerEmployeeId
        managerName
        appraisalTemplateId
        cycleName
        cycleStartDate
        cycleEndDate
        cycleStage
        status
        selfSubmittedAt
        managerSubmittedAt
        acknowledgedAt
        finalRating
        performanceBand
      }
      goals {
        id
        employeeId
        reviewCycleId
        title
        description
        weightage
        status
      }
      feedback {
        id
        reviewCycleId
        goalId
        observationDate
        comments
        createdAt
      }
      template {
        id
        performanceProgramId
        version
        name
        status
        publishedAt
        sections {
          id
          title
          description
          displayOrder
          questions {
            id
            parentQuestionId
            questionType
            prompt
            isRequired
            answerer
            selfRatingEnabled
            managerRatingEnabled
            displayOrder
            options {
              id
              label
              score
              displayOrder
            }
          }
        }
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
    }
  }
`;

export const SavePerformanceProgramDocument = gql`
  mutation SavePerformanceProgramWorkspace($input: SavePerformanceProgramInput!) {
    savePerformanceProgram(input: $input) {
      id
      name
      cadence
      status
      anchorDate
    }
  }
`;
export const SaveAppraisalTemplateDocument = gql`
  mutation SaveAppraisalTemplateWorkspace($input: SaveAppraisalTemplateInput!) {
    saveAppraisalTemplate(input: $input) {
      id
      performanceProgramId
      version
      name
      status
    }
  }
`;
export const PublishAppraisalTemplateDocument = gql`
  mutation PublishAppraisalTemplateWorkspace($id: ID!) {
    publishAppraisalTemplate(appraisalTemplateId: $id) {
      id
      status
    }
  }
`;
export const ActivatePerformanceProgramDocument = gql`
  mutation ActivatePerformanceProgramWorkspace($id: ID!) {
    activatePerformanceProgram(performanceProgramId: $id) {
      id
      status
    }
  }
`;
export const LaunchPerformanceCycleDocument = gql`
  mutation LaunchPerformanceCycleWorkspace($input: LaunchPerformanceCycleInput!) {
    launchPerformanceCycle(input: $input) {
      id
      name
      status
      startDate
      endDate
    }
  }
`;
export const AdvancePerformanceCycleDocument = gql`
  mutation AdvancePerformanceCycleWorkspace($id: ID!) {
    advancePerformanceCycle(reviewCycleId: $id)
  }
`;
export const ProposePerformanceGoalDocument = gql`
  mutation ProposePerformanceGoalWorkspace($input: SavePerformanceGoalInput!) {
    proposePerformanceGoal(input: $input) {
      id
      title
      weightage
      status
    }
  }
`;
export const ApprovePerformanceGoalsDocument = gql`
  mutation ApprovePerformanceGoalsWorkspace($id: ID!) {
    approvePerformanceGoals(participantId: $id) {
      id
      status
    }
  }
`;
export const AddPerformanceFeedbackDocument = gql`
  mutation AddPerformanceFeedbackWorkspace($input: AddPerformanceFeedbackInput!) {
    addPerformanceFeedback(input: $input) {
      id
      comments
      observationDate
    }
  }
`;
export const SubmitSelfAppraisalDocument = gql`
  mutation SubmitSelfAppraisalWorkspace($id: ID!, $answers: [AppraisalAnswerInput!]!) {
    submitSelfAppraisal(participantId: $id, answers: $answers) {
      review {
        id
        status
        selfSubmittedAt
      }
    }
  }
`;
export const SubmitManagerAppraisalDocument = gql`
  mutation SubmitManagerAppraisalWorkspace(
    $id: ID!
    $answers: [AppraisalAnswerInput!]!
    $rating: String!
    $band: String
  ) {
    submitManagerAppraisal(
      participantId: $id
      answers: $answers
      finalRating: $rating
      performanceBand: $band
    ) {
      review {
        id
        status
        managerSubmittedAt
        finalRating
      }
    }
  }
`;
export const AcknowledgePerformanceReviewDocument = gql`
  mutation AcknowledgePerformanceReviewWorkspace($id: ID!, $comment: String) {
    acknowledgePerformanceReview(participantId: $id, comment: $comment) {
      review {
        id
        acknowledgedAt
      }
    }
  }
`;

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
  finalRating?: string | null;
  performanceBand?: string | null;
}
export interface PerformanceReviewDetailRow {
  review: PerformanceReviewRow;
  goals: Array<{
    id: string;
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
