import { array, number, object, text } from './financeJson';

export function historicalPaymentPreview(value: unknown, loanId: string, version: number) {
  const row = object(value);
  if (
    text(row.loanId) !== loanId ||
    number(row.accountVersion) !== version ||
    !/^[a-f0-9]{64}$/.test(text(row.reviewFingerprint))
  ) {
    throw new Error('Loan records changed. Refresh the account and review the payment again.');
  }
  const amount = (value: unknown) => {
    const raw = text(value);
    if (!/^(0|[1-9]\d*)(\.\d{1,6})?$/.test(raw))
      throw new Error('Financial review contains an invalid balance.');
    return raw;
  };
  return {
    currency: text(row.currency),
    occurrenceDate: text(row.occurrenceDate),
    postingDate: text(row.postingDate),
    currentPrincipal: amount(row.currentPrincipal),
    currentInterest: amount(row.currentInterest),
    correctedPrincipal: amount(row.correctedPrincipal),
    correctedInterest: amount(row.correctedInterest),
    preservedCount: array(row.preservedPayrollPostings).length,
    reviewFingerprint: text(row.reviewFingerprint),
  };
}
