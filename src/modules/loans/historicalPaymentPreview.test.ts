import { describe, expect, it } from 'vitest';

import { historicalPaymentPreview } from './historicalPaymentPreview';

describe('Earlier payment review binding', () => {
  const review = {
    loanId: 'loan-a',
    accountVersion: 5,
    currency: 'INR',
    occurrenceDate: '2026-09-10',
    postingDate: '2026-10-11',
    currentPrincipal: '9098.63',
    currentInterest: '0',
    correctedPrincipal: '8092.27',
    correctedInterest: '0',
    preservedPayrollPostings: ['issued-a'],
    reviewFingerprint: 'a'.repeat(64),
  };
  it('retains current and corrected figures with the reviewed fingerprint', () => {
    expect(historicalPaymentPreview(review, 'loan-a', 5)).toMatchObject({
      correctedPrincipal: '8092.27',
      preservedCount: 1,
      reviewFingerprint: review.reviewFingerprint,
    });
  });
  it('rejects another account, a stale revision or missing financial fields', () => {
    expect(() => historicalPaymentPreview(review, 'loan-b', 5)).toThrow();
    expect(() => historicalPaymentPreview(review, 'loan-a', 6)).toThrow();
    expect(() =>
      historicalPaymentPreview({ ...review, correctedInterest: null }, 'loan-a', 5)
    ).toThrow();
  });
  it('requires a complete reviewed fingerprint and plain decimal figures', () => {
    expect(() =>
      historicalPaymentPreview({ ...review, reviewFingerprint: '' }, 'loan-a', 5)
    ).toThrow();
    expect(() =>
      historicalPaymentPreview({ ...review, correctedPrincipal: '1e3' }, 'loan-a', 5)
    ).toThrow();
  });
});
