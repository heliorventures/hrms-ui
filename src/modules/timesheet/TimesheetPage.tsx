import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  DeleteTimesheetEntryDocument,
  SubmitTimesheetWeekDocument,
  TimesheetLockPolicyDocument,
  TimesheetRowsDocument,
} from '../../api/graphql/graphql';
import { decodeTimesheetDescription } from '../../utils/timesheetDescription';
import { timesheetWeekRangeIso } from '../../utils/timesheetWeek';
import { isoDateRangeContains, monthBoundsIso, toIsoDate } from '../../utils/calendarRange';
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
  timesheetEntryCanDelete,
  timesheetEntryCanEdit,
  weekMondayOfWorkDateIso,
} from './timesheetRules';
import type { EntryRow, PeriodMode } from './timesheetTypes';

const TIMESHEET_ROW_LIMIT = 500;
const DEFAULT_LOCK_WEEKS = 4;

const TimesheetPage = () => {
  const client = useGraphClient('client');
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

  const displayBounds = useMemo(() => {
    if (periodMode === 'week') return timesheetWeekRangeIso(cursor);
    if (periodMode === 'month') return monthBoundsIso(cursor.getFullYear(), cursor.getMonth());
    const start = customStart.trim();
    const end = customEnd.trim();
    return start && end && start <= end ? { start, end } : timesheetWeekRangeIso(new Date());
  }, [periodMode, cursor, customStart, customEnd]);

  const earliestMonday = useMemo(() => earliestEditableMondayIso(lockWeeks), [lockWeeks]);

  const loadPolicies = useCallback(async () => {
    try {
      const response = await client.request(TimesheetLockPolicyDocument);
      const policy = response.timesheetLockPolicy;
      const span = parseInt(String(policy?.editableWeekSpan ?? DEFAULT_LOCK_WEEKS), 10);
      setLockWeeks(Number.isFinite(span) ? span : DEFAULT_LOCK_WEEKS);
      setLockApproved(Boolean(policy?.lockApprovedEntries));
    } catch {
      setLockWeeks(DEFAULT_LOCK_WEEKS);
      setLockApproved(true);
    }
  }, [client]);

  const loadEntries = useCallback(async () => {
    const response = await client.request(TimesheetRowsDocument, { limit: TIMESHEET_ROW_LIMIT });
    setEntries((response.timesheetEntries ?? []) as EntryRow[]);
  }, [client]);

  useEffect(() => {
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
  }, [loadPolicies, loadEntries]);

  useEffect(() => {
    if (periodMode !== 'custom' || (customStart && customEnd)) return;
    const { start, end } = timesheetWeekRangeIso(new Date());
    setCustomStart(start);
    setCustomEnd(end);
  }, [periodMode, customStart, customEnd]);

  const refresh = useCallback(async () => {
    try {
      await loadEntries();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  }, [loadEntries]);

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
    () => filtered.reduce((total, row) => total + (parseFloat(row.hoursWorked) || 0), 0),
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

  const calendarWeeks = useMemo(() => {
    if (periodMode === 'week') return buildWeekRowCells(displayBounds.start);
    if (periodMode === 'month') return buildMonthGridCells(displayBounds.start, displayBounds.end);
    return buildCustomRangeGridCells(displayBounds.start, displayBounds.end);
  }, [periodMode, displayBounds.start, displayBounds.end]);

  const weekSubmitMonday =
    periodMode === 'week' ? displayBounds.start : timesheetWeekRangeIso(new Date()).start;
  const submitWeekEditable = weekSubmitMonday >= earliestMonday;
  const allowedMinIsoForm = displayBounds.start >= earliestMonday ? displayBounds.start : earliestMonday;
  const todayIso = toIsoDate(new Date());

  const dateAllowsNewEntry = useCallback(
    (iso: string) =>
      iso >= allowedMinIsoForm &&
      iso <= displayBounds.end &&
      weekMondayOfWorkDateIso(iso) >= earliestMonday,
    [allowedMinIsoForm, displayBounds.end, earliestMonday]
  );

  const openNewEntry = (datePreset: string | null = null) => {
    setEditing(null);
    setAddDatePreset(datePreset);
    setFormOpen(true);
  };

  const handleDelete = async (row: EntryRow) => {
    if (!timesheetEntryCanDelete(row.status)) return;
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
    if (!submitWeekEditable) return;
    setSubmitBusy(true);
    setError(null);
    try {
      await client.request(SubmitTimesheetWeekDocument, { weekStartDate: weekSubmitMonday });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSubmitBusy(false);
    }
  };

  const exportCsv = () => {
    const lines = [
      ['workDate', 'hoursWorked', 'projectCode', 'task', 'notes', 'status', 'batchId'].join(','),
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
        submitBusy={submitBusy}
        submitWeekEditable={submitWeekEditable}
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
        error={error}
        loading={loading}
        sortedCount={sorted.length}
        todayIso={todayIso}
        totalHours={totalHours}
        canAddOnDate={dateAllowsNewEntry}
        canEditRow={(row) => timesheetEntryCanEdit(row.status, row.workDate, earliestMonday)}
        onAddForDate={openNewEntry}
        onDelete={(row) => void handleDelete(row)}
        onEdit={(row) => {
          setEditing(row);
          setAddDatePreset(null);
          setFormOpen(true);
        }}
      />

      <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setAddDatePreset(null);
        }}
        title={editing ? 'Edit entry' : 'Add entry'}
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
        />
      </Modal>
    </div>
  );
};

export default TimesheetPage;
