export interface ComponentFormula {
  weights: Record<string, string>;
  rate: string;
  ceiling: string | null;
  rounding: string;
}
export type WageClass = 'INCLUDED' | 'EXCLUDED_WITH_ADDBACK' | 'EXCLUDED_OUTSIDE_ADDBACK';
export interface ContributionPolicy {
  effective_from: string;
  effective_until: string | null;
  lwp_divisor: number;
  origin: string;
  reason: string;
  pf_employee: ComponentFormula;
  pf_employer: ComponentFormula;
  esi_basis: ComponentFormula;
  esi_employer_rate: string;
  company_esi_covered: boolean;
  esi_mode: string;
  classifications: Record<string, WageClass>;
  professional_tax: string | null;
}
export interface PolicyVersion {
  id: string;
  revision: number;
  policy: ContributionPolicy;
}
export const emptyFormula = (): ComponentFormula => ({
  weights: {},
  rate: '0',
  ceiling: null,
  rounding: 'HALF_UP_2DP',
});
