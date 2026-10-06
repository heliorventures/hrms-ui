export {
  PayrollPeriodInputDocument as periodInputQuery,
  SavePayrollPeriodInputDocument as savePeriodInputMutation,
} from '../../api/graphql/graphql';
export interface AdditionalDeduction {
  code: string;
  amount: string | null;
  reason: string | null;
  origin?: string | null;
}
export interface PeriodInput {
  automatic?: {
    use_employee_configuration?: boolean;
    lwp_override?: { days: string; reason: string } | null;
    eligibility: {
      pf_applicable: boolean | null;
      esi_applicable: boolean | null;
      esi_continuation_until: string | null;
      disability: boolean | null;
      average_daily_wage: string | null;
      professional_tax?: string | null;
    };
    withholding_override: { amount: string; reason: string } | null;
  } | null;
  year: number;
  month: number;
  gross_rule: string;
  fixed_gross: string | null;
  earned_gross_override: string | null;
  month_days: string | null;
  paid_days: string | null;
  present_days: string | null;
  lwp_days: string | null;
  source_lwp_days: string | null;
  lwp_divisor: string | null;
  lwp_amount_override: string | null;
  lwp_basis: string | null;
  lwp_handling: string;
  variable_allowance_ot: string | null;
  incentive: string | null;
  advance_already_paid: string | null;
  additional_deductions: AdditionalDeduction[];
  statutory_overrides: Record<string, string | null>;
  expected_earned_components: Record<string, string | null>;
  expected_wages: Record<string, string | null>;
  expected_employer_contributions: Record<string, string | null>;
  expected_statement: Record<string, string | null>;
  contribution_rules: unknown;
  ready: boolean;
  status: string | null;
  historical_lwp_included: boolean;
  approved_lwp_review_hash?: string | null;
}
export interface PeriodRecord {
  id: string | null;
  input: PeriodInput;
  revision: number | null;
  derived?: boolean;
  ready: boolean;
  validationError?: string | null;
}
export type PeriodAmountField =
  | 'fixed_gross'
  | 'earned_gross_override'
  | 'month_days'
  | 'paid_days'
  | 'present_days'
  | 'lwp_days'
  | 'lwp_divisor'
  | 'lwp_amount_override'
  | 'variable_allowance_ot'
  | 'incentive'
  | 'advance_already_paid';
export const amountFields: [PeriodAmountField, string][] = [
  ['fixed_gross', 'Monthly fixed gross'],
  ['earned_gross_override', 'Earned gross override'],
  ['month_days', 'Month days'],
  ['paid_days', 'Paid days'],
  ['present_days', 'Present days'],
  ['lwp_days', 'LWP days'],
  ['lwp_divisor', 'LWP divisor'],
  ['lwp_amount_override', 'LWP amount override'],
  ['variable_allowance_ot', 'Variable allowance / OT'],
  ['incentive', 'Monthly incentive'],
  ['advance_already_paid', 'Salary advance already paid'],
];
