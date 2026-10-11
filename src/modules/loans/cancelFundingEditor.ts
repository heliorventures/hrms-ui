import { CancelLoanFundingDocument } from '../../api/loans/graphql';

import type { LoanEditorDefinition } from './loanForm';
import type { LoanAccount } from './loanTypes';

export function cancelFundingEditor(account: LoanAccount): LoanEditorDefinition {
  return {
    title: 'Cancel unused loan funding',
    description:
      'Cancel the undisbursed part of this approval permanently. Existing principal, interest and repayments remain payable and unchanged. No payment or debt waiver is recorded.',
    fields: [{ key: 'reason', label: 'Cancellation reason', type: 'textarea' }],
    values: {},
    document: CancelLoanFundingDocument,
    version: account.version,
    build: (values) => ({ loanId: account.id, reason: values.reason }),
  };
}
