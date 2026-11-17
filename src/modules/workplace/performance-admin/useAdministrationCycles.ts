import { useCallback, useEffect, useRef, useState } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  PerformanceAdminCyclesDocument,
  type PerformanceAdminCycleRow,
} from '../performanceAdminQueries';

const pageSize = 20;

interface Props {
  performanceProgramId?: string;
  setMessage: (message: { kind: 'error'; text: string }) => void;
}

export const useAdministrationCycles = ({ performanceProgramId, setMessage }: Props) => {
  const client = useGraphClient('client');
  const generation = useRef(0);
  const [state, setState] = useState({
    client,
    performanceProgramId,
    cycles: [] as PerformanceAdminCycleRow[],
    nextCycleCursor: null as string | null,
    loading: true,
    error: null as string | null,
  });

  const loadCycles = useCallback(
    async (cursor?: string | null, append = false) => {
      const request = ++generation.current;
      setState((current) => ({
        client,
        performanceProgramId,
        cycles:
          append &&
          current.client === client &&
          current.performanceProgramId === performanceProgramId
            ? current.cycles
            : [],
        nextCycleCursor: append ? current.nextCycleCursor : null,
        loading: true,
        error: null,
      }));
      try {
        const result = await client.request<{
          performanceAdminCycles: { items: PerformanceAdminCycleRow[]; nextCursor?: string | null };
        }>(PerformanceAdminCyclesDocument, {
          input: { cursor, limit: pageSize, performanceProgramId: performanceProgramId ?? null },
        });
        if (request !== generation.current) return;
        setState((current) => ({
          ...current,
          cycles: append
            ? [...current.cycles, ...result.performanceAdminCycles.items]
            : result.performanceAdminCycles.items,
          nextCycleCursor: result.performanceAdminCycles.nextCursor ?? null,
          loading: false,
          error: null,
        }));
      } catch (cause) {
        if (request !== generation.current) return;
        setState((current) => ({ ...current, loading: false, error: graphQlUserMessage(cause) }));
        throw cause;
      }
    },
    [client, performanceProgramId]
  );

  useEffect(() => {
    void loadCycles().catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
    return () => {
      generation.current += 1;
    };
  }, [loadCycles, setMessage]);

  const loadMoreCycles = () => {
    if (state.loading || !state.nextCycleCursor) return false;
    void loadCycles(state.nextCycleCursor, true).catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
    return true;
  };

  const sameOwner = state.client === client && state.performanceProgramId === performanceProgramId;
  const reloadCycles = () => {
    void loadCycles().catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
  };
  return {
    cycles: sameOwner ? state.cycles : [],
    nextCycleCursor: sameOwner ? state.nextCycleCursor : null,
    loading: !sameOwner || state.loading,
    error: sameOwner ? state.error : null,
    loadMoreCycles,
    reloadCycles,
  };
};
