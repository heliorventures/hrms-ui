import { useLayoutEffect, useRef, useState } from 'react';

import { type ManagedAttendancePageQuery } from '../../../api/graphql/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';

import {
  managedAttendanceRangeError,
  type ManagedAttendanceRegularizationSelection,
  type ManagedAttendanceFiltersValue,
} from './managedAttendanceTypes';

type GraphClient = ReturnType<typeof useGraphClient>;

interface OwnedState<T> {
  owner: GraphClient;
  value: T;
}

interface AttendanceQueryState {
  result: ManagedAttendancePageQuery['managedAttendance'] | null;
  loading: boolean;
  error: string | null;
}

export const useManagedAttendanceState = (initialFilters: ManagedAttendanceFiltersValue) => {
  const client = useGraphClient('client');
  const [rawFiltersState, setRawFiltersState] = useState<OwnedState<ManagedAttendanceFiltersValue>>(
    () => ({ owner: client, value: initialFilters })
  );
  const [appliedFiltersState, setAppliedFiltersState] = useState<
    OwnedState<ManagedAttendanceFiltersValue>
  >(() => ({
    owner: client,
    value: { ...initialFilters, employeeSearch: initialFilters.employeeSearch.trim() },
  }));
  const [cursorState, setCursorState] = useState<OwnedState<Array<string | undefined>>>(() => ({
    owner: client,
    value: [undefined],
  }));
  const [queryState, setQueryState] = useState<OwnedState<AttendanceQueryState>>(() => ({
    owner: client,
    value: { result: null, loading: true, error: null },
  }));
  const [successState, setSuccessState] = useState<OwnedState<string | null>>(() => ({
    owner: client,
    value: null,
  }));
  const [regularizationState, setRegularizationState] = useState<
    OwnedState<ManagedAttendanceRegularizationSelection | null>
  >(() => ({ owner: client, value: null }));
  const [refreshRevision, setRefreshRevision] = useState(0);
  const requestGeneration = useRef(0);
  const committedClient = useRef(client);

  const defaultFilters = initialFilters;
  const rawFiltersOwned = rawFiltersState.owner === client;
  const appliedFiltersOwned = appliedFiltersState.owner === client;
  const cursorOwned = cursorState.owner === client;
  const rawFilters = rawFiltersOwned ? rawFiltersState.value : defaultFilters;
  const appliedFilters = appliedFiltersOwned ? appliedFiltersState.value : defaultFilters;
  const normalizedSearch = rawFilters.employeeSearch.trim();
  const searchPending = normalizedSearch !== appliedFilters.employeeSearch;
  const rangeError = managedAttendanceRangeError(rawFilters.fromDate, rawFilters.toDate);
  const cursorStack = cursorOwned ? cursorState.value : [undefined];
  const after = cursorStack[cursorStack.length - 1];
  const ownedQuery = queryState.owner === client ? queryState.value : null;
  const result = ownedQuery?.result ?? null;
  const loading = ownedQuery?.loading ?? true;
  const error = ownedQuery?.error ?? null;
  const success = successState.owner === client ? successState.value : null;
  const regularization = regularizationState.owner === client ? regularizationState.value : null;

  useLayoutEffect(() => {
    if (committedClient.current === client) return;
    committedClient.current = client;
    requestGeneration.current += 1;
    const resetFilters = initialFilters;
    setRawFiltersState({ owner: client, value: resetFilters });
    setAppliedFiltersState({
      owner: client,
      value: { ...resetFilters, employeeSearch: resetFilters.employeeSearch.trim() },
    });
    setCursorState({ owner: client, value: [undefined] });
    setQueryState({
      owner: client,
      value: { result: null, loading: true, error: null },
    });
    setSuccessState({ owner: client, value: null });
    setRegularizationState({ owner: client, value: null });
    setRefreshRevision(0);
  }, [client, initialFilters]);

  return {
    client,
    rawFiltersOwned,
    appliedFiltersOwned,
    cursorOwned,
    rawFilters,
    appliedFilters,
    normalizedSearch,
    searchPending,
    rangeError,
    cursorStack,
    after,
    result,
    loading,
    error,
    success,
    regularization,
    setRawFiltersState,
    setAppliedFiltersState,
    setCursorState,
    setQueryState,
    setSuccessState,
    setRegularizationState,
    setRefreshRevision,
    requestGeneration,
    refreshRevision,
  };
};
