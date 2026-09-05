import { gql } from 'graphql-request';

import type { SetupField } from './performanceSetupEditor';

export const SaveReviewCycleDocument = gql`
  mutation SaveReviewCycle($input: SaveReviewCycleInput!) {
    saveReviewCycle(input: $input) {
      id
    }
  }
`;
export const cycleFields: SetupField[] = [
  { key: 'name', label: 'Name', required: true, maxLength: 255 },
  { key: 'startDate', label: 'Start date', type: 'date', required: true },
  { key: 'endDate', label: 'End date', type: 'date', required: true },
  { key: 'reviewType', label: 'Review type', maxLength: 50 },
];
