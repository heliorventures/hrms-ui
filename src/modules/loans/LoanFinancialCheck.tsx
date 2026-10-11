import { useCallback, useEffect, useRef, useState } from 'react';

import {
  LoanFinancialReconciliationDocument,
  ReconcileLoanFinancialsDocument,
} from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { financialIssueMessage, parseLoanFinancialReport } from './loanFinancialReport';

const LoanFinancialCheck = ({ loanId, version }: { loanId: string; version: number }) => {
  const client = useGraphClient();
  const notify = useActionFeedback();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const load = useCallback(async () => {
    const result = await client.request(LoanFinancialReconciliationDocument, { loanId });
    return { report: parseLoanFinancialReport(result.loanFinancialReconciliation, loanId) };
  }, [client, loanId]);
  const query = useRetainedQuery(load);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await client.request(ReconcileLoanFinancialsDocument, { loanId });
      if (!mounted.current) return;
      await query.refreshChecked();
      notify('saved', 'Financial check recorded.');
    } catch (failure) {
      if (mounted.current) setError(graphQlUserMessage(failure));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const report = query.data?.report;
  return (
    <section
      className="space-y-2 rounded-lg border border-border-default p-4"
      aria-label="Loan financial check"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Financial check</h3>
        <Button variant="secondary" disabled={busy} onClick={() => void run()}>
          {busy ? 'Checking...' : 'Run financial check'}
        </Button>
      </div>
      {(error || query.error) && <p role="alert">{error || query.error}</p>}
      {query.phase === 'initial-loading' && <p role="status">Loading latest check...</p>}
      {report === null && <p>No financial check has been recorded yet.</p>}
      {report && (
        <>
          <p className="text-sm text-content-secondary">
            Last checked: {new Date(report.checkedAt).toLocaleString()}
          </p>
          {report.accountVersion !== version && (
            <p>Loan records changed after this check. Run a new check.</p>
          )}
          {report.issues.length === 0 ? (
            <p>No inconsistencies found at the last check.</p>
          ) : (
            <>
              <p role="alert">
                Further Payroll/FNF loan recovery for this employee is on hold. Resolve the evidence
                and run the check again.
              </p>
              <ul className="list-disc pl-5">
                {[
                  ...new Map(
                    report.issues.map((issue) => [`${issue.code}-${issue.referenceId}`, issue])
                  ).values(),
                ].map((issue) => (
                  <li key={`${issue.code}-${issue.referenceId}`}>
                    {financialIssueMessage(issue.code)}
                    {issue.referenceId && (
                      <span className="block break-all text-xs text-content-secondary">
                        Review reference: {issue.referenceId}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <p className="text-xs text-content-secondary">
        Checks compare the ledger, recorded payments and issued deductions. Corrections require a
        separate reviewed action.
      </p>
    </section>
  );
};
export default LoanFinancialCheck;
