import Card from '../../../components/common/Card';
import { parseIsoDate } from '../../../utils/calendarRange';
import { decodeTimesheetDescription } from '../../../utils/timesheetDescription';
import { timesheetEntryCanDelete } from '../timesheetRules';
import type { EntryRow } from '../timesheetTypes';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface CalendarCell {
  iso: string;
  inPrimaryRange: boolean;
}

interface TimesheetCalendarCardProps {
  calendarWeeks: CalendarCell[][];
  deleteBusyId: string | null;
  entriesByDate: Map<string, EntryRow[]>;
  error: string | null;
  loading: boolean;
  sortedCount: number;
  todayIso: string;
  totalHours: number;
  canAddOnDate: (iso: string) => boolean;
  canEditRow: (row: EntryRow) => boolean;
  onAddForDate: (iso: string) => void;
  onDelete: (row: EntryRow) => void;
  onEdit: (row: EntryRow) => void;
}

const TimesheetCalendarCard = ({
  calendarWeeks,
  deleteBusyId,
  entriesByDate,
  error,
  loading,
  sortedCount,
  todayIso,
  totalHours,
  canAddOnDate,
  canEditRow,
  onAddForDate,
  onDelete,
  onEdit,
}: TimesheetCalendarCardProps) => (
  <Card title={`Calendar - ${sortedCount} entr${sortedCount === 1 ? 'y' : 'ies'} - ${totalHours.toFixed(2)} h in view`}>
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    ) : error ? (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    ) : (
      <div className="overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_HEADERS.map((header) => (
              <div
                key={header}
                className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {header}
              </div>
            ))}
          </div>
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
              {week.map((cell) => {
                const dayEntries = entriesByDate.get(cell.iso) ?? [];
                const dayTotal = dayEntries.reduce(
                  (total, row) => total + (parseFloat(row.hoursWorked) || 0),
                  0
                );
                const ref = parseIsoDate(cell.iso);
                const weekday = ref.toLocaleDateString('en-IN', { weekday: 'short' });
                const dayOfMonth = ref.getDate();

                return (
                  <div
                    key={cell.iso}
                    className={[
                      'flex min-h-[6.5rem] flex-col rounded-lg border p-1.5 text-left sm:min-h-[7.25rem]',
                      cell.inPrimaryRange
                        ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800/80'
                        : 'border-transparent bg-gray-50 dark:bg-gray-900/50',
                      cell.iso === todayIso
                        ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-gray-900'
                        : '',
                    ].join(' ')}
                  >
                    <div className="mb-1 flex shrink-0 items-baseline justify-between gap-1 border-b border-gray-100 pb-1 dark:border-gray-700/80">
                      <span
                        className={`text-xs font-semibold ${
                          cell.inPrimaryRange ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                        }`}
                      >
                        <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                          {weekday}
                        </span>{' '}
                        {dayOfMonth}
                      </span>
                      <span className="text-[11px] font-medium tabular-nums text-gray-700 dark:text-gray-200">
                        {dayTotal > 0 ? `${dayTotal.toFixed(dayTotal % 1 === 0 ? 0 : 1)}h` : '-'}
                      </span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                      {dayEntries.map((entry) => {
                        const decoded = decodeTimesheetDescription(entry.description ?? null);
                        const parsedHours = parseFloat(entry.hoursWorked);
                        const hours = Number.isNaN(parsedHours)
                          ? entry.hoursWorked
                          : `${parsedHours % 1 === 0 ? parsedHours : parsedHours.toFixed(1)}h`;
                        const summary =
                          [hours, entry.projectCode?.trim() || null, decoded.task?.trim() || null]
                            .filter(Boolean)
                            .join(' - ') || hours;
                        const editable = canEditRow(entry);

                        return (
                          <div key={entry.id} className="flex items-start gap-0.5">
                            <button
                              type="button"
                              disabled={!editable}
                              title={editable ? 'Edit entry' : `${entry.status} - only draft entries can be edited here`}
                              onClick={() => {
                                if (editable) onEdit(entry);
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
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onDelete(entry);
                                }}
                              >
                                x
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {canAddOnDate(cell.iso) && cell.inPrimaryRange && (
                      <button
                        type="button"
                        className="mt-auto shrink-0 pt-1 text-center text-[10px] font-medium text-primary-600 hover:underline dark:text-primary-400"
                        onClick={() => onAddForDate(cell.iso)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {!sortedCount && (
            <p className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              No entries in this period. Use Add entry or + Add on a day.
            </p>
          )}
        </div>
      </div>
    )}
  </Card>
);

export default TimesheetCalendarCard;
