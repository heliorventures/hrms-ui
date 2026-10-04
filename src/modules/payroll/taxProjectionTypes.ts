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
  employees: {
    employee_id: string;
    employee_label?: string;
    outcome: string;
    reason: string | null;
    prepared: {
      calculation: DraftCalculation;
      requires_tax_acknowledgement: boolean;
      arrears?: { id: string; amount: string; reason: string | null }[];
    } | null;
  }[];
}
export const taxSettingsQuery = /* GraphQL */ `
  query EmployeeTaxSettings($employeeId: ID!) {
    employeeTaxSettings(employeeId: $employeeId)
  }
`;
export const taxHistoryQuery = /* GraphQL */ `
  query EmployeeTaxHistory($employeeId: ID!, $fiscalYear: Int!) {
    employeeTaxHistory(employeeId: $employeeId, fiscalYear: $fiscalYear)
  }
`;
export const saveTaxSettings = /* GraphQL */ `
  mutation SaveEmployeeTaxSettings($employeeId: ID!, $input: JSON!, $expectedRevision: Int) {
    saveEmployeeTaxSettings(
      employeeId: $employeeId
      input: $input
      expectedRevision: $expectedRevision
    )
  }
`;
export const saveTaxHistory = /* GraphQL */ `
  mutation SaveEmployeeTaxHistory($employeeId: ID!, $input: JSON!, $expectedRevision: Int) {
    saveEmployeeTaxHistory(
      employeeId: $employeeId
      input: $input
      expectedRevision: $expectedRevision
    )
  }
`;
export const draftQuery = /* GraphQL */ `
  query PayrollDraft($cycleId: ID!) {
    payrollDraft(cycleId: $cycleId)
  }
`;
export const calculateMutation = /* GraphQL */ `
  mutation CalculatePayrollCycle($cycleId: ID!, $expectedRevision: Int) {
    calculatePayrollCycle(cycleId: $cycleId, expectedRevision: $expectedRevision)
  }
`;
export const finalizeMutation = /* GraphQL */ `
  mutation FinalizePayrollCycle(
    $cycleId: ID!
    $draftRevision: Int!
    $fingerprint: String!
    $acknowledgement: JSON!
  ) {
    finalizePayrollCycle(
      cycleId: $cycleId
      draftRevision: $draftRevision
      fingerprint: $fingerprint
      acknowledgement: $acknowledgement
    )
  }
`;
