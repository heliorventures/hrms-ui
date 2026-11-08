import type {
  LoanAccountFieldsFragment,
  LoanRequestFieldsFragment,
  LoanPoliciesQuery,
} from '../../api/loans/graphql';

export type LoanAccount = LoanAccountFieldsFragment;
export type LoanRequest = LoanRequestFieldsFragment;
export type LoanPolicy = LoanPoliciesQuery['loanPolicies']['nodes'][number];
export interface LoanPageInfo {
  endCursor?: string | null;
  hasNextPage: boolean;
}
export interface LoanConnection<T> {
  nodes: T[];
  pageInfo: LoanPageInfo;
}
