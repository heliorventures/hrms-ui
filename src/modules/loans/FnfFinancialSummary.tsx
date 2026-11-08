import Card from '../../components/common/Card';

import { object, text } from './financeJson';

function amounts(value: unknown) {
  if (!value) return null;
  const row = object(value);
  return {
    currency: text(row.currency),
    date: text(row.valueDate),
    rows: [
      ['Available payout before loan', text(row.availablePayout)],
      ['Other recoveries', text(row.otherRecoveries)],
      ['Loan recovery from this FNF', text(row.loanRecovered)],
      ['Employee cash payout', text(row.employeePayout)],
      ['Remaining loan receivable', text(row.residualLoanReceivable)],
    ],
  };
}
const FnfFinancialSummary = ({ financials }: { financials: unknown }) => {
  const data = amounts(financials);
  if (!data)
    return (
      <p className="text-sm text-content-secondary">
        FNF financial sources are pending calculation and review.
      </p>
    );
  return (
    <Card title={`Reviewed FNF · ${data.currency} · ${data.date}`}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {data.rows.map(([label, amount]) => (
          <div key={label}>
            <dt className="text-sm text-content-secondary">{label}</dt>
            <dd className="font-medium">{amount}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-content-secondary">
        A zero cash payout does not clear any remaining loan debt. Finalization records the approved
        set-off; this system does not transfer money.
      </p>
    </Card>
  );
};
export default FnfFinancialSummary;
