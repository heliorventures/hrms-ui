import type { PayrollLoanReview as ReviewedRecovery } from '../payrollLoanReview';

export const PayrollLoanReview = ({ reviewed }: { reviewed: ReviewedRecovery }) => (
  <details className="mt-2 text-xs">
    <summary className="cursor-pointer">Review loan recovery</summary>
    <p className="mt-1">
      Payment date {reviewed.quote.input.value_date} · {reviewed.quote.input.currency.code}{' '}
      {reviewed.quote.total} recovered
    </p>
    <ul className="mt-1 space-y-1">
      {reviewed.quote.lines.map((line, index) => (
        <li key={line.loan_id}>
          Loan {index + 1}: Principal {line.principal} · Interest {line.interest} · Deferred{' '}
          {line.deferred}
        </li>
      ))}
    </ul>
  </details>
);
