import { useCallback, useMemo } from 'react';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

import { PERSONAL_LEAVE_LIMIT } from './usePersonalLeaveBoard';

export function usePersonalLeaveLabels(
  data: LeaveBoardQuery | null,
  canApproveLeave: boolean,
  requestPage: number
) {
  const leaveTypeNameById = useMemo(
    () => new Map((data?.leaveTypes ?? []).map((leaveType) => [leaveType.id, leaveType.name])),
    [data?.leaveTypes]
  );

  const viewerId = data?.viewerEmployeeId;

  const showApprovalColumn = useMemo(
    () =>
      canApproveLeave && (data?.leaveRequests ?? []).some((row) => row.viewerMayApprove === true),
    [canApproveLeave, data?.leaveRequests]
  );

  const hideEmployeeColumn = useMemo(() => {
    const requests = data?.leaveRequests ?? [];
    if (!viewerId || requests.length === 0 || showApprovalColumn) return false;
    return requests.every((request) => request.employeeId === viewerId);
  }, [data?.leaveRequests, viewerId, showApprovalColumn]);

  const leaveRequestCount = data?.leaveRequestCount ?? 0;
  const firstVisibleRequest = leaveRequestCount === 0 ? 0 : requestPage * PERSONAL_LEAVE_LIMIT + 1;
  const lastVisibleRequest = Math.min((requestPage + 1) * PERSONAL_LEAVE_LIMIT, leaveRequestCount);

  const employeeLabelById = useMemo(() => {
    const labels = new Map<string, string>();
    for (const row of data?.leaveRequests ?? []) {
      if (!row.employeeName) continue;
      labels.set(
        row.employeeId,
        `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`
      );
    }
    return labels;
  }, [data?.leaveRequests]);

  const employeeLabel = useCallback(
    (employeeId: string) => employeeLabelById.get(employeeId) ?? 'Employee details unavailable',
    [employeeLabelById]
  );

  return {
    leaveTypeNameById,
    viewerId,
    showApprovalColumn,
    hideEmployeeColumn,
    leaveRequestCount,
    firstVisibleRequest,
    lastVisibleRequest,
    employeeLabel,
  };
}
