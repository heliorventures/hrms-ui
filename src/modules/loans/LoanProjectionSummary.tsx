import { useMemo, useState } from 'react';

import Card from '../../components/common/Card';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';

import { array, object, text } from './financeJson';
import LoanPager from './LoanPager';

function summaryText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : 'Unavailable';
}
function projectedMoney(value: unknown, currency: string): string {
  return typeof value === 'string' && value.trim() ? `${currency} ${value}` : 'Unavailable';
}
function expectedCompletion(schedule: Record<string, unknown>): string {
  if (schedule.completionStatus === 'NO_REMAINING_BALANCE') return 'No remaining balance';
  if (schedule.completionStatus === 'RESIDUAL_REMAINING')
    return 'Not fully repaid within this schedule';
  return summaryText(schedule.expectedCompletionDate);
}
function optionalDate(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}
function projectionBasis(basis: string, fundingAssumptionDate: string | null): string {
  if (basis === 'FULL_APPROVED_FUNDING_PROJECTION')
    return 'Assumes the entire approved principal is funded on the terms effective date. Actual disbursement dates and amounts change the schedule.';
  if (basis === 'APPROVED_UNFUNDED_BALANCE_PROJECTION')
    return `Assumes the entire approved principal is funded on ${fundingAssumptionDate ?? 'the assumed funding date'}. Actual disbursement dates and amounts change the schedule.`;
  return 'Uses current posted balances and earned interest. Future repayments remain projections.';
}
function decode(value: unknown) {
  const result = object(value),
    schedule = object(result.schedule),
    currency = object(result.currency);
  return {
    currency: text(currency.code),
    basis: text(result.basis),
    fundingAssumptionDate: optionalDate(result.fundingAssumptionDate),
    principal: text(schedule.residualPrincipal),
    interest: text(schedule.residualInterest),
    expectedCompletion: expectedCompletion(schedule),
    lastScheduledDate: summaryText(schedule.lastScheduledDate),
    projectedInterest: projectedMoney(schedule.projectedInterest, text(currency.code)),
    projectedTotalRepayment: projectedMoney(schedule.projectedTotalRepayment, text(currency.code)),
    rows: array(schedule.items).map((item) => {
      const row = object(item);
      return {
        dueDate: text(row.dueDate),
        valueDate: optionalDate(row.valueDate),
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
  {
    id: 'dueDate',
    header: 'Due date',
    cell: (row) => (
      <>
        <span>{row.dueDate}</span>
        {row.valueDate && row.valueDate !== row.dueDate && (
          <span className="block text-xs text-content-secondary">
            Calculated through {row.valueDate}
          </span>
        )}
      </>
    ),
  },
  { id: 'principal', header: 'Principal', cell: (row) => row.principal },
  { id: 'interest', header: 'Interest', cell: (row) => row.interest },
  { id: 'total', header: 'Total repayment', cell: (row) => row.total },
  { id: 'principalAfter', header: 'Remaining principal', cell: (row) => row.principalAfter },
  { id: 'interestAfter', header: 'Remaining interest', cell: (row) => row.interestAfter },
];
const LoanProjectionSummary = ({ projection }: { projection: unknown }) => {
  const data = useMemo(() => decode(projection), [projection]);
  const [page, setPage] = useState(1);
  const summary = [
    ['Expected completion', data.expectedCompletion],
    ['Last scheduled repayment', data.lastScheduledDate],
    ['Projected interest', data.projectedInterest],
    ['Projected total repayment', data.projectedTotalRepayment],
  ];
  return (
    <Card title={`Repayment projection · ${data.currency}`}>
      <p className="mb-3 text-sm text-content-secondary">
        {projectionBasis(data.basis, data.fundingAssumptionDate)}
      </p>
      <dl className="mb-3 grid gap-3 text-sm sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label}>
            <dt className="text-content-secondary">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
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
