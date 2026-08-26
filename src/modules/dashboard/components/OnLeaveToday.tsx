import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { OnLeaveTodayDocument, type OnLeaveTodayQuery } from '../../../api/graphql/graphql';
import AsyncState from '../../../components/common/AsyncState';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';
import { toIsoDate } from '../../../utils/calendarRange';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

const LEAVE_REQUEST_LIMIT = 50;
const LEAVE_TYPE_LIMIT = 50;

type LeavePerson = OnLeaveTodayQuery['leaveRequests'][number];
type LeavePayload = OnLeaveTodayQuery;
type LeaveTypeMap = Map<string, { code: string; name: string }>;

const buildLeaveTypeMap = (payload: LeavePayload | null) => {
  const leaveTypes: LeaveTypeMap = new Map();
  for (const type of payload?.leaveTypes ?? []) {
    leaveTypes.set(type.id, { name: type.name, code: type.code });
  }
  return leaveTypes;
};

const selectOnLeaveToday = (payload: LeavePayload | null, today: string) =>
  (payload?.leaveRequests ?? []).filter((leave) => {
    const status = leave.status.toLowerCase();
    const approved = status === 'approved' || status === 'approve';
    const from = String(leave.fromDate).slice(0, 10);
    const to = String(leave.toDate).slice(0, 10);
    return approved && from <= today && to >= today;
  });

interface OnLeaveTodayFooterProps {
  hasData: boolean;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
}

const OnLeaveTodayFooter = ({ hasData, onRefresh, phase }: OnLeaveTodayFooterProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
    {hasData ? (
      <Button
        variant="quiet"
        size="sm"
        busy={phase === 'refreshing'}
        busyLabel="Refreshing Leave Requests…"
        onClick={onRefresh}
      >
        Refresh Leave Requests
      </Button>
    ) : null}
    <Link
      to="/leave/team-calendar"
      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
    >
      Show All on Calendar →
    </Link>
  </div>
);

const leaveTypeLabel = (person: LeavePerson, leaveTypeById: LeaveTypeMap) => {
  const leaveType = leaveTypeById.get(person.leaveTypeId);
  return leaveType ? `${leaveType.name} (${leaveType.code})` : 'Leave';
};

interface OnLeaveTodayListProps {
  capped: boolean;
  leaveTypeById: LeaveTypeMap;
  people: LeavePerson[];
}

const OnLeaveTodayList = ({
  capped,
  leaveTypeById,
  people,
}: OnLeaveTodayListProps) => {
  if (people.length === 0 && capped) {
    return (
      <AsyncState
        kind="unavailable"
        title="No Approved Leave Is Shown in the Loaded Results."
        description="More may be available."
      />
    );
  }

  if (people.length === 0) {
    return (
      <AsyncState
        kind="empty"
        title="No One Is on Leave Today."
        description="Approved leave for today will appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {people.map((person) => {
        const displayName = `${person.employeeName!.trim()} (${person.employeeCode!.trim()})`;
        const from = String(person.fromDate).slice(0, 10);
        const to = String(person.toDate).slice(0, 10);
        return (
          <div
            key={person.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
              <p className="break-words text-xs text-gray-500 dark:text-gray-400">
                {leaveTypeLabel(person, leaveTypeById)}
                {person.isHalfDay ? ' · Half day' : ''}
                {person.halfDaySession
                  ? ` (${person.halfDaySession.replace('_', ' ').toLowerCase()})`
                  : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(from).toLocaleDateString('en-IN')} to{' '}
                {new Date(to).toLocaleDateString('en-IN')}
              </p>
            </div>
            <span className="shrink-0 text-xs capitalize text-gray-500 dark:text-gray-400">
              {person.status}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface OnLeaveTodayCapsProps {
  payload: LeavePayload;
  requestsCapped: boolean;
}

const OnLeaveTodayCaps = ({ payload, requestsCapped }: OnLeaveTodayCapsProps) => (
  <>
    {requestsCapped ? (
      <p role="status" className="mt-3 text-xs text-content-secondary">
        Showing up to {LEAVE_REQUEST_LIMIT} leave requests. More may be available.
      </p>
    ) : null}
    {payload.leaveTypes.length === LEAVE_TYPE_LIMIT ? (
      <p role="status" className="mt-2 text-xs text-content-secondary">
        Showing up to {LEAVE_TYPE_LIMIT} leave types. More may be available.
      </p>
    ) : null}
  </>
);

const OnLeaveToday = () => {
  const client = useGraphClient('client');
  const today = toIsoDate(new Date());
  const loadLeaveRequests = useCallback(
    () =>
      client.request<OnLeaveTodayQuery>(OnLeaveTodayDocument, {
        limit: LEAVE_REQUEST_LIMIT,
        typeLim: LEAVE_TYPE_LIMIT,
        today,
      }),
    [client, today]
  );
  const { data: payload, error, phase, refresh } = useRetainedQuery(loadLeaveRequests);
  const leaveTypeById = useMemo(() => buildLeaveTypeMap(payload), [payload]);
  const onLeaveToday = useMemo(() => selectOnLeaveToday(payload, today), [payload, today]);
  const hasMissingEmployeeLabels = onLeaveToday.some(
    (person) => !person.employeeName?.trim() || !person.employeeCode?.trim()
  );
  const leaveRequestsMayBeCapped = payload?.leaveRequests.length === LEAVE_REQUEST_LIMIT;
  const onRefresh = () => void refresh();

  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <Card title="On Leave Today">
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading Leave Requests…"
          errorTitle="Leave Requests Could Not Be Loaded"
          error={error}
          onRetry={onRefresh}
        />
        <OnLeaveTodayFooter hasData={false} phase={phase} onRefresh={onRefresh} />
      </Card>
    );
  }

  if (!payload) return null;

  return (
    <Card title="On Leave Today">
      <DashboardCardRefreshNotice
        phase={phase}
        loadingTitle="Refreshing Leave Requests…"
        loadingDescription="Showing the last loaded leave list while this updates."
        staleTitle="Leave Requests May Be Out of Date"
        staleDescription="Showing the last loaded leave list."
        error={error}
        onRetry={onRefresh}
      />
      {hasMissingEmployeeLabels ? (
        <AsyncState
          kind="unavailable"
          title="Employee Details Could Not Be Loaded."
          description="Refresh the leave list. If the issue continues, ask an administrator to verify employee records."
        />
      ) : (
        <OnLeaveTodayList
          capped={leaveRequestsMayBeCapped}
          leaveTypeById={leaveTypeById}
          people={onLeaveToday}
        />
      )}
      <OnLeaveTodayCaps payload={payload} requestsCapped={leaveRequestsMayBeCapped} />
      <OnLeaveTodayFooter hasData phase={phase} onRefresh={onRefresh} />
    </Card>
  );
};

export default OnLeaveToday;
