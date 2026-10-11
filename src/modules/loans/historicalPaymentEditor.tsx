import {
  LoanHistoricalPaymentKind,
  PreviewHistoricalLoanPaymentDocument,
  RecordHistoricalLoanPaymentDocument,
} from '../../api/loans/graphql';

import { historicalPaymentPreview } from './historicalPaymentPreview';
import HistoricalPaymentSummary from './HistoricalPaymentSummary';
import type { LoanEditorDefinition, LoanValues } from './loanForm';
import type { LoanAccount } from './loanTypes';
import { paymentEditor } from './paymentEditor';

export function historicalPaymentEditor(
  account: LoanAccount,
  receipt: boolean
): LoanEditorDefinition {
  const base = paymentEditor(account, receipt);
  const payment = (values: LoanValues) => ({
    loanId: account.id,
    amount: values.amount,
    valueDate: values.valueDate,
    method: values.method,
    externalReference: values.externalReference,
    evidenceReference: values.evidenceReference,
    resignationExceptionReason: receipt ? null : values.resignationExceptionReason.trim() || null,
  });
  const kind = receipt ? LoanHistoricalPaymentKind.Receipt : LoanHistoricalPaymentKind.Disbursement;
  return {
    ...base,
    title: receipt ? 'Review earlier repayment' : 'Review earlier disbursement',
    description: `${account.loanNumber}. Use this when an external payment occurred before the latest posted calculation. HR reviews a current adjustment; issued payslips and settlements remain unchanged.`,
    document: RecordHistoricalLoanPaymentDocument,
    fields: [
      ...base.fields,
      { key: 'reason', label: 'Reason for recording this payment late', type: 'textarea' },
      { key: 'reconciliationReference', label: 'HR approval / reconciliation reference' },
    ],
    preview: async (values, client) => {
      const result = await client.request(PreviewHistoricalLoanPaymentDocument, {
        input: {
          ...payment(values),
          meta: { idempotencyKey: 'preview-historical-payment', expectedVersion: account.version },
        },
        kind,
      });
      historicalPaymentPreview(result.previewHistoricalLoanPayment, account.id, account.version);
      return result.previewHistoricalLoanPayment;
    },
    renderPreview: (value) => (
      <HistoricalPaymentSummary
        preview={historicalPaymentPreview(value, account.id, account.version)}
      />
    ),
    build: (values, preview) => ({
      ...payment(values),
      kind,
      reason: values.reason,
      reconciliationReference: values.reconciliationReference,
      reviewFingerprint: historicalPaymentPreview(preview, account.id, account.version)
        .reviewFingerprint,
    }),
  };
}
