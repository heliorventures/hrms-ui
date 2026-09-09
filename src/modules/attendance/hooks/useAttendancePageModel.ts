import { useMemo } from 'react';

import { authorizationStateKey, createPermissionService } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { attendancePolicyMessage } from '../../../utils/attendancePolicyMessage';
import { monthBoundsIso } from '../../../utils/calendarRange';

import { attendanceSegmentRows } from './attendanceSegmentRows';
import { useAttendanceAdjustmentPolicy } from './useAttendanceAdjustmentPolicy';
import { useAttendanceCursor } from './useAttendanceCursor';
import { useAttendanceEditor } from './useAttendanceEditor';
import { useAttendancePeriod } from './useAttendancePeriod';
import { usePersonalAttendanceBoard } from './usePersonalAttendanceBoard';

export function useAttendancePageModel() {
  const client = useGraphClient('client');
  const auth = useAuth();
  const { clientSession } = auth;
  const permissions = createPermissionService(clientSession);
  const canPunchAttendance = permissions.canCapability('action.attendance.punch');
  const canRegularize = permissions.canCapability('action.attendance.regularize');

  const now = new Date();
  const { year, monthIndex, updateView } = useAttendancePeriod(client, auth, now);
  const employeeId = clientSession?.employeeId;
  const monthBounds = useMemo(() => monthBoundsIso(year, monthIndex), [year, monthIndex]);
  const {
    effectiveCursorStack,
    activeCursor,
    queryKey,
    requestIdentity,
    changeCursor,
    resetCursorStack,
  } = useAttendanceCursor(client, employeeId, monthBounds);
  const {
    currentBoard,
    boardIsCurrent,
    loading,
    refreshing,
    error,
    success,
    setSuccess,
    refreshBoard,
  } = usePersonalAttendanceBoard(
    client,
    employeeId,
    monthBounds,
    activeCursor,
    queryKey,
    requestIdentity
  );
  const { adjustPolicyDays, policyReady } = useAttendanceAdjustmentPolicy(client);
  const policyMessage = attendancePolicyMessage(adjustPolicyDays, canRegularize);
  const editor = useAttendanceEditor(
    adjustPolicyDays,
    client,
    `${auth.tenantId ?? ''}:${auth.user?.id ?? ''}:${employeeId ?? ''}:${authorizationStateKey(clientSession)}`
  );
  const filteredSegments = useMemo(
    () => attendanceSegmentRows(currentBoard?.attendance ?? [], monthBounds),
    [currentBoard?.attendance, monthBounds]
  );

  const existingSegmentsComplete =
    boardIsCurrent &&
    currentBoard !== null &&
    effectiveCursorStack.length === 0 &&
    !currentBoard.pageInfo.hasNextPage;

  return {
    ...editor,
    canPunchAttendance,
    canRegularize,
    now,
    year,
    monthIndex,
    updateView,
    effectiveCursorStack,
    currentBoard,
    loading,
    refreshing,
    error,
    success,
    setSuccess,
    refreshBoard,
    resetCursorStack,
    changeCursor,
    adjustPolicyDays,
    policyReady,
    policyMessage,
    filteredSegments,
    existingSegmentsComplete,
    monthBounds,
  };
}
export type AttendancePageModel = ReturnType<typeof useAttendancePageModel>;
