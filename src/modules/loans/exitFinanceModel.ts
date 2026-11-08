import { array, flag, number, object, text } from './financeJson';

export interface ExitLoan {
  loanId: string;
  loanNumber: string;
  currency: { code: string; minorUnits: number };
  principal: string;
  postedInterest: string;
  earnedUnpostedInterest: string;
  forecastInterest: string;
  forecastPayoff: string;
  unfundedCommitment: string;
  unappliedCredit: string;
  fnfAllowed: boolean;
  continuingAllowed: boolean;
}
export interface ExitExposure {
  fingerprint: string;
  asOf: string;
  settlementDate: string;
  loans: ExitLoan[];
}
function loan(value: unknown): ExitLoan {
  const row = object(value);
  const currency = object(row.currency);
  return {
    loanId: text(row.loanId),
    loanNumber: text(row.loanNumber),
    currency: { code: text(currency.code), minorUnits: number(currency.minorUnits) },
    principal: text(row.principal),
    postedInterest: text(row.postedInterest),
    earnedUnpostedInterest: text(row.earnedUnpostedInterest),
    forecastInterest: text(row.forecastInterest),
    forecastPayoff: text(row.forecastPayoff),
    unfundedCommitment: text(row.unfundedCommitment),
    unappliedCredit: text(row.unappliedCredit),
    fnfAllowed: flag(row.fnfAllowed),
    continuingAllowed: flag(row.continuingAllowed),
  };
}
export function exitExposure(value: unknown): ExitExposure {
  const row = object(value);
  return {
    fingerprint: text(row.fingerprint),
    asOf: text(row.asOf),
    settlementDate: text(row.settlementDate),
    loans: array(row.loans).map(loan),
  };
}
export interface FinanceOwner {
  id: string;
  name: string;
}
