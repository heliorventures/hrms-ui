import { useCallback, useRef, useState, type MutableRefObject } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';

import {
  PerformanceReviewRevisionDocument,
  PrivatePerformanceFeedbackDocument,
  type PerformanceAdminParticipant,
  type PerformanceFeedbackRow,
  type PerformanceRevisionDetailRow,
} from '../performanceAdminQueries';

const feedbackPageSize = 20;

interface Props {
  selectedParticipantId: MutableRefObject<string | null>;
  selectionVersion: MutableRefObject<number>;
}

export const useAdministrationParticipantData = ({
  selectedParticipantId,
  selectionVersion,
}: Props) => {
  const client = useGraphClient('client');
  const [selectedParticipant, setSelectedParticipant] =
    useState<PerformanceAdminParticipant | null>(null);
  const [revisionDetail, setRevisionDetail] = useState<PerformanceRevisionDetailRow | null>(null);
  const [privateFeedback, setPrivateFeedback] = useState<PerformanceFeedbackRow[]>([]);
  const [nextFeedbackCursor, setNextFeedbackCursor] = useState<string | null>(null);
  const revisionRequest = useRef(0);
  const feedbackRequest = useRef(0);

  const loadRevision = useCallback(
    async (participant: PerformanceAdminParticipant, revision: number, expectedVersion: number) => {
      const requestId = ++revisionRequest.current;
      const result = await client.request<{
        performanceReviewRevision: PerformanceRevisionDetailRow | null;
      }>(PerformanceReviewRevisionDocument, { participantId: participant.participantId, revision });
      if (
        requestId !== revisionRequest.current ||
        selectionVersion.current !== expectedVersion ||
        selectedParticipantId.current !== participant.participantId
      ) {
        return;
      }
      setRevisionDetail(result.performanceReviewRevision);
    },
    [client, selectedParticipantId, selectionVersion]
  );

  const loadPrivateFeedback = useCallback(
    async (
      participantId: string,
      cursor?: string | null,
      append = false,
      expectedVersion?: number
    ) => {
      const requestId = ++feedbackRequest.current;
      const version = expectedVersion ?? selectionVersion.current;
      const result = await client.request<{
        privatePerformanceFeedback: { items: PerformanceFeedbackRow[]; nextCursor?: string | null };
      }>(PrivatePerformanceFeedbackDocument, {
        input: { participantId, cursor, limit: feedbackPageSize },
      });
      if (
        requestId !== feedbackRequest.current ||
        selectionVersion.current !== version ||
        selectedParticipantId.current !== participantId
      ) {
        return;
      }
      setPrivateFeedback((current) =>
        append
          ? [...current, ...result.privatePerformanceFeedback.items]
          : result.privatePerformanceFeedback.items
      );
      setNextFeedbackCursor(result.privatePerformanceFeedback.nextCursor ?? null);
    },
    [client, selectedParticipantId, selectionVersion]
  );

  return {
    loadPrivateFeedback,
    loadRevision,
    nextFeedbackCursor,
    privateFeedback,
    revisionDetail,
    selectedParticipant,
    setNextFeedbackCursor,
    setPrivateFeedback,
    setRevisionDetail,
    setSelectedParticipant,
  };
};
