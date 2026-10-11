import { DecideLoanRequestDocument, LoanRequestDecision } from '../../api/loans/graphql';

import type { LoanEditorDefinition } from './loanForm';
import type { LoanRequest } from './loanTypes';

export function requestDecisionEditor(
  request: LoanRequest,
  decision: LoanRequestDecision
): LoanEditorDefinition {
  return {
    title:
      decision === LoanRequestDecision.Approve
        ? 'Approve loan request step'
        : `${decision === LoanRequestDecision.Reject ? 'Reject' : 'Return'} loan request`,
    description: `${request.employeeName} · ${request.purpose} · ${request.currency} ${request.requestedAmount}`,
    document: DecideLoanRequestDocument,
    version: request.version,
    values: {},
    fields: [{ key: 'reason', label: 'Decision reason', type: 'textarea' }],
    build: (values) => ({
      requestId: request.id,
      stepId: request.currentStepId,
      decision,
      reason: values.reason,
    }),
  };
}
