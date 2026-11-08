import { useState } from 'react';

import { LoanStatementDocument, type LoanStatementQuery } from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { loanCsvCell } from './loanCsv';
import { allLoanPages } from './loanPagination';
import type { LoanAccount } from './loanTypes';

async function statement(client: ReturnType<typeof useGraphClient>, account: LoanAccount) {
  const rows = await allLoanPages<LoanStatementQuery['loanStatement']['nodes'][number]>(
    async (after) => {
      const result: LoanStatementQuery = await client.request(LoanStatementDocument, {
        loanId: account.id,
        expectedVersion: account.version,
        after,
        first: 100,
      });
      return result.loanStatement;
    }
  );
  const content = [
    [
      'Date',
      'Event',
      'Source',
      'Source reference',
      'Amount',
      'Principal change',
      'Interest change',
      'Reversal of',
    ],
    ...rows.map((row) => [
      row.valueDate,
      row.kind,
      row.sourceKind,
      row.sourceId,
      row.amount,
      row.principalDelta,
      row.interestDelta,
      row.reversalOf ?? '',
    ]),
  ]
    .map((row) => row.map(loanCsvCell).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${account.loanNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}-statement.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}
const LoanStatementExport = ({ account }: { account: LoanAccount }) => {
  const client = useGraphClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const exportStatement = async () => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage(`${await statement(client, account)} posted transactions exported.`);
    } catch (failure) {
      setMessage(graphQlUserMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-2">
      <Button variant="secondary" disabled={busy} onClick={() => void exportStatement()}>
        Export complete loan statement
      </Button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
};
export default LoanStatementExport;
