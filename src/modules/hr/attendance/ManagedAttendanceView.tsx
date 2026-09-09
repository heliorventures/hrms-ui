import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  ManagedAttendancePageDocument,
  type ManagedAttendancePageQuery,
} from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageActions from '../../../components/common/PageActions';
import PageNotice from '../../../components/common/PageNotice';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import AttendanceRegularizationModal from './AttendanceRegularizationModal';
import ManagedAttendanceFilters from './ManagedAttendanceFilters';
import ManagedAttendancePager from './ManagedAttendancePager';
import ManagedAttendanceTable from './ManagedAttendanceTable';
import {
  currentMonthFilters,
  requestVariables,
  type ManagedAttendanceActions,
  managedAttendanceRangeError,
  type ManagedAttendanceRegularizationSelection,
  type ManagedAttendanceAddContext,
  type ManagedAttendanceFiltersValue,
  type ManagedAttendanceRow,
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

interface ManagedAttendanceViewProps extends Partial<ManagedAttendanceActions> {
  initialFilters: ManagedAttendanceFiltersValue;
  onFiltersChange: (filters: ManagedAttendanceFiltersValue) => void;
}

const HrAttendanceManagementView = ({
  onAdd,
  onAdjust,
  initialFilters,
  onFiltersChange,
}: ManagedAttendanceViewProps) => {
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
  }, [client, normalizedSearch, searchPending]);

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
    after,
    appliedFilters.employeeId,
    appliedFilters.employeeSearch,
    appliedFilters.fromDate,
    appliedFilters.toDate,
    client,
    rangeError,
    refreshRevision,
    rawFiltersOwned,
    searchPending,
    appliedFiltersOwned,
    cursorOwned,
  ]);

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
  }, [client]);

  const openAdd = useCallback(
    (context: ManagedAttendanceAddContext) => {
      onAdd?.(context);
      setRegularizationState({
        owner: client,
        value: { employee: context, initialWorkDate: context.workDate },
      });
    },
    [client, onAdd]
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
    [client, onAdjust]
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
    [client]
  );

  const previousPage = useCallback(() => {
    requestGeneration.current += 1;
    setCursorState((current) => {
      const stack = current.owner === client ? current.value : [undefined];
      return { owner: client, value: stack.length > 1 ? stack.slice(0, -1) : stack };
    });
  }, [client]);

  const nextPage = useCallback(
    (nextCursor: string) => {
      requestGeneration.current += 1;
      setCursorState((current) => ({
        owner: client,
        value: [...(current.owner === client ? current.value : [undefined]), nextCursor],
      }));
    },
    [client]
  );

  const rows = result?.edges.map((edge) => edge.node) ?? [];
  const pageInfo = result?.pageInfo;
  const tableLoading = loading || searchPending;

  return (
    <div className="space-y-4">
      <PageActions>
        <div>
          <h1 className="sr-only">Attendance management</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          aria-label="Refresh attendance"
          disabled={tableLoading}
          onClick={refresh}
        >
          Refresh
        </Button>
      </PageActions>

      <Card>
        <ManagedAttendanceFilters
          key={rawFiltersOwned ? 'active-client-filters' : 'replacement-client-filters'}
          value={rawFilters}
          onChange={changeFilters}
        />
      </Card>

      {rangeError ? (
        <PageNotice variant="error" title="Update the date range">
          {rangeError}
        </PageNotice>
      ) : null}

      {searchPending ? (
        <PageNotice variant="info" title="Updating attendance search">
          The updated employee search will be applied in a moment.
        </PageNotice>
      ) : null}

      {error ? (
        <PageNotice
          variant="error"
          title="Attendance could not be loaded"
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        >
          {error}
        </PageNotice>
      ) : null}

      {success ? (
        <PageNotice
          variant="success"
          onDismiss={() => setSuccessState({ owner: client, value: null })}
        >
          {success}
        </PageNotice>
      ) : null}

      <ManagedAttendanceTable
        rows={rows}
        loading={tableLoading}
        errorMessage={error}
        onAdd={openAdd}
        onAdjust={openAdjust}
      />

      {pageInfo ? (
        <ManagedAttendancePager
          hasPreviousPage={cursorStack.length > 1}
          hasNextPage={pageInfo.hasNextPage}
          endCursor={pageInfo.endCursor}
          loading={tableLoading}
          onPrevious={previousPage}
          onNext={nextPage}
        />
      ) : null}

      {regularization ? (
        <AttendanceRegularizationModal
          isOpen
          onClose={() => setRegularizationState({ owner: client, value: null })}
          employee={regularization.employee}
          initialWorkDate={regularization.initialWorkDate}
          editingRow={regularization.editingRow}
          existingSegments={rows.filter(
            (row) => row.employeeId === regularization.employee.employeeId
          )}
          existingSegmentsComplete={
            cursorStack.length === 1 && Boolean(pageInfo) && !pageInfo?.hasNextPage
          }
          existingSegmentsCoverage={{
            fromDate: appliedFilters.fromDate,
            toDate: appliedFilters.toDate,
          }}
          onSaved={regularizationSaved}
        />
      ) : null}
    </div>
  );
};

export default HrAttendanceManagementView;
