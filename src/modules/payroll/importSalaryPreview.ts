export { ImportedSalaryPreviewDocument } from '../../api/graphql/graphql';
export interface ImportedSalaryFinancials {
  annual_gross: string;
  annual_employer_pf: string | null;
  annual_ctc: string | null;
  ctc_ready: boolean;
}
