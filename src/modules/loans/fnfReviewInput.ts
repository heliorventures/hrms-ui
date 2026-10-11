import { exitDecision } from './exitDecisionForm';
import type { ExitExposure } from './exitFinanceModel';
import { fnfSources, type FnfSource } from './fnfSourceForm';
import type { LoanValues } from './loanForm';

export function fnfReviewInput(
  separationId: string,
  context: { exposure: ExitExposure; currency: string },
  sources: FnfSource[],
  values: LoanValues,
  legacy?: string | null
) {
  return {
    separationId,
    valueDate: context.exposure.settlementDate,
    currency: { code: context.currency, minorUnits: Number(values.minorUnits) },
    exitReviewId: null,
    financialApprovalReference: values.approval,
    sources: fnfSources(sources, values),
    loanDecision: exitDecision(context.exposure, values, false),
    legacyReview: legacy
      ? {
          originalFiguresFingerprint: legacy,
          reason: values.legacyReason,
          classifyAsOtherRecoveries: values.legacyOther === 'yes',
        }
      : null,
  };
}
