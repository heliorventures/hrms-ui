import { useState } from 'react';

import { PreviewLoanReversalDocument, ReverseLoanPostingDocument } from '../../api/loans/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import type { LoanEditorDefinition } from './loanForm';
import type { LoanPosting } from './loanHistoryColumns';

export function useLoanCorrection(accountId: string) {
  const client = useGraphClient();
  const [editor, setEditor] = useState<LoanEditorDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const correct = async (posting: LoanPosting) => {
    if (correcting) return;
    setCorrecting(true);
    setError(null);
    try {
      const result = await client.request(PreviewLoanReversalDocument, {
        loanId: accountId,
        postingId: posting.id,
      });
      const preview = result.previewLoanReversal;
      setEditor({
        title: 'Review payment correction',
        description: `Current: principal ${preview.currentPrincipal}, interest ${preview.currentInterest}. Corrected: principal ${preview.correctedPrincipal}, interest ${preview.correctedInterest} ${preview.currency}. Issued payslips stay unchanged; this records a current adjustment.`,
        document: ReverseLoanPostingDocument,
        version: preview.accountVersion,
        values: {},
        fields: [
          { key: 'reason', label: 'Correction reason', type: 'textarea' },
          { key: 'reconciliationReference', label: 'HR approval / reconciliation reference' },
        ],
        build: (values) => ({
          loanId: accountId,
          postingId: posting.id,
          reviewFingerprint: preview.reviewFingerprint,
          ...values,
        }),
      });
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      setCorrecting(false);
    }
  };
  return { editor, setEditor, error, correcting, correct };
}
