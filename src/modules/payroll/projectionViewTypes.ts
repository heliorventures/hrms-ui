import type { TaxHistory } from './taxProjectionTypes';

export { EmployeeTaxProjectionDocument as projectionQuery } from '../../api/graphql/graphql';

export type Evidence =
  | 'IMPORTED_ACTUAL'
  | 'FINALIZED_PAYROLL'
  | 'HISTORICAL_ESTIMATE'
  | 'FUTURE_PROJECTION';
export interface ProjectionMonth {
  year: number;
  month: number;
  earnings: string;
  tds: string | null;
  evidence: Evidence;
  components: Record<string, string>;
  aggregate_source: string | null;
  projected_withholding?: string | null;
}
export interface AnnualTax {
  rule_version: string;
  source: string;
  gross: string;
  standard_deduction: string;
  permitted_deductions: string;
  taxable_income: string;
  statutory_taxable_income: string;
  slabs: { from: string; to: string; rate: string; tax: string }[];
  slab_tax: string;
  rebate: string;
  surcharge: string;
  marginal_relief: string;
  cess: string;
  display_tax: string;
  statutory_tax: string;
}
export interface TaxProjection {
  configuration?: {
    regime: 'NEW' | 'OLD';
    method: 'ANNUAL_PROJECTION' | 'PERCENTAGE_OVERRIDE';
    percentage: string | null;
    basis_components: string[];
    effective_from: string;
  } | null;
  fiscal_year: number;
  months: ProjectionMonth[];
  annual_earnings: string;
  tax: AnnualTax | null;
  withholding: {
    monthly: string;
    remaining: string | null;
    requires_acknowledgement: boolean;
    excess_withholding: boolean;
  } | null;
  recorded_tds: string;
  history_complete: boolean;
  selected_monthly_tds: string | null;
  selected_month?: { year: number; month: number; evidence: Evidence } | null;
  limitations: string[];
  note: string;
  opening_history: TaxHistory[];
}

export const formatTaxMoney = (value: string | null | undefined) =>
  value === null || value === undefined
    ? 'Not provided'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(Number(value));
