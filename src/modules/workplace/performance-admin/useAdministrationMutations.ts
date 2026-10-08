import type { MutableRefObject } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';

import {
  AddPrivatePerformanceFeedbackDocument,
  ReopenPerformanceReviewDocument,
  RetryPerformanceExceptionDocument,
  SavePerformanceCalibrationDocument,
  SetPerformanceParticipantExcludedDocument,
  type PerformanceAdminException,
  type PerformanceCycleAdministrationRow,
} from '../performanceAdminQueries';

interface Props {
  administration: PerformanceCycleAdministrationRow | null;
  loadPrivateFeedback: (
    participantId: string,
    cursor?: string | null,
    append?: boolean,
    expectedVersion?: number
  ) => Promise<void>;
  reloadAdministration: () => Promise<void>;
  runAction: (
    key: string,
    operation: () => Promise<void>,
    notice: string,
    isCurrent?: () => boolean
  ) => Promise<boolean>;
  selectedCycleId: MutableRefObject<string | null>;
  selectedParticipantId: MutableRefObject<string | null>;
  selectionVersion: MutableRefObject<number>;
}

export const useAdministrationMutations = ({
  administration,
  loadPrivateFeedback,
  reloadAdministration,
  runAction,
  selectedCycleId,
  selectedParticipantId,
  selectionVersion,
}: Props) => {
  const client = useGraphClient('client');
  const participantIsCurrent = (participantId: string) =>
    selectedParticipantId.current === participantId;
  const saveCalibration = (input: {
    participantId: string;
    expectedRevision: number;
    finalRating: string;
    performanceBand?: string | null;
    reason: string;
  }) =>
    runAction(
      `calibration:${input.participantId}`,
      async () => {
        await client.request(SavePerformanceCalibrationDocument, { input });
        await reloadAdministration();
      },
      'Calibration decision recorded.',
      () => participantIsCurrent(input.participantId)
    );
  const reopenReview = (input: {
    participantId: string;
    expectedRevision: number;
    correctionStage: 'SELF_REVIEW' | 'MANAGER_REVIEW';
    reason: string;
  }) =>
    runAction(
      `reopen:${input.participantId}`,
      async () => {
        await client.request(ReopenPerformanceReviewDocument, { input });
        await reloadAdministration();
      },
      'A new response revision was opened.',
      () => participantIsCurrent(input.participantId)
    );
  const setExcluded = (input: { participantId: string; excluded: boolean; reason: string }) =>
    runAction(
      `exclude:${input.participantId}`,
      async () => {
        await client.request(SetPerformanceParticipantExcludedDocument, { input });
        await reloadAdministration();
      },
      input.excluded ? 'Participant excluded.' : 'Participant restored.',
      () => participantIsCurrent(input.participantId)
    );
  const addPrivateFeedback = (input: {
    participantId: string;
    goalId?: string | null;
    observationDate: string;
    comments: string;
  }) =>
    runAction(
      `private-feedback:${input.participantId}`,
      async () => {
        await client.request(AddPrivatePerformanceFeedbackDocument, { input });
        await loadPrivateFeedback(input.participantId, null, false, selectionVersion.current);
      },
      'Private HR feedback recorded.',
      () => participantIsCurrent(input.participantId)
    );
  const retryException = (exception: PerformanceAdminException) =>
    runAction(
      `retry:${exception.id}`,
      async () => {
        await client.request(RetryPerformanceExceptionDocument, { exceptionId: exception.id });
        await reloadAdministration();
      },
      'Exception retry requested.',
      () => selectedCycleId.current === administration?.reviewCycle.id
    );
  return { addPrivateFeedback, reopenReview, retryException, saveCalibration, setExcluded };
};
