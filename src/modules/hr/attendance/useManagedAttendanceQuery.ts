import { useEffect } from 'react';

import { ManagedAttendancePageDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import { currentMonthFilters, requestVariables } from './managedAttendanceTypes';
import type { useManagedAttendanceState } from './useManagedAttendanceState';

export const useManagedAttendanceQuery = ({
  client,
  searchPending,
  normalizedSearch,
  requestGeneration,
  setAppliedFiltersState,
  setCursorState,
  rawFiltersOwned,
  appliedFiltersOwned,
  cursorOwned,
  rangeError,
  appliedFilters,
  after,
  setQueryState,
  refreshRevision,
}: ReturnType<typeof useManagedAttendanceState>) => {
  useEffect(() => {
    if (!searchPending) return undefined;
    const timer = window.setTimeout(() => {
      requestGeneration.current += 1;
      setAppliedFiltersState((current) => {
        const filters = current.owner === client ? current.value : currentMonthFilters();
        return {
          owner: client,
          value:
            filters.employeeSearch === normalizedSearch
              ? filters
              : { ...filters, employeeSearch: normalizedSearch },
        };
      });
      setCursorState({ owner: client, value: [undefined] });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    client,
    normalizedSearch,
    searchPending,
    requestGeneration,
    setAppliedFiltersState,
    setCursorState,
  ]);

  useEffect(() => {
    if (!rawFiltersOwned || !appliedFiltersOwned || !cursorOwned) return undefined;
    if (rangeError || searchPending) return undefined;
    const generation = requestGeneration.current + 1;
    requestGeneration.current = generation;
    let mounted = true;
    const variables = requestVariables(appliedFilters, after);
    setQueryState((current) => ({
      owner: client,
      value: {
        result: current.owner === client ? current.value.result : null,
        loading: true,
        error: null,
      },
    }));

    void client.request(ManagedAttendancePageDocument, variables).then(
      (response) => {
        if (!mounted || requestGeneration.current !== generation) return;
        setQueryState({
          owner: client,
          value: { result: response.managedAttendance, loading: false, error: null },
        });
      },
      (requestError: unknown) => {
        if (!mounted || requestGeneration.current !== generation) return;
        setQueryState({
          owner: client,
          value: {
            result: null,
            loading: false,
            error: graphQlUserMessage(requestError),
          },
        });
      }
    );

    return () => {
      mounted = false;
    };
  }, [
    requestGeneration,
    setQueryState,
    after,
    appliedFilters,
    client,
    rangeError,
    refreshRevision,
    rawFiltersOwned,
    searchPending,
    appliedFiltersOwned,
    cursorOwned,
  ]);
};
