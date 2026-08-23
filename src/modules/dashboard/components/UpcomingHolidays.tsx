import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { ClientOpsUpcomingHolidaysDocument } from '../../../api/graphql/graphql';
import AsyncState from '../../../components/common/AsyncState';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

interface HolidayRow {
  id: string;
  holidayDate: string;
  name: string;
  calendarName: string;
  holidayType?: string | null;
}

const HOLIDAY_LIMIT = 12;

interface UpcomingHolidaysFooterProps {
  hasRows: boolean;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
}

const UpcomingHolidaysFooter = ({ hasRows, onRefresh, phase }: UpcomingHolidaysFooterProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
    {hasRows ? (
      <Button
        variant="quiet"
        size="sm"
        busy={phase === 'refreshing'}
        busyLabel="Refreshing Upcoming Holidays…"
        onClick={onRefresh}
      >
        Refresh Upcoming Holidays
      </Button>
    ) : null}
    <Link
      to="/leave/holidays"
      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
    >
      Show All Holidays →
    </Link>
  </div>
);

interface UpcomingHolidaysListProps {
  rows: HolidayRow[];
}

const UpcomingHolidaysList = ({ rows }: UpcomingHolidaysListProps) => {
  if (rows.length === 0) {
    return (
      <AsyncState
        kind="empty"
        title="No Upcoming Holidays in Range."
        description="Published holidays will appear here when they enter the upcoming range."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((holiday) => (
        <li
          key={holiday.id}
          className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 flex-1 break-words font-medium text-gray-900 [overflow-wrap:anywhere] dark:text-white">
              {holiday.name}
            </span>
            {holiday.holidayType ? (
              <Badge variant="neutral" size="sm">
                {holiday.holidayType}
              </Badge>
            ) : null}
          </div>
          <p className="break-words text-xs text-gray-500 [overflow-wrap:anywhere] dark:text-gray-400">
            {new Date(holiday.holidayDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {holiday.calendarName}
          </p>
        </li>
      ))}
    </ul>
  );
};

const UpcomingHolidays = () => {
  const client = useGraphClient('client');
  const loadHolidays = useCallback(async () => {
    const result = await client.request<{ upcomingHolidays: HolidayRow[] }>(
      ClientOpsUpcomingHolidaysDocument,
      { limit: HOLIDAY_LIMIT }
    );
    return result.upcomingHolidays;
  }, [client]);
  const { data: rows, error, phase, refresh } = useRetainedQuery(loadHolidays);
  const onRefresh = () => void refresh();

  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <Card title="Upcoming Holidays">
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading Upcoming Holidays…"
          errorTitle="Upcoming Holidays Could Not Be Loaded"
          error={error}
          onRetry={onRefresh}
        />
        <UpcomingHolidaysFooter hasRows={false} phase={phase} onRefresh={onRefresh} />
      </Card>
    );
  }

  const holidayRows = rows ?? [];

  return (
    <Card title="Upcoming Holidays">
      <DashboardCardRefreshNotice
        phase={phase}
        loadingTitle="Refreshing Upcoming Holidays…"
        loadingDescription="Showing the last loaded holidays while this updates."
        staleTitle="Upcoming Holidays May Be Out of Date"
        staleDescription="Showing the last loaded holidays."
        error={error}
        onRetry={onRefresh}
      />
      <UpcomingHolidaysList rows={holidayRows} />
      {holidayRows.length === HOLIDAY_LIMIT ? (
        <p role="status" className="mt-3 text-xs text-content-secondary">
          Showing up to {HOLIDAY_LIMIT} upcoming holidays. More may be available.
        </p>
      ) : null}
      <UpcomingHolidaysFooter hasRows phase={phase} onRefresh={onRefresh} />
    </Card>
  );
};

export default UpcomingHolidays;
