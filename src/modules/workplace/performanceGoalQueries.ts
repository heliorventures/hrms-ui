import { gql } from 'graphql-request';

export const ProposePerformanceGoalDocument = gql`
  mutation ProposePerformanceGoalWorkspace($input: SavePerformanceGoalInput!) {
    proposePerformanceGoal(input: $input) {
      id
      title
      description
      weightage
      status
    }
  }
`;

export const UpdatePerformanceGoalDocument = gql`
  mutation UpdatePerformanceGoalWorkspace($goalId: ID!, $input: SavePerformanceGoalInput!) {
    updatePerformanceGoal(goalId: $goalId, input: $input) {
      id
      title
      description
      weightage
      status
    }
  }
`;

export const DeletePerformanceGoalDocument = gql`
  mutation DeletePerformanceGoalWorkspace($participantId: ID!, $goalId: ID!) {
    deletePerformanceGoal(participantId: $participantId, goalId: $goalId)
  }
`;
