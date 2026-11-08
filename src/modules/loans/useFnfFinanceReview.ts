import { useCallback, useRef, useState } from 'react';

import {
  FinalizeReviewedFnfDocument,
  FnfFinancialReviewDocument,
  PreviewFnfLoanExposureDocument,
  SaveFnfFinancialReviewDocument,
  type FnfFinancialReviewQuery,
} from '../../api/loans/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { decisionValues, validateExitContinuation } from './exitDecisionForm';
import { exitExposure } from './exitFinanceModel';
import { exitPayrollContext } from './exitPayrollContext';
import { object, text } from './financeJson';
import { fnfReviewInput } from './fnfReviewInput';
import { initialFnfSources } from './fnfSourceForm';
import { validateLoanFields, type LoanField } from './loanForm';
import { useFnfInputs } from './useFnfInputs';

export function useFnfFinanceReview(separationId: string, onSaved: () => Promise<void>) {
  const client = useGraphClient();
  const query = useRetainedQuery(
    useCallback(
      () => client.request(FnfFinancialReviewDocument, { separationId }),
      [client, separationId]
    )
  );
  const form = useFnfInputs();
  const { context, sources, values, dirty, edit } = form;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const [saved, setSaved] = useState<FnfFinancialReviewQuery['fnfFinancialReview'] | null>(null);
  const prepared = saved ?? query.data?.fnfFinancialReview;
  const prepare = async (date: string) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    form.setContext(null);
    edit();
    try {
      const result = await client.request(PreviewFnfLoanExposureDocument, {
        separationId,
        settlementDate: date,
      });
      const initial = reviewContext(result.previewFnfLoanExposure, prepared?.input);
      form.setSources(initial.sources);
      form.setValues(initial.values);
      form.setContext(initial.context);
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const save = async (fields: LoanField[]) => {
    if (!context || running.current) return;
    const issue =
      validateLoanFields(fields, values) ?? validateExitContinuation(context.exposure, values);
    if (issue) {
      setError(issue);
      return;
    }
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const legacy = prepared?.legacyFiguresFingerprint;
      const result = await client.request(SaveFnfFinancialReviewDocument, {
        input: {
          separationId,
          expectedRevision: prepared?.revision,
          expectedFingerprint: prepared?.fingerprint,
          input: fnfReviewInput(separationId, context, sources, values, legacy),
        },
      });
      setSaved(result.saveFnfFinancialReview);
      form.setReviewing(true);
      form.setDirty(false);
      await query.refresh();
      await onSaved();
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const finalize = async () => {
    if (dirty || !prepared?.revision || !prepared.fingerprint || running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await client.request(FinalizeReviewedFnfDocument, {
        separationId,
        expectedRevision: prepared.revision,
        expectedFingerprint: prepared.fingerprint,
      });
      if (prepared.settlement)
        setSaved({
          ...prepared,
          settlement: { ...prepared.settlement, ...result.finalizeFnfSettlement },
        });
      await query.refresh();
      await onSaved();
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return {
    query,
    prepared,
    context,
    sources,
    setSources: form.setSources,
    values,
    setValues: form.setValues,
    busy,
    error,
    reviewing: form.reviewing,
    dirty,
    edit,
    prepare,
    save,
    finalize,
  };
}

function reviewContext(raw: unknown, input: unknown) {
  const data = object(raw),
    exposure = exitExposure(data.exposure);
  const initial = initialFnfSources(input);
  const prior = input ? object(input) : null;
  return {
    sources: initial.sources,
    values: {
      ...initial.values,
      ...(prior ? decisionValues(prior.loanDecision) : {}),
      minorUnits: exposure.loans[0] ? String(exposure.loans[0].currency.minorUnits) : '',
    },
    context: {
      exposure,
      currency: text(data.companyCurrency),
      payrollContext: exitPayrollContext(data.payrollContext),
    },
  };
}
