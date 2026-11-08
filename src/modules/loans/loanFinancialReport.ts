export interface LoanFinancialReport {
  checkedAt: string;
  accountVersion: number;
  issues: { code: string; referenceId: string | null }[];
}

export function parseLoanFinancialReport(
  value: unknown,
  loanId: string
): LoanFinancialReport | null {
  if (value === null) return null;
  const report = value as (Partial<LoanFinancialReport> & { loanId?: string }) | undefined;
  if (
    !report ||
    report.loanId !== loanId ||
    typeof report.checkedAt !== 'string' ||
    !Number.isFinite(Date.parse(report.checkedAt)) ||
    !Number.isSafeInteger(report.accountVersion) ||
    (report.accountVersion ?? 0) < 1 ||
    !validIssues(report.issues)
  ) {
    throw new Error('Financial check could not be read. Refresh or run the check again.');
  }
  return report as LoanFinancialReport;
}

function validIssues(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => {
      if (!item || typeof item !== 'object') return false;
      const issue = item as { code?: unknown; referenceId?: unknown };
      return (
        typeof issue.code === 'string' &&
        (issue.referenceId === null || typeof issue.referenceId === 'string')
      );
    })
  );
}

const issueMessages: Record<string, string> = {
  POSTING_LEDGER_MISMATCH: 'A financial posting differs from the loan ledger.',
  REPAYMENT_ALLOCATION_MISMATCH: 'A repayment allocation differs from its financial posting.',
  DISBURSEMENT_SOURCE_MISMATCH: 'A disbursement differs from its recorded payment.',
  RECEIPT_SOURCE_MISMATCH: 'A receipt differs from the repayment and held credit recorded for it.',
  ACCOUNT_BALANCE_MISMATCH: 'The balance or funded amount needs review.',
  ACCOUNT_STATE_MISMATCH: 'The account status differs from its financial balance.',
  ISSUED_SOURCE_MISMATCH:
    'A loan recovery could not be verified against issued Payroll/FNF evidence.',
  ISSUED_ALLOCATION_MISMATCH:
    'An issued Payroll/FNF deduction could not be matched to a loan recovery.',
  INVALID_PAYSLIP_EVIDENCE: 'Issued payslip deduction evidence needs review.',
  INVALID_FNF_EVIDENCE: 'Issued final settlement evidence needs review.',
};
export const financialIssueMessage = (code: string) =>
  issueMessages[code] ?? 'A financial inconsistency needs review before further recovery.';
