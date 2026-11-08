import type { PayslipLoans as LoanSnapshot } from '../payslipLoans';

export const PayslipLoans = ({
  snapshot,
  format,
}: {
  snapshot: LoanSnapshot;
  format: (value: string) => string;
}) => (
  <div className="mt-4 space-y-3 rounded border border-slate-200 p-3 text-sm">
    <p className="font-semibold">Loan recovery and balances</p>
    <p className="text-xs text-slate-600">
      Payment date: {snapshot.valueDate} · Currency: {snapshot.currency} · Recovered:{' '}
      {format(snapshot.total)}
    </p>
    {snapshot.lines.map((line, index) => (
      <div key={line.loanId} className="space-y-1 border-t border-slate-200 pt-2">
        <p className="font-semibold">Loan {index + 1}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt>Principal opening</dt>
          <dd className="text-right tabular-nums">{format(line.principalBefore)}</dd>
          <dt>Interest opening</dt>
          <dd className="text-right tabular-nums">{format(line.interestBefore)}</dd>
          <dt>Principal repaid</dt>
          <dd className="text-right tabular-nums">{format(line.principalRecovered)}</dd>
          <dt>Interest repaid</dt>
          <dd className="text-right tabular-nums">{format(line.interestRecovered)}</dd>
          <dt>Principal remaining</dt>
          <dd className="text-right tabular-nums">{format(line.principalAfter)}</dd>
          <dt>Interest remaining</dt>
          <dd className="text-right tabular-nums">{format(line.interestAfter)}</dd>
          <dt>Earned interest</dt>
          <dd className="text-right tabular-nums">{format(line.accruedInterest)}</dd>
          <dt>Deferred recovery</dt>
          <dd className="text-right tabular-nums">{format(line.deferred)}</dd>
        </dl>
      </div>
    ))}
  </div>
);
