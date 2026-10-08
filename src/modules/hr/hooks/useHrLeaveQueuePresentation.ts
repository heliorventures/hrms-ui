import { useCallback, useEffect, useMemo, type RefObject } from 'react';

import type { useRememberedRouteView } from '../../../hooks/useRememberedRouteView';

import {
  HR_LEAVE_LIMIT,
  recoverQueueFocus,
  type HrLeaveApprovalBoard,
} from './useHrLeaveApprovalBoard';

type BoardData = HrLeaveApprovalBoard | null;
type UpdateView = ReturnType<typeof useRememberedRouteView>[1];

export const useHrLeaveQueuePresentation = (
  data: BoardData,
  requestPage: number,
  queueRef: RefObject<HTMLElement>,
  updateView: UpdateView
) => {
  const totalCount = data?.leaveRequestCount ?? 0;
  useEffect(() => {
    if (data && requestPage > 0 && requestPage * HR_LEAVE_LIMIT >= totalCount) {
      recoverQueueFocus(queueRef.current);
      updateView({ page: String(Math.max(0, Math.ceil(totalCount / HR_LEAVE_LIMIT) - 1)) });
    }
  }, [data, queueRef, requestPage, totalCount, updateView]);

  const leaveTypeNameById = useMemo(
    () => new Map((data?.leaveTypes ?? []).map((leaveType) => [leaveType.id, leaveType.name])),
    [data?.leaveTypes]
  );
  const employeeLabelById = useMemo(
    () =>
      new Map(
        (data?.leaveRequests ?? []).flatMap((row) =>
          row.employeeName
            ? [
                [
                  row.employeeId,
                  `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`,
                ] as const,
              ]
            : []
        )
      ),
    [data?.leaveRequests]
  );
  const employeeLabel = useCallback(
    (employeeId: string) => employeeLabelById.get(employeeId) ?? 'Employee details unavailable',
    [employeeLabelById]
  );

  return {
    actionableCount: data?.leaveApprovalQueue.actionableCount ?? 0,
    employeeLabel,
    filteredRows: data?.leaveRequests ?? [],
    leaveTypeNameById,
    pendingCount: data?.leaveApprovalQueue.pendingCount ?? 0,
    showApprovalColumn: (data?.leaveRequests ?? []).some((row) => row.viewerMayApprove === true),
    totalCount,
    viewerId: data?.viewerEmployeeId,
  };
};
