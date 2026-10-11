import { useState } from 'react';

import { PreviewLoanExitReviewDocument } from '../../api/loans/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { exitExposure, type ExitExposure } from './exitFinanceModel';
import { exitPayrollContext, type ExitPayrollContext } from './exitPayrollContext';
import type { LoanValues } from './loanForm';

export function useExitFinancePreview(separationId: string) {
  const client = useGraphClient();
  const [date, setDate] = useState('');
  const [preview, setPreview] = useState<{
    exposure: ExitExposure;
    fingerprint: string;
    payrollContext: ExitPayrollContext;
  } | null>(null);
  const [values, setValues] = useState<LoanValues>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const result = await client.request(PreviewLoanExitReviewDocument, {
        separationId,
        settlementDate: date,
      });
      setPreview({
        exposure: exitExposure(result.previewLoanExitReview.exposure),
        fingerprint: result.previewLoanExitReview.separationFingerprint,
        payrollContext: exitPayrollContext(result.previewLoanExitReview.payrollContext),
      });
      setValues({});
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      setLoading(false);
    }
  };
  return { date, setDate, preview, setPreview, values, setValues, loading, error, load };
}
