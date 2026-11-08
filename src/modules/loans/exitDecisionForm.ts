import type { ExitExposure, FinanceOwner } from './exitFinanceModel';
import { payrollPeriod, type ExitPayrollCycle } from './exitPayrollContext';
import { array, object, text } from './financeJson';
import { yesNo, type LoanField, type LoanValues } from './loanForm';

const key = (id: string, field: string) => `${id}:${field}`;
export function exitDecisionFields(
  exposure: ExitExposure,
  owners: FinanceOwner[],
  payroll: boolean,
  cycles: ExitPayrollCycle[] = []
) {
  return exposure.loans.flatMap((loan): LoanField[] => {
    const field = (name: string, label: string, type?: LoanField['type']): LoanField => ({
      key: key(loan.loanId, name),
      label: `${loan.loanNumber} · ${label}`,
      type,
    });
    const optional = (name: string, label: string, type?: LoanField['type']): LoanField => ({
      ...field(name, label, type),
      optional: true,
    });
    return [
      field('fnf', `Proposed FNF recovery (${loan.currency.code})`, 'decimal'),
      ...(payroll
        ? [
            field('payroll', 'Proposed final payroll recovery', 'decimal'),
            {
              ...optional('cycle', 'Final payroll cycle'),
              options: [
                { value: '', label: 'Choose a prepared draft cycle' },
                ...cycles.map((cycle) => ({
                  value: cycle.id,
                  label: `${payrollPeriod(cycle)} · ${cycle.id.slice(0, 8)}`,
                })),
              ],
            },
          ]
        : []),
      { ...field('continue', 'Continuing external repayment'), options: yesNo },
      optional('first', 'First continuing payment date', 'date'),
      optional('monthly', 'Continuing monthly amount', 'decimal'),
      {
        ...optional('owner', 'Repayment follow-up owner'),
        options: [
          { value: '', label: 'Choose an owner' },
          ...owners.map((owner) => ({ value: owner.id, label: owner.name })),
        ],
      },
      optional('agreement', 'Continuing repayment agreement reference'),
    ];
  });
}
export function exitDecision(exposure: ExitExposure, values: LoanValues, payroll: boolean) {
  return {
    reason: values.reason,
    loans: exposure.loans.map((loan) => {
      const value = (field: string) => values[key(loan.loanId, field)];
      return {
        loanId: loan.loanId,
        finalPayrollCycleId: payroll && value('cycle') ? value('cycle') : null,
        proposedPayrollRecovery: payroll ? value('payroll') : '0',
        proposedFnfRecovery: value('fnf'),
        continuing:
          value('continue') === 'yes'
            ? {
                firstPaymentDate: value('first'),
                monthlyAmount: value('monthly'),
                followUpUserId: value('owner'),
                agreementReference: value('agreement'),
              }
            : null,
      };
    }),
  };
}
export function validateExitContinuation(exposure: ExitExposure, values: LoanValues) {
  for (const loan of exposure.loans) {
    if (values[key(loan.loanId, 'continue')] !== 'yes') continue;
    if (!loan.continuingAllowed)
      return `${loan.loanNumber}: company policy does not permit continuing repayment.`;
    for (const field of ['first', 'monthly', 'owner', 'agreement']) {
      if (!values[key(loan.loanId, field)])
        return `${loan.loanNumber}: complete the continuing repayment agreement, amount, date and owner.`;
    }
  }
  return null;
}
export function decisionValues(value: unknown): LoanValues {
  return parseDecision(value);
}

function parseDecision(value: unknown): LoanValues {
  const decision = object(value);
  const values: LoanValues = { reason: text(decision.reason) };
  for (const item of array(decision.loans)) {
    const row = object(item),
      id = text(row.loanId);
    values[key(id, 'fnf')] = text(row.proposedFnfRecovery);
    values[key(id, 'payroll')] = text(row.proposedPayrollRecovery);
    values[key(id, 'cycle')] =
      typeof row.finalPayrollCycleId === 'string' ? row.finalPayrollCycleId : '';
    values[key(id, 'continue')] = row.continuing ? 'yes' : 'no';
    if (row.continuing) {
      const continuation = object(row.continuing);
      for (const [target, source] of [
        ['first', 'firstPaymentDate'],
        ['monthly', 'monthlyAmount'],
        ['owner', 'followUpUserId'],
        ['agreement', 'agreementReference'],
      ])
        values[key(id, target)] = text(continuation[source]);
    }
  }
  return values;
}
