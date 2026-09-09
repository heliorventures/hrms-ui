import Button from '../../../components/common/Button';
import PageActions from '../../../components/common/PageActions';
import PageNotice from '../../../components/common/PageNotice';
import { toIsoDate } from '../../../utils/calendarRange';
import type { AttendancePageModel } from '../hooks/useAttendancePageModel';

import ManualAttendanceModal from './ManualAttendanceModal';

export const AttendancePageToolbar = ({ model }: { model: AttendancePageModel }) => {
  const { canPunchAttendance, policyReady, openAdjust } = model;
  return (
    <PageActions>
      <h1 className="sr-only">Attendance</h1>
      {canPunchAttendance ? (
        <Button
          variant="primary"
          type="button"
          disabled={!policyReady}
          title={policyReady ? undefined : 'Loading adjustment policy'}
          onClick={() => openAdjust(toIsoDate(new Date()))}
        >
          {policyReady ? 'Add Missed Punches' : 'Loading adjustment policy…'}
        </Button>
      ) : null}
    </PageActions>
  );
};
export const AttendancePageNotices = ({ model }: { model: AttendancePageModel }) => {
  const { error, success, setSuccess, refreshing, refreshBoard } = model;
  return (
    <>
      {' '}
      {error && (
        <PageNotice
          variant="error"
          title="Attendance could not be refreshed"
          focusOnMount
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => void refreshBoard()}
            >
              {refreshing ? 'Trying again…' : 'Try again'}
            </Button>
          }
        >
          {error}
        </PageNotice>
      )}
      {success && (
        <PageNotice variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </PageNotice>
      )}
    </>
  );
};
export const AttendancePageEditor = ({ model }: { model: AttendancePageModel }) => {
  const {
    canPunchAttendance,
    policyReady,
    adjustOpen,
    closeAdjust,
    isEditorCurrent,
    adjustDefaultDate,
    adjustDefaultSegment,
    currentBoard,
    existingSegmentsComplete,
    monthBounds,
    adjustPolicyDays,
    canRegularize,
    refreshBoard,
  } = model;
  if (!adjustOpen) return null;
  return (
    <>
      {' '}
      {canPunchAttendance && policyReady ? (
        <ManualAttendanceModal
          isOpen={adjustOpen}
          onClose={closeAdjust}
          defaultWorkDate={adjustDefaultDate}
          editingSegmentId={adjustDefaultSegment?.id}
          defaultCheckIn={adjustDefaultSegment?.checkInTime}
          defaultCheckOut={adjustDefaultSegment?.checkOutTime}
          existingSegments={currentBoard?.attendance ?? []}
          existingSegmentsComplete={existingSegmentsComplete}
          existingSegmentsCoverage={{ fromDate: monthBounds.start, toDate: monthBounds.end }}
          selfServiceDays={adjustPolicyDays}
          canRegularize={canRegularize}
          onSaved={() => {
            if (isEditorCurrent()) refreshBoard();
          }}
        />
      ) : null}
    </>
  );
};
