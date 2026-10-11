import Card from '../../components/common/Card';

import type { ExitExposure } from './exitFinanceModel';

const ExitExposureSummary = ({ exposure }: { exposure: ExitExposure }) => (
  <Card title="Loan exposure">
    <p className="mb-3 text-sm text-content-secondary">
      Posted balances as of {exposure.asOf}. Forecast payoff at {exposure.settlementDate} includes
      earned interest through that date. Proposals do not reduce the loan balance.
    </p>
    {!exposure.loans.length && <p>No outstanding loans or employee credit were found.</p>}
    <div className="space-y-3">
      {exposure.loans.map((loan) => (
        <section key={loan.loanId} className="rounded-lg border border-line-subtle p-3">
          <p className="font-medium">
            {loan.loanNumber} · {loan.currency.code}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {[
              ['Principal', loan.principal],
              ['Posted interest', loan.postedInterest],
              ['Earned, unposted interest', loan.earnedUnpostedInterest],
              ['Projected additional interest', loan.forecastInterest],
              ['Forecast payoff', loan.forecastPayoff],
              ['Undisbursed approval', loan.unfundedCommitment],
              ['Employee credit', loan.unappliedCredit],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt className="text-content-secondary">{label}</dt>
                <dd>{amount}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
    <p className="mt-3 text-sm text-content-secondary">
      FNF availability remains pending until its actual payout sources are calculated and reviewed.
      Any shortfall remains a loan receivable.
    </p>
  </Card>
);
export default ExitExposureSummary;
