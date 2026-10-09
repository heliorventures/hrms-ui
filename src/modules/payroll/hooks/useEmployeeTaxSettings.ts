import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  taxSettingsQuery,
  taxHistoryQuery,
  saveTaxSettings,
  saveTaxHistory,
  type TaxSettingsVersion,
  type HistoryVersion,
  type TaxSettingsInput,
  type TaxHistory,
} from '../taxProjectionTypes';

export const useEmployeeTaxSettings = (
  client: GraphQLClient,
  employeeId: string,
  fiscalYear: number
) => {
  const [settings, setSettings] = useState<TaxSettingsVersion[]>([]);
  const [history, setHistory] = useState<HistoryVersion[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useFeedbackState('', 'error');
  const lifetime = useRef(0);
  const load = useCallback(
    async (generation: number) => {
      const [a, b] = await Promise.all([
        client.request<{ employeeTaxSettings: TaxSettingsVersion[] }>(taxSettingsQuery, {
          employeeId,
        }),
        client.request<{ employeeTaxHistory: HistoryVersion[] }>(taxHistoryQuery, {
          employeeId,
          fiscalYear,
        }),
      ]);
      if (lifetime.current === generation) {
        setSettings(a.employeeTaxSettings);
        setHistory(b.employeeTaxHistory);
      }
    },
    [client, employeeId, fiscalYear]
  );
  useEffect(() => {
    const generation = ++lifetime.current;
    setBusy(true);
    setSettings([]);
    setHistory([]);
    setError('');
    void load(generation)
      .catch((cause: unknown) => {
        if (lifetime.current === generation) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (lifetime.current === generation) setBusy(false);
      });
    return () => {
      lifetime.current = generation + 1;
    };
  }, [load, setError]);
  const save = async (
    kind: 'settings' | 'history',
    input: TaxSettingsInput | TaxHistory,
    expectedRevision: number | null
  ) => {
    const generation = lifetime.current;
    setBusy(true);
    setError('');
    try {
      await client.request(kind === 'settings' ? saveTaxSettings : saveTaxHistory, {
        employeeId,
        input,
        expectedRevision,
      });
      if (lifetime.current === generation) await load(generation);
    } catch (cause) {
      if (lifetime.current === generation) setError(graphQlUserMessage(cause));
    } finally {
      if (lifetime.current === generation) setBusy(false);
    }
  };
  return { settings, history, busy, error, save };
};
