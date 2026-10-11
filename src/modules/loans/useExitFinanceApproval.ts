import { useRef, useState } from 'react';

import {
  ApproveSeparationWithFinanceDocument,
  SaveLoanExitReviewDocument,
} from '../../api/loans/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { exitDecision, validateExitContinuation } from './exitDecisionForm';
import type { ExitExposure } from './exitFinanceModel';
import { validateLoanFields, type LoanField, type LoanValues } from './loanForm';

export function useExitFinanceApproval(separationId: string, onSaved: () => Promise<void>) {
  const client = useGraphClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const running = useRef(false);
  const approve = async (
    exposure: ExitExposure,
    sourceFingerprint: string,
    values: LoanValues,
    fields: LoanField[]
  ) => {
    if (running.current) return;
    const issue = validateLoanFields(fields, values) ?? validateExitContinuation(exposure, values);
    if (issue) {
      setError(issue);
      return;
    }
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      let reference = reviewId;
      if (!reference) {
        const saved = await client.request(SaveLoanExitReviewDocument, {
          input: {
            separationId,
            settlementDate: exposure.settlementDate,
            separationFingerprint: sourceFingerprint,
            exposureFingerprint: exposure.fingerprint,
            decision: exitDecision(exposure, values, true),
          },
        });
        reference = saved.saveLoanExitReview.id;
        setReviewId(reference);
      }
      if (!approved) {
        await client.request(ApproveSeparationWithFinanceDocument, {
          separationId,
          financeReviewId: reference,
        });
        setApproved(true);
      }
      await onSaved();
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return { busy, error, reviewId, approved, approve };
}
