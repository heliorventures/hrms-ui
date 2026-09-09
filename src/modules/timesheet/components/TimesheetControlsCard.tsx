import { Link } from 'react-router-dom';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import type { PeriodMode } from '../timesheetTypes';

interface TimesheetControlsCardProps {
  customEnd: string;
  customStart: string;
  earliestMonday: string;
  lockApproved: boolean;
  periodMode: PeriodMode;
  periodSummary: string;
  sortedCount: number;
  actionsDisabled?: boolean;
  canWrite: boolean;
  addEntryDisabledReason?: string | null;
  rangeError?: string | null;
  submitBusy: boolean;
  submitDisabledReason?: string | null;
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
  actionsDisabled = false,
  canWrite,
  addEntryDisabledReason = null,
  rangeError = null,
  submitBusy,
  submitDisabledReason = null,
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
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheet</h1>
        <PageInformation title="Timesheet">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record work here. Attendance punches stay on the{' '}
            <Link to="/attendance" className="text-primary-600 underline dark:text-primary-400">
              Attendance
            </Link>{' '}
            screen.
          </p>
        </PageInformation>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{periodSummary}</p>
    </div>

    <Card className="!p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label
              htmlFor="timesheet-period-view"
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              View
            </label>
            <select
              id="timesheet-period-view"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={periodMode}
              onChange={(event) => onModeChange(event.target.value as PeriodMode)}
            >
              <option value="week">Weekly View (Mon-Sun)</option>
              <option value="month">Calendar Month</option>
              <option value="custom">Custom Dates</option>
            </select>
          </div>

          {periodMode !== 'custom' && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" type="button" onClick={onPrevious}>
                Previous
              </Button>
              <Button variant="outline" type="button" onClick={onThisPeriod}>
                Today / This Period
              </Button>
              <Button variant="outline" type="button" onClick={onNext}>
                Next
              </Button>
            </div>
          )}

          {periodMode === 'custom' && (
            <div className="flex flex-wrap gap-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Start date
                <input
                  type="date"
                  className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={customStart}
                  onChange={(event) => onCustomStartChange(event.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                End date
                <input
                  type="date"
                  className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={customEnd}
                  onChange={(event) => onCustomEndChange(event.target.value)}
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Button
              variant="primary"
              type="button"
              onClick={onAddEntry}
              disabled={actionsDisabled || Boolean(addEntryDisabledReason)}
              title={addEntryDisabledReason ?? undefined}
            >
              Add Entry
            </Button>
          ) : null}
          <Button variant="outline" type="button" onClick={onRefresh}>
            Refresh
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onExportCsv}
            disabled={!sortedCount || actionsDisabled}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {rangeError ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{rangeError}</p>
      ) : null}
      <PageInformation title="Entry policy">
        <p className="mt-1">
          Draft edits are allowed for weeks starting on or after {earliestMonday}.{' '}
          {lockApproved ? 'Approved entries cannot be edited.' : ''}
        </p>
      </PageInformation>

      {canWrite && periodMode === 'week' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <Button
            variant="primary"
            type="button"
            disabled={!submitWeekEditable || submitBusy}
            onClick={onSubmitWeek}
          >
            {submitBusy ? 'Submitting...' : `Submit Week ${weekSubmitMonday} For Approval`}
          </Button>
          {!submitWeekEditable && (
            <span className="text-xs text-amber-700 dark:text-amber-300">
              {submitDisabledReason ?? 'This week is outside the editable window configured by HR.'}
            </span>
          )}
        </div>
      )}
    </Card>
  </>
);

export default TimesheetControlsCard;
