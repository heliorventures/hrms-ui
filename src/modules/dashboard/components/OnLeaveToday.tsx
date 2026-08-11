import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { type OnLeaveTodayQuery } from '../../../api/graphql/graphql';
import { toIsoDate } from '../../../utils/calendarRange';

const OnLeaveTodayRangeDocument = `
  query OnLeaveTodayRange($limit: Int! = 50, $orgLim: Int! = 500, $typeLim: Int! = 50, $today: NaiveDate) {
    leaveRequests(limit: $limit, fromDate: $today, toDate: $today) {
      id
      employeeId
      leaveTypeId
      fromDate
      toDate
      status
      isHalfDay
      halfDaySession
    }
    leaveTypes(limit: $typeLim) {
      id
      name
      code
    }
    orgChart(limit: $orgLim) {
      employeeId
      fullName
      employeeCode
    }
  }
`;

const OnLeaveToday = () => {
  const client = useGraphClient('client');
  const today = toIsoDate(new Date());
  const [payload, setPayload] = useState<OnLeaveTodayQuery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await client.request<OnLeaveTodayQuery>(OnLeaveTodayRangeDocument, {
          limit: 50,
          orgLim: 500,
          typeLim: 50,
          today,
        });
        if (!cancelled) {
          setPayload(result);
        }
      } catch {
        if (!cancelled) {
          setPayload(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, today]);

  const nameByEmployeeId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of payload?.orgChart ?? []) {
      const label =
        row.fullName?.trim() ||
        row.employeeCode?.trim() ||
        row.employeeId;
      m.set(row.employeeId, label);
    }
    return m;
  }, [payload?.orgChart]);

  const leaveTypeById = useMemo(() => {
    const m = new Map<string, { name: string; code: string }>();
    for (const t of payload?.leaveTypes ?? []) {
      m.set(t.id, { name: t.name, code: t.code });
    }
    return m;
  }, [payload?.leaveTypes]);

  const onLeaveToday = useMemo(() => {
    const rows = payload?.leaveRequests ?? [];
    return rows.filter((leave) => {
      const status = leave.status.toLowerCase();
      const approved = status === 'approved' || status === 'approve';
      const from = String(leave.fromDate).slice(0, 10);
      const to = String(leave.toDate).slice(0, 10);
      return approved && from <= today && to >= today;
    });
  }, [payload?.leaveRequests, today]);

  if (loading) {
    return (
      <Card title="On Leave Today">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading Leave Requests...</p>
        <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
          <Link
            to="/leave/team-calendar"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Show all on calendar →
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card title="On Leave Today">
      {onLeaveToday.length > 0 ? (
        <div className="space-y-2">
          {onLeaveToday.map((person) => {
            const displayName =
              nameByEmployeeId.get(person.employeeId) ?? person.employeeId;
            const lt = leaveTypeById.get(person.leaveTypeId);
            const typeLabel = lt ? `${lt.name} (${lt.code})` : null;
            const from = String(person.fromDate).slice(0, 10);
            const to = String(person.toDate).slice(0, 10);
            return (
              <div
                key={person.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {typeLabel ?? 'Leave'}
                    {person.isHalfDay ? ' · Half day' : ''}
                    {person.halfDaySession ? ` (${person.halfDaySession.replace('_', ' ').toLowerCase()})` : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(from).toLocaleDateString('en-IN')} to{' '}
                    {new Date(to).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                  {person.status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No One Is On Leave Today</p>
      )}
      <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
        <Link
          to="/leave/team-calendar"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Show all on calendar →
        </Link>
      </div>
    </Card>
  );
};

export default OnLeaveToday;
