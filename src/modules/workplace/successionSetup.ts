import { gql } from 'graphql-request';

export interface SuccessionSetupValues {
  id?: string;
  name: string;
  category?: string | null;
  description?: string | null;
}
export const saveCompetencyDocument = gql`
  mutation SaveCompetency($input: SaveCompetencyInput!) {
    saveCompetency(input: $input) {
      id
    }
  }
`;
export const saveTalentPoolDocument = gql`
  mutation SaveTalentPool($input: SaveTalentPoolInput!) {
    saveTalentPool(input: $input) {
      id
    }
  }
`;

export const successionSetupPageDocument = gql`
  query SuccessionSetupPage($offset: Int!) {
    competencies(limit: 21, offset: $offset) {
      id
      tenantId
      name
      category
      description
      createdAt
      updatedAt
    }
    talentPools(limit: 21, offset: $offset) {
      id
      tenantId
      name
      description
      createdAt
      updatedAt
    }
  }
`;
