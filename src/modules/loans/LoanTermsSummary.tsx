import Card from '../../components/common/Card';

import { object, text } from './financeJson';

function interestDescription(value: unknown): string {
  if (value === 'InterestFree') return 'Interest free';
  const method = object(value);
  if (method.OneTimePercentage)
    return `${text(object(method.OneTimePercentage).rate)}% one-time charge on actual funding`;
  if (method.OneTimeFixed)
    return `Fixed charge ${text(object(method.OneTimeFixed).amount)}, apportioned to actual funding`;
  const reducing = object(method.ReducingBalance);
  const convention = reducing.convention === 'Act365Fixed' ? 'ACT/365 Fixed' : 'monthly convention';
  return `${text(reducing.annualRate)}% annual reducing balance · ${convention}`;
}
const LoanTermsSummary = ({ terms }: { terms: unknown }) => {
  const row = object(terms);
  const items = [
    ['Interest', interestDescription(row.interest)],
    ['Normal total repayment', text(row.monthlyAmount)],
    ['Repayment method', text(row.recovery)],
    ['Allocation', text(row.allocation)],
    ['Rounding', text(row.rounding)],
  ];
  return (
    <Card title="Approved loan terms">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-content-secondary">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-content-secondary">
        The monthly amount includes principal and interest. Current repayment arrangements and
        period overrides can change future deductions.
      </p>
    </Card>
  );
};
export default LoanTermsSummary;
