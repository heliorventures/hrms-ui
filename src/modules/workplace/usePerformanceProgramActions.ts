import { useCallback } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  ActivatePerformanceProgramDocument,
  SavePerformanceProgramDocument,
} from './performanceLifecycleQueries';

export interface PerformanceProgramDraft {
  name: string;
  cadence: string;
  anchorDate: string;
  includeCalibration: boolean;
  includeAcknowledgement: boolean;
}

interface Props {
  loadPrograms: () => Promise<void>;
  programDraft: PerformanceProgramDraft;
  run: ReturnType<typeof useKeyedAction>['run'];
  setProgramDraft: (draft: PerformanceProgramDraft) => void;
}

export const usePerformanceProgramActions = ({
  loadPrograms,
  programDraft,
  run,
  setProgramDraft,
}: Props) => {
  const client = useGraphClient('client');

  const saveProgram = useCallback(() => {
    void run(
      'save-program',
      async () => {
        await client.request(SavePerformanceProgramDocument, {
          input: {
            name: programDraft.name,
            cadence: programDraft.cadence,
            anchorDate: programDraft.anchorDate,
            includeCalibration: programDraft.includeCalibration,
            includeAcknowledgement: programDraft.includeAcknowledgement,
            goalWeightRequired: '100',
            ratingMin: '1',
            ratingMax: '5',
          },
        });
        setProgramDraft({ ...programDraft, name: '' });
        await loadPrograms();
      },
      'Performance process saved.'
    );
  }, [client, loadPrograms, programDraft, run, setProgramDraft]);

  const activateProgram = useCallback(
    (programId: string) => {
      void run(
        `activate-program:${programId}`,
        async () => {
          await client.request(ActivatePerformanceProgramDocument, { id: programId });
          await loadPrograms();
        },
        'Performance process activated.'
      );
    },
    [client, loadPrograms, run]
  );

  return { activateProgram, saveProgram };
};
