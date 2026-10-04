import type { GraphQLClient } from 'graphql-request';
import { useEffect, useRef, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { newPeriodInput } from '../newPeriodInput';
import {
  periodInputQuery,
  savePeriodInputMutation,
  type PeriodInput,
  type PeriodRecord,
} from '../periodInputTypes';

const savedNotice = (record: PeriodRecord) =>
  record.ready
    ? 'Monthly input is ready for payroll generation.'
    : `Saved as a draft. ${record.validationError ?? 'Review unresolved amounts, component totals and deduction reasons.'}`;

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
  const [locked, setLocked] = useState(false);
  const lifetime = useRef(0);
  useEffect(() => {
    const generation = ++lifetime.current;
    setBusy(true);
    setRecord(null);
    setDraft(null);
    setError(null);
    setNotice(null);
    setRevised(false);
    setLocked(false);
    client
      .request<{ payrollPeriodInput: PeriodRecord | null; payrollPeriodLocked?: boolean }>(
        periodInputQuery,
        {
          employeeId,
          year,
          month,
        }
      )
      .then((result) => {
        if (lifetime.current === generation) {
          setRecord(result.payrollPeriodInput);
          setLocked(result.payrollPeriodLocked === true);
          setDraft(result.payrollPeriodInput?.input ?? null);
          setNotice(
            result.payrollPeriodInput?.validationError ??
              (result.payrollPeriodInput?.derived
                ? 'Prepared automatically from employee and company settings. Save only when recording an exception.'
                : null)
          );
          setBusy(false);
        }
      })
      .catch((reason: unknown) => {
        if (lifetime.current === generation) {
          setError(graphQlUserMessage(reason));
          setBusy(false);
        }
      });
    return () => {
      lifetime.current = generation + 1;
    };
  }, [client, employeeId, year, month]);
  const save = async () => {
    if (!draft || locked) return;
    const generation = lifetime.current;
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
      if (lifetime.current !== generation) return;
      setRecord(result.savePayrollPeriodInput);
      setDraft(result.savePayrollPeriodInput.input);
      setNotice(savedNotice(result.savePayrollPeriodInput));
    } catch (reason) {
      if (lifetime.current === generation) setError(graphQlUserMessage(reason));
    } finally {
      if (lifetime.current === generation) setBusy(false);
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
    locked,
    setRevised,
    save,
    create: () => setDraft(newPeriodInput(year, month)),
  };
};
