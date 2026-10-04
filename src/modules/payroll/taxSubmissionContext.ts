export interface TaxSubmissionContext {
  fiscal_year: number;
  settings: {
    regime: 'NEW' | 'OLD';
    method: 'ANNUAL_PROJECTION' | 'PERCENTAGE_OVERRIDE';
    effective_from: string;
  };
  declaration: {
    revision: number;
    input: {
      regime?: string | null;
      gross_income?: string | null;
      declared_deductions?: string | null;
    };
  } | null;
}

export const taxSubmissionContextQuery = /* GraphQL */ `
  query EmployeeTaxSubmissionContext($fiscalYear: Int!) {
    employeeTaxSubmissionContext(fiscalYear: $fiscalYear)
  }
`;
