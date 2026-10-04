import type {
  SubmitTaxProofLineInput,
  UpsertTaxComputationInput,
} from '../../../api/graphql/graphql';
import { validateTenantUploadFile } from '../../../utils/tenantFileUpload';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
const SECTION_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

export function optionalMoneyError(raw: string, label: string): string | null {
  return !raw.trim() || MONEY_PATTERN.test(raw.trim())
    ? null
    : `${label} must be a non-negative amount with up to 2 decimal places.`;
}

export function proofError(
  canSubmit: boolean,
  section: string,
  declared: string,
  actual: string,
  file: File | null
): string | null {
  if (!canSubmit) return 'You do not have permission to submit tax proofs.';
  if (!SECTION_CODE_PATTERN.test(section)) return 'Choose or enter a valid deduction section code.';
  const error =
    optionalMoneyError(declared, 'Declared amount') ?? optionalMoneyError(actual, 'Actual amount');
  if (error) return error;
  if (!file) return 'Proof file is required before submitting a tax proof line.';
  return validateTenantUploadFile(file, 'Proof file');
}

export function declarationError(
  canSubmit: boolean,
  gross: string,
  deductions: string
): string | null {
  if (!canSubmit) return 'You do not have permission to submit tax declarations.';
  return (
    optionalMoneyError(gross, 'Gross income') ?? optionalMoneyError(deductions, 'Total deductions')
  );
}

export function declarationInput(
  context: TaxSubmissionContext,
  gross: string,
  deductions: string
): UpsertTaxComputationInput {
  return {
    fiscalYear: context.fiscal_year,
    taxRegimeChosen: context.settings.regime,
    grossIncome: gross.trim() || null,
    totalDeductions: deductions.trim() || null,
  };
}

export function proofInput(
  context: TaxSubmissionContext,
  sectionCode: string,
  declared: string,
  actual: string,
  fileStorageId: string
): SubmitTaxProofLineInput {
  return {
    fiscalYear: context.fiscal_year,
    sectionCode,
    declaredAmount: declared.trim() || '0',
    actualAmount: actual.trim() || declared.trim() || '0',
    fileStorageId,
  };
}
