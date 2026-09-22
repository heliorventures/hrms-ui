import { useCallback, useRef, useState, type MutableRefObject } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';

import {
  PerformanceCycleAdministrationDocument,
  type PerformanceCycleAdministrationRow,
} from '../performanceAdminQueries';

const participantPageSize = 50;

interface Props {
  selectedCycleId: MutableRefObject<string | null>;
  selectionVersion: MutableRefObject<number>;
}

export const useAdministrationCycleData = ({ selectedCycleId, selectionVersion }: Props) => {
  const client = useGraphClient('client');
  const [administration, setAdministration] = useState<PerformanceCycleAdministrationRow | null>(
    null
  );
  const cycleRequest = useRef(0);

  const loadAdministration = useCallback(
    async (
      reviewCycleId: string,
      cursor?: string | null,
      append = false,
      expectedVersion?: number
    ) => {
      const requestId = ++cycleRequest.current;
      const version = expectedVersion ?? selectionVersion.current;
      const result = await client.request<{
        performanceCycleAdministration: PerformanceCycleAdministrationRow;
      }>(PerformanceCycleAdministrationDocument, {
        reviewCycleId,
        cursor,
        limit: participantPageSize,
      });
      if (
        requestId !== cycleRequest.current ||
        selectedCycleId.current !== reviewCycleId ||
        selectionVersion.current !== version
      ) {
        return null;
      }
      setAdministration((current) => {
        if (!append || !current) return result.performanceCycleAdministration;
        return {
          ...result.performanceCycleAdministration,
          participants: [
            ...current.participants,
            ...result.performanceCycleAdministration.participants,
          ],
        };
      });
      return result.performanceCycleAdministration;
    },
    [client, selectedCycleId, selectionVersion]
  );

  return { administration, loadAdministration, setAdministration };
};
