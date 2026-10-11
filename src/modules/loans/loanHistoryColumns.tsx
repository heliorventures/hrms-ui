import type {
  LoanLedgerQuery,
  LoanPaymentsQuery,
  LoanSchedulesQuery,
} from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import type { DataTableColumn } from '../../components/common/DataTable';

export type LoanPosting = LoanLedgerQuery['loanLedger']['nodes'][number];
type Payment = LoanPaymentsQuery['loanPayments']['nodes'][number];
type Schedule = LoanSchedulesQuery['loanSchedules']['nodes'][number];
export const paymentColumns: DataTableColumn<Payment>[] = [
  { id: 'date', header: 'Value date', cell: (r) => r.valueDate },
  { id: 'kind', header: 'Type', cell: (r) => r.kind },
  { id: 'amount', header: 'Amount', numeric: true, cell: (r) => r.amount },
  { id: 'method', header: 'Method', cell: (r) => r.method },
  { id: 'reference', header: 'Reference', cell: (r) => r.externalReference },
  { id: 'credit', header: 'Unapplied credit', numeric: true, cell: (r) => r.unappliedCredit },
  {
    id: 'exception',
    header: 'Funding exception',
    cell: (r) => r.resignationExceptionReason ?? '—',
  },
];
export const scheduleColumns: DataTableColumn<Schedule>[] = [
  { id: 'version', header: 'Version', cell: (r) => r.version },
  { id: 'date', header: 'Effective from', cell: (r) => r.effectiveFrom },
  { id: 'amount', header: 'Monthly amount', numeric: true, cell: (r) => r.monthlyAmount },
  { id: 'method', header: 'Method', cell: (r) => r.recoveryMode },
];
export function ledgerColumns(
  busy: boolean,
  onCorrect?: (row: LoanPosting) => void
): DataTableColumn<LoanPosting>[] {
  return [
    { id: 'date', header: 'Value date', cell: (r) => r.valueDate },
    { id: 'kind', header: 'Posting', cell: (r) => r.kind },
    { id: 'source', header: 'Source', cell: (r) => r.sourceKind.replace(/_/g, ' ') },
    { id: 'principal', header: 'Principal change', numeric: true, cell: (r) => r.principalDelta },
    { id: 'interest', header: 'Interest change', numeric: true, cell: (r) => r.interestDelta },
    {
      id: 'correct',
      header: 'Actions',
      cell: (r) =>
        onCorrect &&
        ['EXTERNAL_DISBURSEMENT', 'EXTERNAL_RECEIPT'].includes(r.sourceKind) && (
          <Button variant="quiet" disabled={busy} onClick={() => onCorrect(r)}>
            Review correction
          </Button>
        ),
    },
  ];
}
