import { expect, it } from 'vitest';

import { exitDecisionFields } from './exitDecisionForm';
import { exitPayrollContext } from './exitPayrollContext';
import { fnfSourceFields, fnfSources } from './fnfSourceForm';

it('requires complete payroll coverage rather than presenting missing data as no payroll', () => {
  expect(() => exitPayrollContext({ draftCycles: [] })).toThrow();
  expect(exitPayrollContext({ draftCycles: [], recentIssuedPayslips: [] }).draftCycles).toEqual([]);
});
it('offers only server-provided prepared draft cycles and keeps issued references outside recovery', () => {
  const context = exitPayrollContext({
    draftCycles: [{ id: 'draft', year: 2026, month: 10 }],
    recentIssuedPayslips: [
      { id: 'issued', cycleId: 'processed', year: 2026, month: 9, amount: '9000' },
    ],
  });
  const exposure = {
    fingerprint: 'review',
    asOf: '2026-10-11',
    settlementDate: '2026-10-31',
    loans: [
      {
        loanId: 'loan',
        loanNumber: 'LN-1',
        currency: { code: 'INR', minorUnits: 2 },
        principal: '1000',
        postedInterest: '0',
        earnedUnpostedInterest: '0',
        forecastInterest: '0',
        forecastPayoff: '1000',
        unfundedCommitment: '0',
        unappliedCredit: '0',
        fnfAllowed: true,
        continuingAllowed: true,
      },
    ],
  };
  const cycle = exitDecisionFields(exposure, [], true, context.draftCycles).find(
    (field) => field.key === 'loan:cycle'
  );
  expect(cycle?.options?.map((option) => option.value)).toEqual(['', 'draft']);
  const sources = [{ id: 'issued', kind: 'PAYROLL_REFERENCE' }];
  expect(fnfSourceFields(sources).find((field) => field.key === 'issued:amount')?.readOnly).toBe(
    true
  );
  expect(
    fnfSources(sources, {
      'issued:amount': '9000',
      'issued:alreadyPaid': '0',
      'issued:otherRecovery': '0',
      'issued:eligible': 'no',
      'issued:approvalReference': 'Verified issued salary',
    })[0].eligibleForLoan
  ).toBe(false);
});
