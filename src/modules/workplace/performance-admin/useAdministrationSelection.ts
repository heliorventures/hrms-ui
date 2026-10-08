import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type {
  PerformanceAdminParticipant,
  PerformanceCycleAdministrationRow,
  PerformanceFeedbackRow,
  PerformanceRevisionDetailRow,
} from '../performanceAdminQueries';

interface Props {
  loadAdministration: (
    reviewCycleId: string,
    cursor?: string | null,
    append?: boolean,
    expectedVersion?: number
  ) => Promise<PerformanceCycleAdministrationRow | null>;
  loadPrivateFeedback: (
    participantId: string,
    cursor?: string | null,
    append?: boolean,
    expectedVersion?: number
  ) => Promise<void>;
  loadRevision: (
    participant: PerformanceAdminParticipant,
    revision: number,
    expectedVersion: number
  ) => Promise<void>;
  selectedCycleId: MutableRefObject<string | null>;
  selectedParticipantId: MutableRefObject<string | null>;
  selectionVersion: MutableRefObject<number>;
  selectedParticipant: PerformanceAdminParticipant | null;
  setAdministration: Dispatch<SetStateAction<PerformanceCycleAdministrationRow | null>>;
  setMessage: Dispatch<SetStateAction<{ kind: 'error' | 'notice'; text: string } | null>>;
  setNextFeedbackCursor: Dispatch<SetStateAction<string | null>>;
  setPrivateFeedback: Dispatch<SetStateAction<PerformanceFeedbackRow[]>>;
  setRevisionDetail: Dispatch<SetStateAction<PerformanceRevisionDetailRow | null>>;
  setSelectedParticipant: Dispatch<SetStateAction<PerformanceAdminParticipant | null>>;
}

export const useAdministrationSelection = ({
  loadAdministration,
  loadPrivateFeedback,
  loadRevision,
  selectedCycleId,
  selectedParticipantId,
  selectionVersion,
  selectedParticipant,
  setAdministration,
  setMessage,
  setNextFeedbackCursor,
  setPrivateFeedback,
  setRevisionDetail,
  setSelectedParticipant,
}: Props) => {
  const resetParticipant = () => {
    setSelectedParticipant(null);
    selectedParticipantId.current = null;
    setRevisionDetail(null);
    setPrivateFeedback([]);
    setNextFeedbackCursor(null);
  };
  const selectCycle = useCallback((reviewCycleId: string) => {
    if (selectedCycleId.current === reviewCycleId) return;
    selectedCycleId.current = reviewCycleId;
    selectionVersion.current += 1;
    setAdministration(null);
    resetParticipant();
    void loadAdministration(reviewCycleId, null, false, selectionVersion.current).catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
  }, [loadAdministration]);
  const selectParticipant = useCallback((participant: PerformanceAdminParticipant) => {
    const version = selectionVersion.current + 1;
    selectionVersion.current = version;
    selectedParticipantId.current = participant.participantId;
    setSelectedParticipant(participant);
    setRevisionDetail(null);
    setPrivateFeedback([]);
    setNextFeedbackCursor(null);
    void Promise.all([
      loadRevision(participant, participant.responseRevision, version),
      loadPrivateFeedback(participant.participantId, null, false, version),
    ]).catch((cause) => setMessage({ kind: 'error', text: graphQlUserMessage(cause) }));
  }, [loadPrivateFeedback, loadRevision]);
  const reloadAdministration = useCallback(async () => {
    const reviewCycleId = selectedCycleId.current;
    if (!reviewCycleId) return;
    const refreshed = await loadAdministration(reviewCycleId, null, false, selectionVersion.current);
    const participant = refreshed?.participants.find((item) => item.participantId === selectedParticipantId.current);
    if (!participant) return;
    setSelectedParticipant(participant);
    setRevisionDetail(null);
    await loadRevision(participant, participant.responseRevision, selectionVersion.current);
  }, [loadAdministration, loadRevision]);
  const chooseRevision = useCallback((revision: number) => {
    if (!selectedParticipant) return;
    void loadRevision(selectedParticipant, revision, selectionVersion.current).catch((cause) =>
      setMessage({ kind: 'error', text: graphQlUserMessage(cause) })
    );
  }, [loadRevision, selectedParticipant]);
  return { chooseRevision, reloadAdministration, selectCycle, selectParticipant };
};
