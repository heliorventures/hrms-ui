import { useCallback } from 'react';

import {
  type ManagedAttendanceActions,
  type ManagedAttendanceAddContext,
  type ManagedAttendanceRow,
} from './managedAttendanceTypes';
import type { useManagedAttendanceState } from './useManagedAttendanceState';

export const useManagedAttendanceActions = (
  state: ReturnType<typeof useManagedAttendanceState>,
  { onAdd, onAdjust }: Partial<ManagedAttendanceActions>
) => {
  const {
    client,
    setRegularizationState,
    setSuccessState,
    requestGeneration,
    setQueryState,
    setCursorState,
    setRefreshRevision,
  } = state;
  const openAdd = useCallback(
    (context: ManagedAttendanceAddContext) => {
      onAdd?.(context);
      setRegularizationState({
        owner: client,
        value: { employee: context, initialWorkDate: context.workDate },
      });
    },
    [client, onAdd, setRegularizationState]
  );

  const openAdjust = useCallback(
    (row: ManagedAttendanceRow) => {
      onAdjust?.(row);
      setRegularizationState({
        owner: client,
        value: {
          employee: {
            employeeId: row.employeeId,
            employeeName: row.employeeName,
            employeeCode: row.employeeCode,
          },
          editingRow: row,
        },
      });
    },
    [client, onAdjust, setRegularizationState]
  );

  const regularizationSaved = useCallback(
    (employeeName: string, workDate: string) => {
      setSuccessState({
        owner: client,
        value: `Attendance updated for ${employeeName} on ${workDate}.`,
      });
      requestGeneration.current += 1;
      setQueryState((current) => ({
        owner: client,
        value: {
          result: current.owner === client ? current.value.result : null,
          loading: true,
          error: null,
        },
      }));
      setCursorState({ owner: client, value: [undefined] });
      setRefreshRevision((revision) => revision + 1);
    },
    [client, requestGeneration, setCursorState, setQueryState, setRefreshRevision, setSuccessState]
  );

  const previousPage = useCallback(() => {
    requestGeneration.current += 1;
    setCursorState((current) => {
      const stack = current.owner === client ? current.value : [undefined];
      return { owner: client, value: stack.length > 1 ? stack.slice(0, -1) : stack };
    });
  }, [client, requestGeneration, setCursorState]);

  const nextPage = useCallback(
    (nextCursor: string) => {
      requestGeneration.current += 1;
      setCursorState((current) => ({
        owner: client,
        value: [...(current.owner === client ? current.value : [undefined]), nextCursor],
      }));
    },
    [client, requestGeneration, setCursorState]
  );

  return { openAdd, openAdjust, regularizationSaved, previousPage, nextPage };
};
