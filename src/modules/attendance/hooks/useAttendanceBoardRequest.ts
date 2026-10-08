import { useEffect, type Dispatch, type SetStateAction, type MutableRefObject } from 'react';

import { MyAttendanceBoardDocument } from '../../../api/attendance/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { mapMyAttendanceBoard, type AttendanceBoardData } from '../types';

import {
  boardRequestIdentityMatches,
  type BoardRequestIdentity,
  type RefreshIntent,
} from './attendanceRequestIdentity';

type Setter<T> = Dispatch<SetStateAction<T>>;
interface RequestOptions {
  client: ReturnType<typeof useGraphClient>;
  employeeId: string | undefined;
  monthBounds: { start: string; end: string };
  activeCursor: string | undefined;
  queryKey: string;
  requestIdentity: BoardRequestIdentity;
  refreshRevision: number;
  boardRequestGeneration: MutableRefObject<number>;
  refreshIntentRef: MutableRefObject<RefreshIntent | null>;
  committedRequestIdentityRef: MutableRefObject<BoardRequestIdentity | null>;
  setLoading: Setter<boolean>;
  setError: Setter<string | null>;
  setBoard: Setter<AttendanceBoardData | null>;
  setBoardSnapshotIdentity: Setter<BoardRequestIdentity | null>;
  setSuccess: Setter<string | null>;
  setRefreshing: Setter<boolean>;
}
export function useAttendanceBoardRequest({
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
}: RequestOptions) {
  useEffect(() => {
    let cancelled = false;
    const requestGeneration = ++boardRequestGeneration.current;
    const refreshIntent = refreshIntentRef.current;
    const isRefreshForThisRequest =
      refreshIntent?.revision === refreshRevision &&
      boardRequestIdentityMatches(refreshIntent.identity, requestIdentity);
    const requestIsCurrent = () =>
      !cancelled &&
      requestGeneration === boardRequestGeneration.current &&
      boardRequestIdentityMatches(committedRequestIdentityRef.current, requestIdentity);
    setLoading(true);
    setError(null);

    void client
      .request(MyAttendanceBoardDocument, {
        fromDate: monthBounds.start,
        toDate: monthBounds.end,
        first: 50,
        after: activeCursor,
      })
      .then((response) => {
        if (!requestIsCurrent()) return;
        setBoard(mapMyAttendanceBoard(response, employeeId));
        setBoardSnapshotIdentity(requestIdentity);
        if (
          isRefreshForThisRequest &&
          refreshIntentRef.current?.revision === refreshIntent.revision &&
          boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
        ) {
          refreshIntentRef.current = null;
          setSuccess('Attendance refreshed.');
        }
      })
      .catch((error) => {
        if (!requestIsCurrent()) return;
        if (
          isRefreshForThisRequest &&
          refreshIntentRef.current?.revision === refreshIntent.revision &&
          boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
        ) {
          refreshIntentRef.current = null;
        }
        setError(graphQlUserMessage(error));
      })
      .finally(() => {
        if (!requestIsCurrent()) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    activeCursor,
    client,
    employeeId,
    monthBounds.end,
    monthBounds.start,
    queryKey,
    boardRequestGeneration,
    refreshIntentRef,
    committedRequestIdentityRef,
    setLoading,
    setError,
    setBoard,
    setBoardSnapshotIdentity,
    setSuccess,
    setRefreshing,
    requestIdentity,
    refreshRevision,
  ]);
}
