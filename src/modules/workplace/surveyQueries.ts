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
}
export interface SurveyQuestionRow {
  id: string;
  dimension: string;
  questionType: string;
  prompt: string;
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
  }>;
}
