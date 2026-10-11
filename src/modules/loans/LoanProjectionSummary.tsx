import { useMemo, useState } from 'react';

import Card from '../../components/common/Card';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';

import { array, object, text } from './financeJson';
import LoanPager from './LoanPager';

function decode(value: unknown) {
  const result = object(value),
    schedule = object(result.schedule),
    currency = object(result.currency);
  return {
    currency: text(currency.code),
    basis: text(result.basis),
    principal: text(schedule.residualPrincipal),
    interest: text(schedule.residualInterest),
    rows: array(schedule.items).map((item) => {
      const row = object(item);
      return {
        dueDate: text(row.dueDate),
        principal: text(row.principal),
        interest: text(row.interest),
        total: text(row.total),
        principalAfter: text(row.principalAfter),
        interestAfter: text(row.interestAfter),
      };
    }),
  };
}
const columns: DataTableColumn<ReturnType<typeof decode>['rows'][number]>[] = [
  { id: 'dueDate', header: 'Due date', cell: (row) => row.dueDate },
  { id: 'principal', header: 'Principal', cell: (row) => row.principal },
  { id: 'interest', header: 'Interest', cell: (row) => row.interest },
  { id: 'total', header: 'Total repayment', cell: (row) => row.total },
  { id: 'principalAfter', header: 'Remaining principal', cell: (row) => row.principalAfter },
  { id: 'interestAfter', header: 'Remaining interest', cell: (row) => row.interestAfter },
];
const LoanProjectionSummary = ({ projection }: { projection: unknown }) => {
  const data = useMemo(() => decode(projection), [projection]);
  const [page, setPage] = useState(1);
  const basis =
    data.basis === 'FULL_APPROVED_FUNDING_PROJECTION'
      ? 'Assumes the entire approved principal is funded on the terms effective date. Actual disbursement dates and amounts change the schedule.'
      : 'Uses current posted balances and earned interest. Future repayments remain projections.';
  return (
    <Card title={`Repayment projection · ${data.currency}`}>
      <p className="mb-3 text-sm text-content-secondary">{basis}</p>
      <DataTable
        ariaLabel="Projected loan repayments"
        rows={data.rows.slice((page - 1) * 25, page * 25)}
        getRowId={(row) => row.dueDate}
        columns={columns}
      />
      <LoanPager
        page={page}
        hasNext={page * 25 < data.rows.length}
        disabled={false}
        onNext={() => setPage((current) => current + 1)}
        onPrevious={() => setPage((current) => current - 1)}
      />
      <p className="mt-2 text-sm">
        Residual after this schedule: principal {data.principal}, interest {data.interest}.
      </p>
    </Card>
  );
};
export default LoanProjectionSummary;
