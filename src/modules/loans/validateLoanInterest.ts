import type { LoanValues } from './loanForm';

function reducing(values: LoanValues) {
  if (!values.rate) return 'Enter the interest rate.';
  if (!values.convention) return 'Select the reducing interest basis.';
  if (values.convention === 'Monthly' && !values.partialPeriod)
    return 'Select how monthly partial periods are calculated.';
  return null;
}
export function validateLoanInterest(values: LoanValues) {
  switch (values.interest) {
    case 'OneTimePercentage':
      return values.rate ? null : 'Enter the interest rate.';
    case 'OneTimeFixed':
      return values.fixedCharge ? null : 'Enter the fixed interest charge.';
    case 'ReducingBalance':
      return reducing(values);
    default:
      return null;
  }
}
