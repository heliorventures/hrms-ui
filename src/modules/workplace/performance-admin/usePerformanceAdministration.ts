import { useRef } from 'react';

import { useAdministrationActionState } from './useAdministrationActionState';
import { useAdministrationCycleData } from './useAdministrationCycleData';
import { useAdministrationCycles } from './useAdministrationCycles';
import { useAdministrationMutations } from './useAdministrationMutations';
import { useAdministrationParticipantData } from './useAdministrationParticipantData';
import { useAdministrationSelection } from './useAdministrationSelection';

interface Props {
  performanceProgramId?: string;
}

export const usePerformanceAdministration = ({ performanceProgramId }: Props) => {
  const selectedCycleId = useRef<string | null>(null);
  const selectedParticipantId = useRef<string | null>(null);
  const selectionVersion = useRef(0);
  const { isBusy, message, runAction, setMessage } = useAdministrationActionState();
  const cycleData = useAdministrationCycleData({ selectedCycleId, selectionVersion });
  const participantData = useAdministrationParticipantData({
    selectedParticipantId,
    selectionVersion,
  });
  const cycleList = useAdministrationCycles({ performanceProgramId, setMessage });

  const selection = useAdministrationSelection({
    loadAdministration: cycleData.loadAdministration,
    loadPrivateFeedback: participantData.loadPrivateFeedback,
    loadRevision: participantData.loadRevision,
    selectedCycleId,
    selectedParticipantId,
    selectionVersion,
    selectedParticipant: participantData.selectedParticipant,
    setAdministration: cycleData.setAdministration,
    setMessage,
    setNextFeedbackCursor: participantData.setNextFeedbackCursor,
    setPrivateFeedback: participantData.setPrivateFeedback,
    setRevisionDetail: participantData.setRevisionDetail,
    setSelectedParticipant: participantData.setSelectedParticipant,
  });

  const mutations = useAdministrationMutations({
    administration: cycleData.administration,
    loadPrivateFeedback: participantData.loadPrivateFeedback,
    reloadAdministration: selection.reloadAdministration,
    runAction,
    selectedCycleId,
    selectedParticipantId,
    selectionVersion,
  });

  return {
    administration: cycleData.administration,
    chooseRevision: selection.chooseRevision,
    cycles: cycleList.cycles,
    isBusy,
    loadMoreCycles: cycleList.loadMoreCycles,
    loadMoreFeedback: () =>
      participantData.selectedParticipant &&
      participantData.nextFeedbackCursor &&
      participantData.loadPrivateFeedback(
        participantData.selectedParticipant.participantId,
        participantData.nextFeedbackCursor,
        true,
        selectionVersion.current
      ),
    loadMoreParticipants: () =>
      cycleData.administration &&
      cycleData.loadAdministration(
        cycleData.administration.reviewCycle.id,
        cycleData.administration.nextParticipantCursor,
        true,
        selectionVersion.current
      ),
    message,
    nextCycleCursor: cycleList.nextCycleCursor,
    nextFeedbackCursor: participantData.nextFeedbackCursor,
    privateFeedback: participantData.privateFeedback,
    reopenReview: mutations.reopenReview,
    retryException: mutations.retryException,
    saveCalibration: mutations.saveCalibration,
    selectedParticipant: participantData.selectedParticipant,
    selectCycle: selection.selectCycle,
    selectParticipant: selection.selectParticipant,
    setExcluded: mutations.setExcluded,
    addPrivateFeedback: mutations.addPrivateFeedback,
    revisionDetail: participantData.revisionDetail,
  };
};
