import type { PayrollLoanReview } from './payrollLoanReview';

export {
  EmployeeTaxSettingsDocument as taxSettingsQuery,
  EmployeeTaxHistoryDocument as taxHistoryQuery,
  SaveEmployeeTaxSettingsDocument as saveTaxSettings,
  SaveEmployeeTaxHistoryDocument as saveTaxHistory,
  PayrollDraftDocument as draftQuery,
  CalculatePayrollCycleDocument as calculateMutation,
  FinalizePayrollCycleDocument as finalizeMutation,
} from '../../api/graphql/graphql';
export interface TaxSettingsInput {
  regime: 'OLD' | 'NEW';
  method: 'ANNUAL_PROJECTION' | 'PERCENTAGE_OVERRIDE';
  percentage: string | null;
  basis_components: string[];
  effective_from: string;
  effective_until: string | null;
  reason: string | null;
  resident: boolean | null;
}
export interface TaxSettingsVersion {
  id: string;
  revision: number;
  input: TaxSettingsInput;
}
export interface TaxHistory {
  fiscal_year: number;
  period_start: string;
  period_end: string;
  employer: string;
  source_key: string;
  earnings: string;
  components: Record<string, string>;
  tds: string | null;
  coverage: 'COMPLETE' | 'INCOMPLETE';
  reason: string;
  evidence: 'IMPORTED_ACTUAL';
}
export interface HistoryVersion {
  id: string;
  revision: number;
  entry: TaxHistory;
}
export interface DraftCalculation {
  gross: string;
  incentive: string;
  total_deductions: string;
  net_earned: string;
  remaining_payable: string;
  advance_already_paid: string;
}
export interface PayrollDraft {
  cycle_id: string;
  revision: number;
  fingerprint: string;
  can_finalize: boolean;
  finalization_block_reason?: string | null;
  employees: {
    employee_id: string;
    employee_label?: string;
    outcome: string;
    reason: string | null;
    prepared: {
      loan_recovery?: PayrollLoanReview | null;
      calculation: DraftCalculation;
      requires_tax_acknowledgement: boolean;
      arrears?: { id: string; amount: string; reason: string | null }[];
    } | null;
  }[];
}
