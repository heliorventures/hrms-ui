import { useCallback } from 'react';

import { currentMonthFilters, type ManagedAttendanceFiltersValue } from './managedAttendanceTypes';
import type { useManagedAttendanceState } from './useManagedAttendanceState';

export const useManagedAttendanceFilters = (
  state: ReturnType<typeof useManagedAttendanceState>,
  onFiltersChange: (filters: ManagedAttendanceFiltersValue) => void
) => {
  const {
    rawFilters,
    appliedFilters,
    client,
    requestGeneration,
    setRawFiltersState,
    setAppliedFiltersState,
    setCursorState,
    setQueryState,
    setRefreshRevision,
  } = state;
  const changeFilters = useCallback(
    (nextFilters: ManagedAttendanceFiltersValue) => {
      const datesOrEmployeeChanged =
        nextFilters.fromDate !== rawFilters.fromDate ||
        nextFilters.toDate !== rawFilters.toDate ||
        nextFilters.employeeId !== rawFilters.employeeId;
      const nextSearch = nextFilters.employeeSearch.trim();
      const searchChanged = nextSearch !== appliedFilters.employeeSearch;

      setRawFiltersState({ owner: client, value: nextFilters });
      onFiltersChange(nextFilters);

      if (datesOrEmployeeChanged) {
        requestGeneration.current += 1;
        setAppliedFiltersState((current) => ({
          owner: client,
          value: {
            ...(current.owner === client ? current.value : currentMonthFilters()),
            fromDate: nextFilters.fromDate,
            toDate: nextFilters.toDate,
            employeeId: nextFilters.employeeId,
          },
        }));
        setCursorState({ owner: client, value: [undefined] });
      }

      if (datesOrEmployeeChanged || searchChanged) {
        requestGeneration.current += 1;
        setQueryState((current) => ({
          owner: client,
          value: {
            result: current.owner === client ? current.value.result : null,
            loading: true,
            error: null,
          },
        }));
      }
    },
    [
      requestGeneration,
      setAppliedFiltersState,
      setCursorState,
      setQueryState,
      setRawFiltersState,
      appliedFilters.employeeSearch,
      onFiltersChange,
      client,
      rawFilters.employeeId,
      rawFilters.fromDate,
      rawFilters.toDate,
    ]
  );

  const refresh = useCallback(() => {
    requestGeneration.current += 1;
    setQueryState((current) => ({
      owner: client,
      value: {
        result: current.owner === client ? current.value.result : null,
        loading: true,
        error: null,
      },
    }));
    setRefreshRevision((revision) => revision + 1);
  }, [client, requestGeneration, setQueryState, setRefreshRevision]);

  return { changeFilters, refresh };
};
