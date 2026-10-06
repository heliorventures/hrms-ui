import { useMemo } from 'react';

import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';

import { MONTH_LABELS } from './leaveCalendarModel';

interface Props {
  canShowGrid: boolean;
  year: number;
  month: number;
  view: string;
  loading: boolean;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setView: (view: string) => void;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  refresh: () => Promise<void>;
}
const LeaveCalendarControls = ({
  canShowGrid,
  year,
  month,
  view,
  loading,
  setMonth,
  setYear,
  setView,
  goPrevMonth,
  goNextMonth,
  refresh,
}: Props) => {
  const anchorYear = useMemo(() => new Date().getFullYear(), []);
  const yearChoices = useMemo(() => {
    const ys = new Set<number>();
    for (let y = anchorYear - 2; y <= anchorYear + 2; y++) ys.add(y);
    ys.add(year);
    return [...ys].sort((a, b) => a - b);
  }, [anchorYear, year]);
  return (
    <div
      className="flex flex-wrap items-center gap-2 text-xs font-normal"
      data-tour-anchor="leave.team-calendar-controls"
    >
      <button
        type="button"
        className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600"
        onClick={goPrevMonth}
        aria-label="Previous Month"
      >
        ←
      </button>
      <label className="flex items-center gap-1">
        <span className="sr-only">Month</span>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="max-w-[9rem] rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {MONTH_LABELS.map((label, idx) => (
            <option key={label} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span className="sr-only">Year</span>
        <select
          data-tour-anchor="leave.holidays-year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {yearChoices.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600"
        onClick={goNextMonth}
        aria-label="Next Month"
      >
        →
      </button>
      <Select
        aria-label="Calendar view"
        value={view}
        onChange={(event) => setView(event.target.value)}
        options={[
          { value: 'list', label: 'Leave list' },
          ...(canShowGrid ? [{ value: 'calendar', label: 'Monthly calendar' }] : []),
        ]}
      />
      <Button
        variant="outline"
        type="button"
        className="!py-1 !text-xs"
        onClick={() => void refresh()}
        disabled={loading}
      >
        Refresh
      </Button>
    </div>
  );
};
export default LeaveCalendarControls;
