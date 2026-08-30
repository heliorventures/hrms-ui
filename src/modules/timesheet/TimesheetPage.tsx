import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPermissionService } from '../../auth/permissionService';
import Modal from '../../components/common/Modal';
import FlashToastBar from '../../components/common/FlashToastBar';
import { useAuth } from '../../contexts/AuthContext';
import { useDialogs } from '../../contexts/DialogContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useFlashToast } from '../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  DeleteTimesheetEntryDocument,
  SubmitTimesheetWeekDocument,
  TimesheetLockPolicyDocument,
  TimesheetRowsDocument,
} from '../../api/graphql/graphql';
import { decodeTimesheetDescription } from '../../utils/timesheetDescription';
import { timesheetWeekRangeIso } from '../../utils/timesheetWeek';
import { isoDateRangeContains, monthBoundsIso, parseIsoDate, toIsoDate } from '../../utils/calendarRange';
import {
  buildCustomRangeGridCells,
  buildMonthGridCells,
  buildWeekRowCells,
} from '../../utils/timesheetCalendarGrid';
import TimesheetEntryForm from '../attendance/components/TimesheetEntryForm';
import TimesheetCalendarCard from './components/TimesheetCalendarCard';
import TimesheetControlsCard from './components/TimesheetControlsCard';
import {
  downloadTextFile,
  earliestEditableMondayIso,
  formatTimesheetHours,
  parseTimesheetHours,
  timesheetEntryCanDelete,
  timesheetEntryCanEdit,
  timesheetEntryEditDisabledReason,
  timesheetEntryLocksDay,
  validateTimesheetWeekHours,
  weekMondayOfWorkDateIso,
} from './timesheetRules';
import type { EntryRow, PeriodMode } from './timesheetTypes';

const TIMESHEET_ROW_LIMIT = 500;
const DEFAULT_LOCK_WEEKS = 4;

const TimesheetPage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const canRead = permissions.canCapability('route.timesheet');
  const canWrite = permissions.canCapability('action.timesheet.write');
  const { confirm } = useDialogs();
  const { flash, show: showFlash, clear: clearFlash } = useFlashToast();
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [lockWeeks, setLockWeeks] = useState(DEFAULT_LOCK_WEEKS);
  const [lockApproved, setLockApproved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('week');
  const [cursor, setCursor] = useState(() => new Date());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [addDatePreset, setAddDatePreset] = useState<string | null>(null);
  const [editing, setEditing] = useState<EntryRow | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);

  const customStartTrim = customStart.trim();
  const customEndTrim = customEnd.trim();
  const customRangeError =
    periodMode === 'custom' &&
    customStartTrim.length > 0 &&
    customEndTrim.length > 0 &&
    customStartTrim > customEndTrim
      ? 'Custom start date must be on or before custom end date.'
      : null;

  const displayBounds = useMemo(() => {
    if (periodMode === 'week') return timesheetWeekRangeIso(cursor);
    if (periodMode === 'month') return monthBoundsIso(cursor.getFullYear(), cursor.getMonth());
    const start = customStartTrim;
    const end = customEndTrim;
    if (start && end) return { start, end };
    if (start) return { start, end: start };
    if (end) return { start: end, end };
    return timesheetWeekRangeIso(new Date());
  }, [periodMode, cursor, customStartTrim, customEndTrim]);

  const earliestMonday = useMemo(() => earliestEditableMondayIso(lockWeeks), [lockWeeks]);

  const loadPolicies = useCallback(async () => {
    if (!canRead) {
      setLockWeeks(DEFAULT_LOCK_WEEKS);
      setLockApproved(true);
      return {
        editableWeekSpan: DEFAULT_LOCK_WEEKS,
        lockApprovedEntries: true,
      };
    }
    try {
      const response = await client.request(TimesheetLockPolicyDocument);
      const policy = response.timesheetLockPolicy;
      const span = parseInt(String(policy?.editableWeekSpan ?? DEFAULT_LOCK_WEEKS), 10);
      const nextLockWeeks = Number.isFinite(span) ? span : DEFAULT_LOCK_WEEKS;
      const nextLockApproved = Boolean(policy?.lockApprovedEntries);
      setLockWeeks(nextLockWeeks);
      setLockApproved(nextLockApproved);
      return {
        editableWeekSpan: nextLockWeeks,
        lockApprovedEntries: nextLockApproved,
      };
    } catch {
      setLockWeeks(DEFAULT_LOCK_WEEKS);
      setLockApproved(true);
      return {
        editableWeekSpan: DEFAULT_LOCK_WEEKS,
        lockApprovedEntries: true,
      };
    }
  }, [canRead, client]);

  const loadEntries = useCallback(async () => {
    if (!canRead) {
      setEntries([]);
      return;
    }
    const response = await client.request(TimesheetRowsDocument, { limit: TIMESHEET_ROW_LIMIT });
    setEntries((response.timesheetEntries ?? []) as EntryRow[]);
  }, [canRead, client]);

  useEffect(() => {
    if (!canRead) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadPolicies(), loadEntries()]);
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canRead, loadPolicies, loadEntries]);

  useEffect(() => {
    if (periodMode !== 'custom' || (customStart && customEnd)) return;
    const { start, end } = timesheetWeekRangeIso(new Date());
    setCustomStart(start);
    setCustomEnd(end);
  }, [periodMode, customStart, customEnd]);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([loadPolicies(), loadEntries()]);
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  }, [loadPolicies, loadEntries]);

  useEffect(() => {
    const refreshPolicy = () => {
      void loadPolicies();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshPolicy();
    };
    window.addEventListener('focus', refreshPolicy);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refreshPolicy);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadPolicies]);

  const filtered = useMemo(
    () =>
      entries.filter((entry) =>
        isoDateRangeContains(entry.workDate, displayBounds.start, displayBounds.end)
      ),
    [entries, displayBounds.start, displayBounds.end]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((first, second) => {
        const dateOrder = first.workDate.localeCompare(second.workDate);
        return dateOrder !== 0 ? dateOrder : first.id.localeCompare(second.id);
      }),
    [filtered]
  );

  const totalHours = useMemo(
    () => filtered.reduce((total, row) => total + (parseTimesheetHours(row.hoursWorked) || 0), 0),
    [filtered]
  );

  const entriesByDate = useMemo(() => {
    const result = new Map<string, EntryRow[]>();
    for (const entry of filtered) {
      result.set(entry.workDate, [...(result.get(entry.workDate) ?? []), entry]);
    }
    for (const dateRows of result.values()) dateRows.sort((first, second) => first.id.localeCompare(second.id));
    return result;
  }, [filtered]);

  const lockedWeekStarts = useMemo(() => {
    const result = new Set<string>();
    for (const entry of entries) {
      if (timesheetEntryLocksDay(entry.status)) {
        result.add(weekMondayOfWorkDateIso(entry.workDate));
      }
    }
    return result;
  }, [entries]);

  const calendarWeeks = useMemo(() => {
    if (periodMode === 'week') return buildWeekRowCells(displayBounds.start);
    if (periodMode === 'month') return buildMonthGridCells(displayBounds.start, displayBounds.end);
    return buildCustomRangeGridCells(displayBounds.start, displayBounds.end);
  }, [periodMode, displayBounds.start, displayBounds.end]);

  const weekSubmitMonday =
    periodMode === 'week' ? displayBounds.start : timesheetWeekRangeIso(new Date()).start;
  const submitWeekEditable = weekSubmitMonday >= earliestMonday;
  const activeWeekLocked = lockedWeekStarts.has(weekSubmitMonday);
  const addEntryDisabledReason = activeWeekLocked
    ? 'This week is already submitted. Ask the approver to reject it before adding entries.'
    : null;
  const submitDisabledReason = activeWeekLocked
    ? 'This week is already submitted. Ask the approver to reject it before resubmitting.'
    : null;
  const allowedMinIsoForm = displayBounds.start >= earliestMonday ? displayBounds.start : earliestMonday;
  const todayIso = toIsoDate(new Date());

  const dateAllowsNewEntry = useCallback(
    (iso: string) => {
      if (customRangeError) return false;
      const dayRows = entriesByDate.get(iso) ?? [];
      return (
        iso >= allowedMinIsoForm &&
        iso <= displayBounds.end &&
        weekMondayOfWorkDateIso(iso) >= earliestMonday &&
        !lockedWeekStarts.has(weekMondayOfWorkDateIso(iso)) &&
        !dayRows.some((row) => timesheetEntryLocksDay(row.status))
      );
    },
    [allowedMinIsoForm, customRangeError, displayBounds.end, earliestMonday, entriesByDate, lockedWeekStarts]
  );

  const openNewEntry = (datePreset: string | null = null) => {
    if (!canWrite) return;
    const targetDate = datePreset ?? todayIso;
    if (lockedWeekStarts.has(weekMondayOfWorkDateIso(targetDate))) {
      setError('This week is already submitted. Ask the approver to reject it before adding entries.');
      return;
    }
    setEditing(null);
    setAddDatePreset(datePreset);
    setFormOpen(true);
  };

  const handleDelete = async (row: EntryRow) => {
    if (!canWrite) return;
    if (!timesheetEntryCanDelete(row.status)) return;
    const ok = await confirm({
      title: 'Delete Timesheet Entry',
      message: `Delete the ${formatTimesheetHours(row.hoursWorked)}h entry for ${row.workDate}?`,
      confirmLabel: 'Delete Entry',
      variant: 'danger',
    });
    if (!ok) return;
    setDeleteBusyId(row.id);
    setError(null);
    try {
      await client.request(DeleteTimesheetEntryDocument, { id: row.id });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setDeleteBusyId(null);
    }
  };

  const handleSubmitWeek = async () => {
    if (!canWrite) return;
    if (customRangeError) return;
    const freshPolicy = await loadPolicies();
    const freshEarliestMonday = earliestEditableMondayIso(
      freshPolicy?.editableWeekSpan ?? DEFAULT_LOCK_WEEKS
    );
    if (weekSubmitMonday < freshEarliestMonday) {
      setError(`Week ${weekSubmitMonday} is outside the editable window starting ${freshEarliestMonday}.`);
      return;
    }
    const weekBounds = {
      start: weekSubmitMonday,
      end: timesheetWeekRangeIso(parseIsoDate(weekSubmitMonday)).end,
    };
    const weekHours = entries
      .filter((entry) => isoDateRangeContains(entry.workDate, weekBounds.start, weekBounds.end))
      .reduce((total, row) => total + (parseTimesheetHours(row.hoursWorked) || 0), 0);
    const weekValidationError = validateTimesheetWeekHours(weekHours);
    if (weekValidationError) {
      setError(weekValidationError);
      return;
    }
    if (activeWeekLocked) {
      setError('This week is already submitted. Ask the approver to reject it before resubmitting.');
      return;
    }
    setSubmitBusy(true);
    setError(null);
    try {
      await client.request(SubmitTimesheetWeekDocument, { weekStartDate: weekSubmitMonday });
      await refresh();
      showFlash('Timesheet submitted successfully.', 'success');
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSubmitBusy(false);
    }
  };

  const exportCsv = () => {
    const lines = [
      ['Work Date', 'Hours Worked', 'Project Code', 'Task', 'Notes', 'Status', 'Batch Id'].join(','),
      ...sorted.map((row) => {
        const decoded = decodeTimesheetDescription(row.description ?? null);
        const escapeCsv = (value: string | null | undefined) =>
          `"${String(value ?? '').replace(/"/g, '""')}"`;
        return [
          row.workDate,
          row.hoursWorked,
          row.projectCode ?? '',
          decoded.task,
          decoded.notes,
          row.status,
          row.batchId ?? '',
        ].map(escapeCsv).join(',');
      }),
    ];
    downloadTextFile(`timesheet-${displayBounds.start}-to-${displayBounds.end}.csv`, lines.join('\n'));
  };

  const navPrev = () => {
    setCursor((current) =>
      periodMode === 'week'
        ? new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7)
        : new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  };

  const navNext = () => {
    setCursor((current) =>
      periodMode === 'week'
        ? new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7)
        : new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  };

  const navThis = () => {
    setCursor(new Date());
    if (periodMode === 'custom') {
      const { start, end } = timesheetWeekRangeIso(new Date());
      setCustomStart(start);
      setCustomEnd(end);
    }
  };

  const periodSummary =
    periodMode === 'week'
      ? `Week ${displayBounds.start} to ${displayBounds.end}`
      : periodMode === 'month'
        ? `Month ${displayBounds.start} to ${displayBounds.end}`
        : `Custom ${displayBounds.start} to ${displayBounds.end}`;

  if (!canRead) return null;

  return (
    <div className="space-y-6">
      <TimesheetControlsCard
        customEnd={customEnd}
        customStart={customStart}
        earliestMonday={earliestMonday}
        lockApproved={lockApproved}
        periodMode={periodMode}
        periodSummary={periodSummary}
        sortedCount={sorted.length}
        actionsDisabled={Boolean(customRangeError)}
        canWrite={canWrite}
        addEntryDisabledReason={addEntryDisabledReason}
        rangeError={customRangeError}
        submitBusy={submitBusy}
        submitDisabledReason={submitDisabledReason}
        submitWeekEditable={submitWeekEditable && !activeWeekLocked}
        weekSubmitMonday={weekSubmitMonday}
        onAddEntry={() => openNewEntry()}
        onCustomEndChange={setCustomEnd}
        onCustomStartChange={setCustomStart}
        onExportCsv={exportCsv}
        onModeChange={setPeriodMode}
        onNext={navNext}
        onPrevious={navPrev}
        onRefresh={() => void refresh()}
        onSubmitWeek={() => void handleSubmitWeek()}
        onThisPeriod={navThis}
      />

      <TimesheetCalendarCard
        calendarWeeks={calendarWeeks}
        deleteBusyId={deleteBusyId}
        entriesByDate={entriesByDate}
        error={customRangeError ?? error}
        loading={loading}
        sortedCount={sorted.length}
        todayIso={todayIso}
        totalHours={totalHours}
        canWrite={canWrite}
        canAddOnDate={(iso) => canWrite && dateAllowsNewEntry(iso)}
        canEditRow={(row) =>
          canWrite && timesheetEntryCanEdit(row.status, row.workDate, earliestMonday, lockApproved)
        }
        editDisabledReason={(row) =>
          timesheetEntryEditDisabledReason(
            row.status,
            row.workDate,
            earliestMonday,
            lockApproved
          )
        }
        onAddForDate={openNewEntry}
        onDelete={(row) => void handleDelete(row)}
        onEdit={(row) => {
          setEditing(row);
          setAddDatePreset(null);
          setFormOpen(true);
        }}
      />

      {canWrite ? <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setAddDatePreset(null);
        }}
        title={editing ? 'Edit Entry' : 'Add Entry'}
      >
        <TimesheetEntryForm
          key={editing?.id ?? addDatePreset ?? 'new'}
          allowedMinIso={allowedMinIsoForm}
          allowedMaxIso={displayBounds.end}
          initialWorkDateIso={editing?.workDate ?? addDatePreset ?? undefined}
          editing={
            editing
              ? {
                  id: editing.id,
                  workDate: editing.workDate,
                  hoursWorked: editing.hoursWorked,
                  projectCode: editing.projectCode,
                  description: editing.description,
                }
              : undefined
          }
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
            setAddDatePreset(null);
          }}
          onSaved={() => void refresh()}
          existingEntries={entries}
        />
      </Modal> : null}
      <FlashToastBar toast={flash} onDismiss={clearFlash} />
    </div>
  );
};

export default TimesheetPage;
