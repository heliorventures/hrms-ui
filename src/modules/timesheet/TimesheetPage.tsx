import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  DeleteTimesheetEntryDocument,
  SubmitTimesheetWeekDocument,
  TimesheetLockPolicyDocument,
  TimesheetRowsDocument,
} from '../../api/graphql/graphql';
import { decodeTimesheetDescription } from '../../utils/timesheetDescription';
import { timesheetWeekRangeIso } from '../../utils/timesheetWeek';
import {
  isoDateRangeContains,
  monthBoundsIso,
  parseIsoDate,
  toIsoDate,
} from '../../utils/calendarRange';
import {
  buildCustomRangeGridCells,
  buildMonthGridCells,
  buildWeekRowCells,
} from '../../utils/timesheetCalendarGrid';
import TimesheetEntryForm from '../attendance/components/TimesheetEntryForm';

type PeriodMode = 'week' | 'month' | 'custom';

interface EntryRow {
  id: string;
  workDate: string;
  hoursWorked: string;
  projectCode?: string | null;
  description?: string | null;
  status: string;
  batchId?: string | null;
}

function statusUpper(s: string): string {
  return s.trim().toUpperCase();
}

function timesheetEntryCanDelete(status: string): boolean {
  const s = statusUpper(status);
  return s === 'DRAFT' || s === 'REJECTED';
}

function earliestEditableMondayIso(editableWeekSpan: number): string {
  const today = new Date();
  const { start: curMon } = timesheetWeekRangeIso(today);
  const cur = parseIsoDate(curMon);
  const span = Math.max(1, Math.floor(editableWeekSpan));
  cur.setDate(cur.getDate() - 7 * (span - 1));
  return toIsoDate(cur);
}

function weekMondayOfWorkDateIso(workIso: string): string {
  return timesheetWeekRangeIso(parseIsoDate(workIso)).start;
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const TimesheetPage = () => {
  const client = useGraphClient('client');
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [lockWeeks, setLockWeeks] = useState(4);
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
    if (periodMode === 'month')
      return monthBoundsIso(cursor.getFullYear(), cursor.getMonth());
    const start = customStart.trim();
    const end = customEnd.trim();
    if (start && end && start <= end) return { start, end };
    return timesheetWeekRangeIso(new Date());
  }, [periodMode, cursor, customStart, customEnd]);

  const earliestMonday = useMemo(() => earliestEditableMondayIso(lockWeeks), [lockWeeks]);

  const loadPolicies = useCallback(async () => {
    try {
      const r = await client.request(TimesheetLockPolicyDocument);
      const pol = r.timesheetLockPolicy;
      const spanRaw = pol?.editableWeekSpan;
      const span =
        typeof spanRaw === 'number' ? spanRaw : parseInt(String(spanRaw ?? '4'), 10);
      setLockWeeks(Number.isFinite(span) ? span : 4);
      setLockApproved(Boolean(pol?.lockApprovedEntries));
    } catch {
      setLockWeeks(4);
      setLockApproved(true);
    }
  }, [client]);

  const loadEntries = useCallback(async () => {
    const r = await client.request(TimesheetRowsDocument, { limit: 500 });
    const rows = (r.timesheetEntries ?? []) as EntryRow[];
    setEntries(rows);
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadPolicies(), loadEntries()]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load timesheet');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPolicies, loadEntries]);

  const refresh = useCallback(async () => {
    try {
      await loadEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    }
  }, [loadEntries]);

  const filtered = useMemo(() => {
    return entries.filter((e) =>
      isoDateRangeContains(e.workDate, displayBounds.start, displayBounds.end)
    );
  }, [entries, displayBounds.start, displayBounds.end]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const d = a.workDate.localeCompare(b.workDate);
      if (d !== 0) return d;
      return a.id.localeCompare(b.id);
    });
  }, [filtered]);

  const totalHours = useMemo(() => {
    let s = 0;
    for (const r of filtered) {
      const n = parseFloat(r.hoursWorked);
      if (!Number.isNaN(n)) s += n;
    }
    return s;
  }, [filtered]);

  const entriesByDate = useMemo(() => {
    const m = new Map<string, EntryRow[]>();
    for (const e of filtered) {
      const arr = m.get(e.workDate) ?? [];
      arr.push(e);
      m.set(e.workDate, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.id.localeCompare(b.id));
    }
    return m;
  }, [filtered]);

  const calendarWeeks = useMemo(() => {
    if (periodMode === 'week') return buildWeekRowCells(displayBounds.start);
    if (periodMode === 'month')
      return buildMonthGridCells(displayBounds.start, displayBounds.end);
    return buildCustomRangeGridCells(displayBounds.start, displayBounds.end);
  }, [periodMode, displayBounds.start, displayBounds.end]);

  const weekSubmitMonday =
    periodMode === 'week' ? displayBounds.start : timesheetWeekRangeIso(new Date()).start;

  const submitWeekEditable = weekSubmitMonday >= earliestMonday;

  const allowedMinIsoForm = useMemo(() => {
    return displayBounds.start >= earliestMonday ? displayBounds.start : earliestMonday;
  }, [displayBounds.start, earliestMonday]);

  const todayIso = toIsoDate(new Date());

  const dateAllowsNewEntry = useCallback(
    (iso: string) => {
      if (iso < allowedMinIsoForm || iso > displayBounds.end) return false;
      return weekMondayOfWorkDateIso(iso) >= earliestMonday;
    },
    [allowedMinIsoForm, displayBounds.end, earliestMonday]
  );

  const rowCanEdit = (row: EntryRow) => {
    const st = statusUpper(row.status);
    if (st !== 'DRAFT') return false;
    const wm = weekMondayOfWorkDateIso(row.workDate);
    if (wm < earliestMonday) return false;
    return true;
  };

  const handleDelete = async (row: EntryRow) => {
    if (!timesheetEntryCanDelete(row.status)) return;
    setDeleteBusyId(row.id);
    try {
      await client.request(DeleteTimesheetEntryDocument, { id: row.id });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitBusy(false);
    }
  };

  const exportCsv = () => {
    const lines = [
      ['workDate', 'hoursWorked', 'projectCode', 'task', 'notes', 'status', 'batchId'].join(','),
      ...sorted.map((r) => {
        const dec = decodeTimesheetDescription(r.description ?? null);
        const esc = (x: string | null | undefined) =>
          `"${String(x ?? '').replace(/"/g, '""')}"`;
        return [
          r.workDate,
          r.hoursWorked,
          r.projectCode ?? '',
          dec.task,
          dec.notes,
          r.status,
          r.batchId ?? '',
        ]
          .map((c) => esc(String(c)))
          .join(',');
      }),
    ];
    downloadTextFile(`timesheet-${displayBounds.start}-to-${displayBounds.end}.csv`, lines.join('\n'));
  };

  const navPrev = () => {
    if (periodMode === 'week') {
      const d = new Date(cursor);
      d.setDate(d.getDate() - 7);
      setCursor(d);
    } else if (periodMode === 'month') {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
      setCursor(d);
    }
  };

  const navNext = () => {
    if (periodMode === 'week') {
      const d = new Date(cursor);
      d.setDate(d.getDate() + 7);
      setCursor(d);
    } else if (periodMode === 'month') {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      setCursor(d);
    }
  };

  const navThis = () => {
    setCursor(new Date());
    if (periodMode === 'custom') {
      const { start, end } = timesheetWeekRangeIso(new Date());
      setCustomStart(start);
      setCustomEnd(end);
    }
  };

  useEffect(() => {
    if (periodMode !== 'custom') return;
    if (!customStart || !customEnd) {
      const { start, end } = timesheetWeekRangeIso(new Date());
      setCustomStart(start);
      setCustomEnd(end);
    }
  }, [periodMode, customStart, customEnd]);

  const periodSummary =
    periodMode === 'week'
      ? `Week ${displayBounds.start} → ${displayBounds.end}`
      : periodMode === 'month'
        ? `Month ${displayBounds.start} → ${displayBounds.end}`
        : `Custom ${displayBounds.start} → ${displayBounds.end}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use the week or month calendar to see hours per day; click a logged block to edit (draft
          only). <strong>Add entry</strong> or <strong>+ Add</strong> on a day adds a row. Submit your
          week for approval from week view, and export CSV anytime. Attendance punches stay on the{' '}
          <Link to="/attendance" className="text-primary-600 underline dark:text-primary-400">
            Attendance
          </Link>{' '}
          screen.
        </p>
      </div>

      <Card title="Period & actions">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              View
            </label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
            >
              <option value="week">Current week (Mon–Sun)</option>
              <option value="month">Calendar month</option>
              <option value="custom">Custom dates</option>
            </select>
          </div>

          {periodMode !== 'custom' && (
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={navPrev}>
                Previous
              </Button>
              <Button variant="outline" type="button" onClick={navThis}>
                Today / this period
              </Button>
              <Button variant="outline" type="button" onClick={navNext}>
                Next
              </Button>
            </div>
          )}

          {periodMode === 'custom' && (
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <input
                type="date"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setEditing(null);
                setAddDatePreset(null);
                setFormOpen(true);
              }}
            >
              Add entry
            </Button>
            <Button variant="outline" type="button" onClick={() => void refresh()}>
              Refresh
            </Button>
            <Button variant="outline" type="button" onClick={exportCsv} disabled={!sorted.length}>
              Export CSV
            </Button>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{periodSummary}</p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Draft edits allowed for weeks starting on or after {earliestMonday}.{' '}
          {lockApproved ? 'Approved rows stay locked server-side.' : ''}
        </p>

        {periodMode === 'week' && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button
              variant="primary"
              type="button"
              disabled={!submitWeekEditable || submitBusy}
              onClick={() => void handleSubmitWeek()}
            >
              {submitBusy ? 'Submitting…' : `Submit week ${weekSubmitMonday} for approval`}
            </Button>
            {!submitWeekEditable && (
              <span className="text-xs text-amber-700 dark:text-amber-300">
                This week is outside the editable window configured by HR.
              </span>
            )}
          </div>
        )}
      </Card>

      <Card
        title={`Calendar — ${sorted.length} entr${sorted.length === 1 ? 'y' : 'ies'} · ${totalHours.toFixed(2)} h in view`}
      >
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px] space-y-2">
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_HEADERS.map((w) => (
                  <div
                    key={w}
                    className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {w}
                  </div>
                ))}
              </div>
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5">
                  {week.map((cell) => {
                    const { iso, inPrimaryRange } = cell;
                    const dayEntries = entriesByDate.get(iso) ?? [];
                    const dayTotal = dayEntries.reduce(
                      (acc, r) => acc + (parseFloat(r.hoursWorked) || 0),
                      0
                    );
                    const isToday = iso === todayIso;
                    const ref = parseIsoDate(iso);
                    const dow = ref.toLocaleDateString('en-IN', { weekday: 'short' });
                    const dom = ref.getDate();

                    return (
                      <div
                        key={iso}
                        className={[
                          'flex min-h-[6.5rem] flex-col rounded-lg border p-1.5 text-left sm:min-h-[7.25rem]',
                          inPrimaryRange
                            ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800/80'
                            : 'border-transparent bg-gray-50 dark:bg-gray-900/50',
                          isToday ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-gray-900' : '',
                        ].join(' ')}
                      >
                        <div className="mb-1 flex shrink-0 items-baseline justify-between gap-1 border-b border-gray-100 pb-1 dark:border-gray-700/80">
                          <span
                            className={`text-xs font-semibold ${inPrimaryRange ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                          >
                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                              {dow}
                            </span>{' '}
                            {dom}
                          </span>
                          <span className="text-[11px] font-medium tabular-nums text-gray-700 dark:text-gray-200">
                            {dayTotal > 0
                              ? `${dayTotal.toFixed(dayTotal % 1 === 0 ? 0 : 1)}h`
                              : '—'}
                          </span>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                          {dayEntries.map((entry) => {
                            const dec = decodeTimesheetDescription(entry.description ?? null);
                            const h = parseFloat(entry.hoursWorked);
                            const hrs = Number.isNaN(h) ? entry.hoursWorked : `${h % 1 === 0 ? h : h.toFixed(1)}h`;
                            const proj = entry.projectCode?.trim();
                            const task = dec.task?.trim();
                            const summary =
                              [hrs, proj || null, task || null].filter(Boolean).join(' · ') || hrs;
                            const editable = rowCanEdit(entry);

                            return (
                              <div key={entry.id} className="flex items-start gap-0.5">
                                <button
                                  type="button"
                                  disabled={!editable}
                                  title={
                                    editable
                                      ? 'Edit entry'
                                      : `${entry.status} — only draft entries can be edited here`
                                  }
                                  onClick={() => {
                                    if (!editable) return;
                                    setEditing(entry);
                                    setAddDatePreset(null);
                                    setFormOpen(true);
                                  }}
                                  className={[
                                    'min-w-0 flex-1 rounded border px-1 py-0.5 text-left text-[10px] leading-tight transition-colors',
                                    editable
                                      ? 'cursor-pointer border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-600 dark:bg-slate-900/60 dark:hover:bg-primary-950/50'
                                      : 'cursor-not-allowed border-transparent bg-gray-100/90 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
                                  ].join(' ')}
                                >
                                  <span className="line-clamp-3">{summary}</span>
                                </button>
                                {timesheetEntryCanDelete(entry.status) && (
                                  <button
                                    type="button"
                                    aria-label="Delete entry"
                                    disabled={deleteBusyId === entry.id}
                                    className="shrink-0 rounded px-0.5 text-xs leading-none text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleDelete(entry);
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {dateAllowsNewEntry(iso) && inPrimaryRange && (
                          <button
                            type="button"
                            className="mt-auto shrink-0 pt-1 text-center text-[10px] font-medium text-primary-600 hover:underline dark:text-primary-400"
                            onClick={() => {
                              setEditing(null);
                              setAddDatePreset(iso);
                              setFormOpen(true);
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {!sorted.length && (
                <p className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  No entries in this period — use <strong>Add entry</strong> or tap{' '}
                  <strong>+ Add</strong> on a day.
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

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
