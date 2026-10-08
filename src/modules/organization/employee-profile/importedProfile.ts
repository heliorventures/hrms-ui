export { EmployeeImportedProfileDocument as importedProfileDocument } from '../../../api/graphql/graphql';
export interface ImportedProfile {
  confirmation_date: string | null;
  source_exit_date: string | null;
  source_last_working_date: string | null;
  account_holder: string | null;
  bank_branch: string | null;
}
