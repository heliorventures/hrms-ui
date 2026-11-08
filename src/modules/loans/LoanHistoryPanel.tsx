import type { RequestDocument } from 'graphql-request';

import DataTable, { type DataTableColumn } from '../../components/common/DataTable';

import LoanPager from './LoanPager';
import { loanTableState } from './loanTableState';
import { useLoanPage } from './useLoanPage';

interface Props<T> {
  title: string;
  document: RequestDocument;
  field: string;
  loanId: string;
  columns: DataTableColumn<T>[];
}
const LoanHistoryPanel = <T extends { id: string }>({
  title,
  document,
  field,
  loanId,
  columns,
}: Props<T>) => {
  const query = useLoanPage<T>(document, field, undefined, loanId);
  const rows = query.data?.nodes ?? [];
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <DataTable
        ariaLabel={title}
        rows={rows}
        getRowId={(row) => row.id}
        columns={columns}
        state={loanTableState(query.phase === 'initial-loading', query.error, rows.length)}
        stateMessage={query.error ?? undefined}
      />
      <LoanPager
        page={query.page}
        hasNext={query.data?.pageInfo.hasNextPage ?? false}
        disabled={query.phase === 'initial-loading'}
        onNext={query.next}
        onPrevious={query.previous}
      />
    </section>
  );
};
export default LoanHistoryPanel;
