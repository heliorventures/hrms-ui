import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageActions from '../../../components/common/PageActions';

import AttendanceRegularizationModal from './AttendanceRegularizationModal';
import ManagedAttendanceFilters from './ManagedAttendanceFilters';
import ManagedAttendanceNotices from './ManagedAttendanceNotices';
import ManagedAttendancePager from './ManagedAttendancePager';
import ManagedAttendanceTable from './ManagedAttendanceTable';
import type {
  ManagedAttendanceActions,
  ManagedAttendanceFiltersValue,
} from './managedAttendanceTypes';
import { useManagedAttendanceActions } from './useManagedAttendanceActions';
import { useManagedAttendanceFilters } from './useManagedAttendanceFilters';
import { useManagedAttendanceQuery } from './useManagedAttendanceQuery';
import { useManagedAttendanceState } from './useManagedAttendanceState';

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
  const state = useManagedAttendanceState(initialFilters);
  useManagedAttendanceQuery(state);
  const { changeFilters, refresh } = useManagedAttendanceFilters(state, onFiltersChange);
  const { openAdd, openAdjust, regularizationSaved, previousPage, nextPage } =
    useManagedAttendanceActions(state, { onAdd, onAdjust });
  const {
    client,
    rawFiltersOwned,
    rawFilters,
    appliedFilters,
    searchPending,
    cursorStack,
    result,
    loading,
    error,
    regularization,
    setRegularizationState,
  } = state;
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

      <ManagedAttendanceNotices state={state} refresh={refresh} />
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
