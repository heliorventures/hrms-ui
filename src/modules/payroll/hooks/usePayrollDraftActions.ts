import type { GraphQLClient } from 'graphql-request';
import { useEffect, useRef, useState } from 'react';

import { useDialogs } from '../../../contexts/DialogContext';
import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  draftQuery,
  calculateMutation,
  finalizeMutation,
  type PayrollDraft,
} from '../taxProjectionTypes';

export const usePayrollDraftActions = (
  client: GraphQLClient,
  enabled: boolean,
  ownerKey: string,
  reload: () => Promise<void>
) => {
  const { confirm } = useDialogs();
  const [draftState, setDraftState] = useState<{ owner: string; value: PayrollDraft | null }>({
    owner: ownerKey,
    value: null,
  });
  const draft = draftState.owner === ownerKey && enabled ? draftState.value : null;
  const setDraft = (value: PayrollDraft | null) => setDraftState({ owner: ownerKey, value });
  const [runBusy, setRunBusy] = useState<string | null>(null);
  const [runError, setRunError] = useFeedbackState<string | null>(null, 'error');
  const [runOk, setRunOk] = useState<string | null>(null);
  const lifetime = useRef(0);
  useEffect(() => {
    const generation = ++lifetime.current;
    setDraftState({ owner: ownerKey, value: null });
    setRunBusy(null);
    setRunError(null);
    setRunOk(null);
    return () => {
      lifetime.current = generation + 1;
    };
  }, [ownerKey, enabled, setRunError]);
  const runPayroll = async (cycleId: string) => {
    if (!enabled || runBusy) return;
    const generation = lifetime.current;
    setRunBusy(cycleId);
    setRunError(null);
    setDraft(null);
    setRunOk(null);
    try {
      const existing = await client.request<{ payrollDraft: PayrollDraft | null }>(draftQuery, {
        cycleId,
      });
      if (generation !== lifetime.current) return;
      const value = await client.request<{ calculatePayrollCycle: PayrollDraft }>(
        calculateMutation,
        { cycleId, expectedRevision: existing.payrollDraft?.revision ?? null }
      );
      if (generation === lifetime.current) setDraft(value.calculatePayrollCycle);
    } catch (cause) {
      if (generation === lifetime.current) setRunError(graphQlUserMessage(cause));
    } finally {
      if (generation === lifetime.current) setRunBusy(null);
    }
  };
  const finalize = async (employees: string[]) => {
    if (!enabled || !draft || runBusy) return;
    const generation = lifetime.current;
    const approved = await confirm({
      title: 'Finalize and lock payroll?',
      message:
        'This saves the reviewed payslips and prevents recalculation of this cycle. It does not transfer salary or remit tax.',
      confirmLabel: 'Finalize & Lock',
      cancelLabel: 'Keep draft',
      variant: 'danger',
    });
    if (!approved || generation !== lifetime.current) return;
    setRunBusy(draft.cycle_id);
    setRunError(null);
    try {
      await client.request(finalizeMutation, {
        cycleId: draft.cycle_id,
        draftRevision: draft.revision,
        fingerprint: draft.fingerprint,
        acknowledgement: { provisional_tax_employees: employees },
      });
      if (generation !== lifetime.current) return;
      setDraft(null);
      setRunOk('Payroll finalized and locked.');
      await reload();
    } catch (cause) {
      if (generation === lifetime.current) {
        setRunError(`${graphQlUserMessage(cause)} Recalculate to refresh the review.`);
        setDraft(null);
      }
    } finally {
      if (generation === lifetime.current) setRunBusy(null);
    }
  };
  return { draft, runPayroll, finalize, runBusy, runError, runOk };
};
