import { useEffect, useMemo, useRef } from 'react';

import { authorizationStateKey, createPermissionService } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { attendancePolicyMessage } from '../../../utils/attendancePolicyMessage';
import { monthBoundsIso } from '../../../utils/calendarRange';

import { attendanceSegmentRows } from './attendanceSegmentRows';
import { useAttendanceAdjustmentPolicy } from './useAttendanceAdjustmentPolicy';
import { useAttendanceCursor } from './useAttendanceCursor';
import { useCurrentAttendanceDayWindow } from './useAttendanceDayWindows';
import { useAttendanceEditor } from './useAttendanceEditor';
import { useAttendancePeriod } from './useAttendancePeriod';
import { usePersonalAttendanceBoard } from './usePersonalAttendanceBoard';
import { useTenantCalendarDate } from './useTenantCalendarDate';

export function useAttendancePageModel() {
  const client = useGraphClient('client');
  const auth = useAuth();
  const { clientSession } = auth;
  const permissions = createPermissionService(clientSession);
  const canPunchAttendance = permissions.canCapability('action.attendance.punch');
  const canRegularize = permissions.canCapability('action.attendance.regularize');
  const employeeId = clientSession?.employeeId;
  const identity = `${auth.tenantId ?? ''}:${auth.user?.id ?? ''}:${employeeId ?? ''}:${authorizationStateKey(clientSession)}`;
  const currentWindow = useCurrentAttendanceDayWindow(client, identity);
  const currentWorkDate = currentWindow.data?.workDate ?? null;

  const now = new Date();
  const browserDefaultYear = now.getFullYear();
  const browserDefaultMonth = now.getMonth();
  const { year, monthIndex, updateView } = useAttendancePeriod(client, auth, now);
  const defaultMonthApplied = useRef(false);
  const defaultMonthOwner = useRef(identity);
  if (defaultMonthOwner.current !== identity) {
    defaultMonthOwner.current = identity;
    defaultMonthApplied.current = false;
  }
  useEffect(() => {
    if (!currentWorkDate || defaultMonthApplied.current) return;
    defaultMonthApplied.current = true;
    const [serverYear, serverMonth] = currentWorkDate.split('-').map(Number);
    if (
      Number.isInteger(serverYear) &&
      Number.isInteger(serverMonth) &&
      year === browserDefaultYear &&
      monthIndex === browserDefaultMonth &&
      (serverYear !== year || serverMonth - 1 !== monthIndex)
    ) {
      updateView({ year: String(serverYear), month: String(serverMonth) });
    }
  }, [browserDefaultMonth, browserDefaultYear, currentWorkDate, monthIndex, updateView, year]);
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
  const { adjustPolicyDays, policyReady: adjustmentPolicyReady } =
    useAttendanceAdjustmentPolicy(client);
  const policyReady = adjustmentPolicyReady && currentWindow.phase === 'ready';
  const policyMessage = attendancePolicyMessage(adjustPolicyDays, canRegularize);
  const editor = useTenantCalendarEditor(adjustPolicyDays, client, identity, currentWorkDate);
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
    currentWorkDate,
    attendanceWindowError: currentWindow.error,
    refreshAttendanceWindow: currentWindow.refresh,
  };
}
export type AttendancePageModel = ReturnType<typeof useAttendancePageModel>;

function useTenantCalendarEditor(
  adjustPolicyDays: number,
  client: object,
  identity: string,
  currentWorkDate: string | null
) {
  const { currentTenant } = useTenant();
  const currentCalendarDate = useTenantCalendarDate(currentTenant.timezone, identity);
  return useAttendanceEditor(
    adjustPolicyDays,
    client,
    identity,
    currentWorkDate,
    currentCalendarDate
  );
}
