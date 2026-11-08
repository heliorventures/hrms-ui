import type {
  ClientOpsClearanceBySeparationQuery,
  ClientOpsSeparationsListQuery,
  OnboardingChecklistQuery,
} from '../../api/graphql/graphql';
import type { LoanFnfSettlementQuery } from '../../api/loans/graphql';

export type ChecklistItem = OnboardingChecklistQuery['onboardingChecklist'][number];
export type SeparationRow = ClientOpsSeparationsListQuery['separations'][number];
export type FnfSettlementRow = NonNullable<LoanFnfSettlementQuery['fnfSettlement']>;
export type ClearanceItemRow = ClientOpsClearanceBySeparationQuery['clearanceChecklist'][number];

export interface FnfFormState {
  le: string;
  g: string;
  b: string;
  r: string;
}
