import type {
  ClientOpsClearanceBySeparationQuery,
  ClientOpsFnfBySeparationQuery,
  ClientOpsSeparationsListQuery,
  OnboardingChecklistQuery,
} from '../../api/graphql/graphql';

export type ChecklistItem = OnboardingChecklistQuery['onboardingChecklist'][number];
export type SeparationRow = ClientOpsSeparationsListQuery['separations'][number];
export type FnfSettlementRow = NonNullable<ClientOpsFnfBySeparationQuery['fnfSettlement']>;
export type ClearanceItemRow = ClientOpsClearanceBySeparationQuery['clearanceChecklist'][number];

export interface FnfFormState {
  le: string;
  g: string;
  b: string;
  r: string;
}
