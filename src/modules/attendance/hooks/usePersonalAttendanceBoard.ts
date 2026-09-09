import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { useGraphClient } from '../../../hooks/useGraphClient';
import type { AttendanceBoardData } from '../types';

import {
  boardRequestIdentityMatches,
  type BoardRequestIdentity,
  type RefreshIntent,
} from './attendanceRequestIdentity';
import { useAttendanceBoardRequest } from './useAttendanceBoardRequest';

export function usePersonalAttendanceBoard(
  client: ReturnType<typeof useGraphClient>,
  employeeId: string | undefined,
  monthBounds: { start: string; end: string },
  activeCursor: string | undefined,
  queryKey: string,
  requestIdentity: BoardRequestIdentity
) {
  const [board, setBoard] = useState<AttendanceBoardData | null>(null);
  const [boardSnapshotIdentity, setBoardSnapshotIdentity] = useState<BoardRequestIdentity | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshRevision, setRefreshRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const boardRequestGeneration = useRef(0);
  const committedRequestIdentityRef = useRef<BoardRequestIdentity | null>(null);
  const refreshRevisionRef = useRef(0);
  const refreshIntentRef = useRef<RefreshIntent | null>(null);

  useLayoutEffect(() => {
    committedRequestIdentityRef.current = requestIdentity;
    if (
      refreshIntentRef.current &&
      !boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
    ) {
      refreshIntentRef.current = null;
    }
  }, [requestIdentity]);

  useAttendanceBoardRequest({
    client,
    employeeId,
    monthBounds,
    activeCursor,
    queryKey,
    requestIdentity,
    refreshRevision,
    boardRequestGeneration,
    refreshIntentRef,
    committedRequestIdentityRef,
    setLoading,
    setError,
    setBoard,
    setBoardSnapshotIdentity,
    setSuccess,
    setRefreshing,
  });
  const refreshBoard = useCallback(() => {
    setError(null);
    setSuccess(null);
    setRefreshing(true);
    const nextRevision = refreshRevisionRef.current + 1;
    refreshRevisionRef.current = nextRevision;
    refreshIntentRef.current = { identity: requestIdentity, revision: nextRevision };
    setRefreshRevision(nextRevision);
  }, [requestIdentity]);

  const boardIsCurrent = boardRequestIdentityMatches(boardSnapshotIdentity, requestIdentity);
  const currentBoard = boardIsCurrent ? board : null;

  return {
    currentBoard,
    boardIsCurrent,
    loading,
    refreshing,
    error,
    success,
    setSuccess,
    refreshBoard,
  };
}
