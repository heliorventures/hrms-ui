import { useCallback, useMemo, useState } from 'react';

import { createPermissionService } from '../../../auth/permissionService';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import { useAuth } from '../../../contexts/AuthContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery } from '../../../hooks/useRetainedQuery';

import LeaveCalendarControls from './LeaveCalendarControls';
import LeaveCalendarGrid from './LeaveCalendarGrid';
import LeaveCalendarHolidays from './LeaveCalendarHolidays';
import LeaveCalendarList from './LeaveCalendarList';
import {
  type LeaveCalendarResponse,
  HrLeaveCalendarRangeDocument,
  pad2,
  monthRange,
} from './leaveCalendarModel';

interface LeaveTeamCalendarProps {
  enabled?: boolean;
}

const LeaveTeamCalendar = ({ enabled = true }: LeaveTeamCalendarProps) => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const includeEmployees = permissions.canScopedPermission('employee:read');
  const includeHolidays = permissions.canScopedPermission('attendance:read');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [view, setView] = useState('list');

  const { days: monthDays } = useMemo(() => monthRange(year, month), [year, month]);
  const monthPrefix = `${year}-${pad2(month + 1)}`;

  const load = useCallback(async () => {
    if (!enabled) return null;
    const response = await client.request<LeaveCalendarResponse>(HrLeaveCalendarRangeDocument, {
      includeEmployees,
      includeHolidays,
      reqLim: 400,
      orgLim: 500,
      typeLim: 80,
      holidayFrom: `${monthPrefix}-01`,
      holidayLimit: 450,
      fromDate: monthDays[0],
      toDate: monthDays[monthDays.length - 1],
    });
    return {
      ...response,
      orgChart: response.orgChart ?? [],
      upcomingHolidays: response.upcomingHolidays ?? [],
    };
  }, [client, enabled, monthDays, monthPrefix, includeEmployees, includeHolidays]);
  const { data, error, phase, refresh } = useRetainedQuery(load);
  const loading = phase === 'initial-loading' || phase === 'refreshing';

  const goPrevMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <Card>
      <div className="mb-2">
        <LeaveCalendarControls
          canShowGrid={includeEmployees}
          year={year}
          month={month}
          view={view}
          loading={loading}
          setMonth={setMonth}
          setYear={setYear}
          setView={setView}
          goPrevMonth={goPrevMonth}
          goNextMonth={goNextMonth}
          refresh={refresh}
        />
      </div>
      <PageInformation title="Calendar guide">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          The list includes request statuses. The monthly calendar shows approved leave by day, with
          holiday shading and a legend for leave types.
        </p>
      </PageInformation>
      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading && !data ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : view === 'list' ? (
        <div
          className={`grid gap-3 ${includeHolidays ? 'lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]' : ''}`}
        >
          <LeaveCalendarList key={monthPrefix} data={data} />
          {includeHolidays && <LeaveCalendarHolidays data={data} monthPrefix={monthPrefix} />}
        </div>
      ) : (
        <LeaveCalendarGrid data={data} monthDays={monthDays} monthPrefix={monthPrefix} />
      )}
      {view === 'calendar' && includeHolidays && (
        <div className="mt-3">
          <LeaveCalendarHolidays data={data} monthPrefix={monthPrefix} />
        </div>
      )}
    </Card>
  );
};

export default LeaveTeamCalendar;
