import AttendanceCursorPager from './components/AttendanceCursorPager';
import AttendanceGuidance from './components/AttendanceGuidance';
import AttendanceMonthControls from './components/AttendanceMonthControls';
import AttendanceMonthlySummary from './components/AttendanceMonthlySummary';
import {
  AttendancePageToolbar,
  AttendancePageNotices,
  AttendancePageEditor,
} from './components/AttendancePageFeedback';
import AttendanceSegmentsTable from './components/AttendanceSegmentsTable';
import { useAttendancePageModel } from './hooks/useAttendancePageModel';

const AttendancePage = () => {
  const model = useAttendancePageModel();
  const {
    year,
    monthIndex,
    now,
    refreshing,
    updateView,
    resetCursorStack,
    refreshBoard,
    currentBoard,
    loading,
    adjustPolicyDays,
    canPunchAttendance,
    policyReady,
    canRegularize,
    filteredSegments,
    selfAdjustAllowedForDate,
    openAdjust,
    effectiveCursorStack,
    changeCursor,
    policyMessage,
  } = model;
  return (
    <div className="space-y-3">
      <AttendancePageToolbar model={model} />
      <AttendanceMonthControls
        year={year}
        monthIndex={monthIndex}
        currentYear={now.getFullYear()}
        refreshing={refreshing}
        updateView={updateView}
        resetCursorStack={resetCursorStack}
        refreshBoard={refreshBoard}
      />
      <AttendanceMonthlySummary summary={currentBoard?.summary ?? null} loading={loading} />

      <AttendancePageNotices model={model} />
      <AttendanceSegmentsTable
        adjustPolicyDays={adjustPolicyDays}
        canAdjust={canPunchAttendance && policyReady}
        canRegularize={canRegularize}
        loading={loading}
        rows={filteredSegments}
        title="Attendance records"
        selfAdjustAllowedForDate={selfAdjustAllowedForDate}
        onAdjust={(row) => openAdjust(row.workDate, row)}
      />
      <AttendanceCursorPager
        cursorStack={effectiveCursorStack}
        endCursor={currentBoard?.pageInfo.endCursor}
        hasNextPage={currentBoard?.pageInfo.hasNextPage ?? false}
        loading={loading || refreshing}
        onCursorChange={changeCursor}
      />

      <AttendanceGuidance
        loading={loading}
        shifts={currentBoard?.shifts ?? []}
        policyReady={policyReady}
        policyMessage={policyMessage}
      />
      <AttendancePageEditor model={model} />
    </div>
  );
};

export default AttendancePage;
