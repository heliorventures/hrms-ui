import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import type { PeriodMode } from '../timesheetTypes';

interface TimesheetControlsCardProps {
  customEnd: string;
  customStart: string;
  earliestMonday: string;
  lockApproved: boolean;
  periodMode: PeriodMode;
  periodSummary: string;
  sortedCount: number;
  submitBusy: boolean;
  submitWeekEditable: boolean;
  weekSubmitMonday: string;
  onAddEntry: () => void;
  onCustomEndChange: (value: string) => void;
  onCustomStartChange: (value: string) => void;
  onExportCsv: () => void;
  onModeChange: (mode: PeriodMode) => void;
  onNext: () => void;
  onPrevious: () => void;
  onRefresh: () => void;
  onSubmitWeek: () => void;
  onThisPeriod: () => void;
}

const TimesheetControlsCard = ({
  customEnd,
  customStart,
  earliestMonday,
  lockApproved,
  periodMode,
  periodSummary,
  sortedCount,
  submitBusy,
  submitWeekEditable,
  weekSubmitMonday,
  onAddEntry,
  onCustomEndChange,
  onCustomStartChange,
  onExportCsv,
  onModeChange,
  onNext,
  onPrevious,
  onRefresh,
  onSubmitWeek,
  onThisPeriod,
}: TimesheetControlsCardProps) => (
  <>
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheet</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Use the calendar to add draft entries, edit draft rows, submit a week for approval, and export CSV.
        Attendance punches stay on the{' '}
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
            onChange={(event) => onModeChange(event.target.value as PeriodMode)}
          >
            <option value="week">Current week (Mon-Sun)</option>
            <option value="month">Calendar month</option>
            <option value="custom">Custom dates</option>
          </select>
        </div>

        {periodMode !== 'custom' && (
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onPrevious}>
              Previous
            </Button>
            <Button variant="outline" type="button" onClick={onThisPeriod}>
              Today / this period
            </Button>
            <Button variant="outline" type="button" onClick={onNext}>
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
              onChange={(event) => onCustomStartChange(event.target.value)}
            />
            <input
              type="date"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={customEnd}
              onChange={(event) => onCustomEndChange(event.target.value)}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="button" onClick={onAddEntry}>
            Add entry
          </Button>
          <Button variant="outline" type="button" onClick={onRefresh}>
            Refresh
          </Button>
          <Button variant="outline" type="button" onClick={onExportCsv} disabled={!sortedCount}>
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
            onClick={onSubmitWeek}
          >
            {submitBusy ? 'Submitting...' : `Submit week ${weekSubmitMonday} for approval`}
          </Button>
          {!submitWeekEditable && (
            <span className="text-xs text-amber-700 dark:text-amber-300">
              This week is outside the editable window configured by HR.
            </span>
          )}
        </div>
      )}
    </Card>
  </>
);

export default TimesheetControlsCard;
