import { useCallback, useEffect, useState } from 'react';

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
  const [cycles, setCycles] = useState<PerformanceAdminCycleRow[]>([]);
  const [nextCycleCursor, setNextCycleCursor] = useState<string | null>(null);

  const loadCycles = useCallback(
    async (cursor?: string | null, append = false) => {
      const result = await client.request<{
        performanceAdminCycles: { items: PerformanceAdminCycleRow[]; nextCursor?: string | null };
      }>(PerformanceAdminCyclesDocument, {
        input: { cursor, limit: pageSize, performanceProgramId: performanceProgramId ?? null },
      });
      setCycles((current) =>
        append
          ? [...current, ...result.performanceAdminCycles.items]
          : result.performanceAdminCycles.items
      );
      setNextCycleCursor(result.performanceAdminCycles.nextCursor ?? null);
    },
    [client, performanceProgramId]
  );

  useEffect(() => {
    setCycles([]);
    setNextCycleCursor(null);
    void loadCycles().catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
  }, [loadCycles, setMessage]);

  const loadMoreCycles = () => {
    if (!nextCycleCursor) return false;
    void loadCycles(nextCycleCursor, true).catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
    return true;
  };

  return { cycles, loadMoreCycles, nextCycleCursor };
};
