import {
  RecordLoanDisbursementDocument,
  RecordLoanReceiptDocument,
  SetLoanDeductionDocument,
  SetLoanPeriodOverrideDocument,
} from '../../api/loans/graphql';

import { choices, yesNo, type LoanEditorDefinition } from './loanForm';
import type { LoanAccount } from './loanTypes';

export function paymentEditor(account: LoanAccount, receipt: boolean): LoanEditorDefinition {
  return {
    title: receipt ? 'Record repayment' : 'Record disbursement',
    description: `${account.loanNumber} · ${account.employeeName} · ${account.currency}. Record a payment already made outside this system.`,
    document: receipt ? RecordLoanReceiptDocument : RecordLoanDisbursementDocument,
    version: account.version,
    values: {},
    fields: [
      { key: 'amount', label: 'Amount', type: 'decimal' },
      { key: 'valueDate', label: 'Payment value date', type: 'date' },
      { key: 'method', label: 'Payment method' },
      { key: 'externalReference', label: 'Payment reference' },
      { key: 'evidenceReference', label: 'Receipt or approval evidence reference' },
      ...(!receipt
        ? [
            {
              key: 'resignationExceptionReason',
              label: 'HR/Admin resignation funding exception reason',
              type: 'textarea' as const,
              optional: true,
              description:
                'Required when recording a payment on or after a pending resignation request. Requires company HR/Admin authority.',
            },
          ]
        : []),
    ],
    build: (values) => ({
      loanId: account.id,
      ...values,
      ...(!receipt
        ? { resignationExceptionReason: values.resignationExceptionReason.trim() || null }
        : {}),
    }),
  };
}
export function deductionEditor(account: LoanAccount): LoanEditorDefinition {
  return {
    title: 'Configure loan deduction',
    description: `${account.loanNumber} · ${account.currency}. HR selects the effective arrangement under the approved policy.`,
    document: SetLoanDeductionDocument,
    version: account.version,
    values: {},
    fields: [
      { key: 'effectiveFrom', label: 'Effective from', type: 'date' },
      { key: 'firstDueDate', label: 'First due date', type: 'date' },
      { key: 'amount', label: 'Monthly amount', type: 'decimal' },
      {
        key: 'recovery',
        label: 'Repayment method',
        options: choices(['PAYROLL', 'EXTERNAL', 'MIXED']),
      },
      { key: 'reason', label: 'Agreement or policy reason', type: 'textarea' },
    ],
    build: (values) => ({ loanId: account.id, ...values }),
  };
}
export function overrideEditor(account: LoanAccount): LoanEditorDefinition {
  return {
    title: 'Change one deduction period',
    description: `${account.loanNumber}. Select the first day of the month. Zero skips recovery; pausing interest requires policy permission.`,
    document: SetLoanPeriodOverrideDocument,
    version: account.version,
    values: {},
    fields: [
      { key: 'periodStart', label: 'Period start', type: 'date' },
      { key: 'amount', label: 'Recovery amount for this period', type: 'decimal', optional: true },
      { key: 'pauseInterest', label: 'Pause interest for this period', options: yesNo },
      { key: 'reason', label: 'Reason', type: 'textarea' },
    ],
    build: (values) => ({
      loanId: account.id,
      periodStart: values.periodStart,
      amount: values.amount || null,
      pauseInterest: values.pauseInterest === 'yes',
      reason: values.reason,
    }),
  };
}
