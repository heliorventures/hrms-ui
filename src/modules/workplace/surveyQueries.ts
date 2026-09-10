import { gql } from 'graphql-request';

export const SurveysAdminDocument = gql`
  query SurveysAdminWorkspace {
    surveys {
      id
      title
      description
      status
      opensAt
      closesAt
      minimumReportGroupSize
      completed
      responseReviewMode
      assignedCount
      completedCount
      pendingCount
    }
  }
`;
export const SurveyDepartmentsDocument = gql`
  query SurveyDepartmentsWorkspace {
    departments(limit: 200) {
      id
      name
      code
    }
  }
`;
export const SurveyAudienceDocument = gql`
  query SurveyAudienceWorkspace($id: ID!) {
    surveyAudience(surveyId: $id) {
      audienceKind
      departmentIds
      locationIds
      employeeIds
      sourceSurveyId
    }
  }
`;
export const SurveyAudienceOptionsDocument = gql`
  query SurveyAudienceOptionsWorkspace($kind: String!, $search: String, $after: ID, $limit: Int) {
    surveyAudienceOptions(kind: $kind, search: $search, after: $after, limit: $limit) {
      nodes {
        id
        label
      }
      nextCursor
    }
  }
`;
export const SurveyManagementEventsDocument = gql`
  query SurveyManagementEventsWorkspace($id: ID!) {
    surveyManagementEvents(surveyId: $id) {
      action
      occurredAt
      message
    }
  }
`;
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
export const AvailableSurveysDocument = gql`
  query AvailableSurveysWorkspace {
    availableSurveys {
      id
      title
      description
      status
      opensAt
      closesAt
      minimumReportGroupSize
      completed
      responseReviewMode
    }
  }
`;
export const SurveyResultsCatalogDocument = gql`
  query SurveyResultsCatalogWorkspace {
    surveyResultsCatalog {
      id
      title
      description
      status
      opensAt
      closesAt
      minimumReportGroupSize
      completed
      responseReviewMode
    }
  }
`;
export const SurveyDetailDocument = gql`
  query SurveyDetailWorkspace($id: ID!) {
    survey(surveyId: $id) {
      summary {
        id
        title
        description
        status
        opensAt
        closesAt
        minimumReportGroupSize
        completed
        responseReviewMode
      }
      audienceDepartmentIds
      sections {
        id
        title
        displayOrder
        questions {
          id
          dimension
          questionType
          prompt
          description
          commentEnabled
          isRequired
          ratingMin
          ratingMax
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
export const SurveyResultsDocument = gql`
  query SurveyResultsWorkspace($id: ID!) {
    surveyResults(surveyId: $id) {
      surveyId
      suppressed
      suppressionReason
      respondentCount
      minimumReportGroupSize
      dimensions {
        dimension
        scoredAnswerCount
        averageScore
      }
      questions {
        questionId
        prompt
        dimension
        responseCount
        averageScore
        options {
          optionId
          label
          responseCount
        }
        comments
        questionType
        ratingMin
        ratingMax
        skippedCount
        suppressed
        ratingDistribution {
          score
          responseCount
        }
      }
    }
  }
`;
export const SurveySubmissionsDocument = gql`
  query SurveySubmissionsWorkspace($id: ID!, $offset: Int!, $limit: Int!) {
    surveySubmissions(surveyId: $id, offset: $offset, limit: $limit) {
      available
      reason
      totalCount
      hasMore
      nodes {
        number
        answers {
          questionId
          prompt
          numericAnswer
          textAnswer
          comment
          selectedOptions
        }
      }
    }
  }
`;
export const SaveSurveyDocument = gql`
  mutation SaveSurveyWorkspace($input: SaveSurveyInput!) {
    saveSurvey(input: $input) {
      summary {
        id
        title
        status
      }
    }
  }
`;
export const PublishSurveyDocument = gql`
  mutation PublishSurveyWorkspace($id: ID!) {
    publishSurvey(surveyId: $id) {
      summary {
        id
        status
      }
    }
  }
`;
export const CloseSurveyDocument = gql`
  mutation CloseSurveyWorkspace($id: ID!) {
    closeSurvey(surveyId: $id) {
      summary {
        id
        status
      }
    }
  }
`;
export const OpenSurveyDocument = gql`
  mutation OpenSurveyWorkspace($id: ID!) {
    openSurvey(surveyId: $id) {
      summary {
        id
        status
        opensAt
      }
    }
  }
`;
export const SubmitSurveyDocument = gql`
  mutation SubmitSurveyWorkspace($id: ID!, $answers: [SurveyAnswerInput!]!) {
    submitSurvey(surveyId: $id, answers: $answers)
  }
`;

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
