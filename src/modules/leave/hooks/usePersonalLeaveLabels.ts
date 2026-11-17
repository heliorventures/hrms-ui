import { useCallback, useMemo } from 'react';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

import { PERSONAL_LEAVE_LIMIT } from './usePersonalLeaveBoard';

export function usePersonalLeaveLabels(data: LeaveBoardQuery | null, requestPage: number) {
  const leaveTypeNameById = useMemo(
    () => new Map((data?.leaveTypes ?? []).map((leaveType) => [leaveType.id, leaveType.name])),
    [data?.leaveTypes]
  );

  const viewerId = data?.viewerEmployeeId;

  const requests = useMemo(
    () =>
      (data?.leaveRequests ?? []).filter(
        (request) => !!viewerId && request.employeeId === viewerId
      ),
    [data?.leaveRequests, viewerId]
  );

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
    requests,
    leaveRequestCount,
    firstVisibleRequest,
    lastVisibleRequest,
    employeeLabel,
  };
}
