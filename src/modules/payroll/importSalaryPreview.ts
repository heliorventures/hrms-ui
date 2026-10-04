export interface ImportedSalaryFinancials {
  annual_gross: string;
  annual_employer_pf: string | null;
  annual_ctc: string | null;
  ctc_ready: boolean;
}
export const ImportedSalaryPreviewDocument = /* GraphQL */ `
  query ImportedSalaryPreview($employeeId: ID, $asOf: NaiveDate) {
    employeeSalaryBreakupPreview(employeeId: $employeeId, asOf: $asOf) {
      employeeId
      employeeSalaryStructureId
      annualCtc
      financials
      monthlyGross
      monthlyDeductions
      monthlyNetBeforeStatutory
      lines {
        salaryComponentId
        componentName
        componentCode
        componentType
        calculationBasis
        calculationValue
        annualAmount
        monthlyAmount
        isOverride
      }
    }
  }
`;
