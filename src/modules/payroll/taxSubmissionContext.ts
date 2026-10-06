export { EmployeeTaxSubmissionContextDocument as taxSubmissionContextQuery } from '../../api/graphql/graphql';
export interface TaxSubmissionContext {
  fiscal_year: number;
  settings: {
    regime: 'NEW' | 'OLD';
    method: 'ANNUAL_PROJECTION' | 'PERCENTAGE_OVERRIDE';
    effective_from: string;
  } | null;
  can_submit?: boolean;
  declaration: {
    revision: number;
    input: {
      regime?: string | null;
      gross_income?: string | null;
      declared_deductions?: string | null;
    };
  } | null;
}
