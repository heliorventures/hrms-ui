import { useCallback, useEffect, useRef, useState } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import {
  PerformancePopulationOptionsDocument,
  PerformanceProgramPolicyDocument,
  type PerformancePopulationMode,
  type PerformancePopulationOption,
  type PerformanceProgramPolicyRow,
} from '../performanceAdminQueries';

import { emptyDraft, toDraft, type PolicyDraft } from './performanceProgramPolicy';

interface Props {
  performanceProgramId: string;
}

export const usePerformanceProgramPolicyData = ({ performanceProgramId }: Props) => {
  const client = useGraphClient('client');
  const [draft, setDraft] = useState<PolicyDraft>(emptyDraft);
  const [options, setOptions] = useState<PerformancePopulationOption[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadPolicy = useCallback(async () => {
    const result = await client.request<{ performanceProgramPolicy: PerformanceProgramPolicyRow }>(
      PerformanceProgramPolicyDocument,
      { performanceProgramId }
    );
    setDraft(toDraft(result.performanceProgramPolicy));
  }, [client, performanceProgramId]);

  const loadOptions = useCallback(
    async (cursor?: string | null, append = false) => {
      if (draft.populationMode === 'ALL') {
        setOptions([]);
        setNextCursor(null);
        return;
      }
      const id = ++requestId.current;
      const result = await client.request<{
        performancePopulationOptions: {
          items: PerformancePopulationOption[];
          nextCursor?: string | null;
        };
      }>(PerformancePopulationOptionsDocument, {
        input: { mode: draft.populationMode, search: search.trim() || null, cursor, limit: 50 },
      });
      if (id !== requestId.current) return;
      setOptions((current) =>
        append
          ? [...current, ...result.performancePopulationOptions.items]
          : result.performancePopulationOptions.items
      );
      setNextCursor(result.performancePopulationOptions.nextCursor ?? null);
    },
    [client, draft.populationMode, search]
  );

  useEffect(() => {
    void loadPolicy().catch((cause) => setMessage(graphQlUserMessage(cause)));
  }, [loadPolicy]);

  useEffect(() => {
    void loadOptions().catch((cause) => setMessage(graphQlUserMessage(cause)));
  }, [loadOptions]);

  const changeMode = (populationMode: PerformancePopulationMode) => {
    setDraft((current) => ({ ...current, populationMode, populationIds: [] }));
    setOptions([]);
    setNextCursor(null);
  };

  const loadMoreOptions = () => {
    if (!nextCursor) return;
    void loadOptions(nextCursor, true).catch((cause) => setMessage(graphQlUserMessage(cause)));
  };

  const toggleId = (id: string) =>
    setDraft((current) => ({
      ...current,
      populationIds: current.populationIds.includes(id)
        ? current.populationIds.filter((item) => item !== id)
        : [...current.populationIds, id],
    }));

  return {
    changeMode,
    draft,
    loadMoreOptions,
    message,
    nextCursor,
    options,
    search,
    setDraft,
    setMessage,
    setSearch,
    toggleId,
  };
};
