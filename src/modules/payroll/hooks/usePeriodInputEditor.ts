import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { newPeriodInput } from '../newPeriodInput';
import {
  periodInputQuery,
  savePeriodInputMutation,
  type PeriodInput,
  type PeriodRecord,
} from '../periodInputTypes';

export const usePeriodInputEditor = (
  client: GraphQLClient,
  employeeId: string,
  year: number,
  month: number
) => {
  const [record, setRecord] = useState<PeriodRecord | null>(null);
  const [draft, setDraft] = useState<PeriodInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [revised, setRevised] = useState(false);
  useEffect(() => {
    let active = true;
    client
      .request<{ payrollPeriodInput: PeriodRecord | null }>(periodInputQuery, {
        employeeId,
        year,
        month,
      })
      .then((result) => {
        if (active) {
          setRecord(result.payrollPeriodInput);
          setDraft(result.payrollPeriodInput?.input ?? null);
          setBusy(false);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(graphQlUserMessage(reason));
          setBusy(false);
        }
      });
    return () => {
      active = false;
    };
  }, [client, employeeId, year, month]);
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const input = {
      ...draft,
      ready: true,
      expected_statement: revised ? {} : draft.expected_statement,
    };
    try {
      const result = await client.request<{ savePayrollPeriodInput: PeriodRecord }>(
        savePeriodInputMutation,
        { employeeId, input, expectedRevision: record?.revision ?? null }
      );
      setRecord(result.savePayrollPeriodInput);
      setDraft(result.savePayrollPeriodInput.input);
      setNotice(
        result.savePayrollPeriodInput.ready
          ? 'Monthly input is ready for payroll generation.'
          : `Saved as a draft. ${result.savePayrollPeriodInput.validationError ?? 'Review unresolved amounts, component totals and deduction reasons.'}`
      );
    } catch (reason) {
      setError(graphQlUserMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  return {
    record,
    draft,
    setDraft,
    error,
    busy,
    notice,
    revised,
    setRevised,
    save,
    create: () => setDraft(newPeriodInput(year, month)),
  };
};
