import { useEffect, useMemo, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';

interface LeaveRequestRow {
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface OnLeaveTodayData {
  leaveRequests: LeaveRequestRow[];
}

const ON_LEAVE_TODAY = gql`
  query OnLeaveToday($limit: Int! = 50) {
    leaveRequests(limit: $limit) {
      id
      employeeId
      fromDate
      toDate
      status
    }
  }
`;

const OnLeaveToday = () => {
  const client = useGraphClient('client');
  const [today] = new Date().toISOString().split('T');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await client.request<OnLeaveTodayData>(ON_LEAVE_TODAY, {
          limit: 50,
        });
        if (!cancelled) {
          setLeaveRequests(result.leaveRequests ?? []);
        }
      } catch {
        if (!cancelled) {
          setLeaveRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const onLeaveToday = useMemo(
    () =>
      leaveRequests.filter((leave) => {
        const status = leave.status.toLowerCase();
        return (
          (status === 'approved' || status === 'approve') &&
          leave.fromDate <= today &&
          leave.toDate >= today
        );
      }),
    [leaveRequests, today]
  );

  if (loading) {
    return (
      <Card title="On Leave Today">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave requests...</p>
      </Card>
    );
  }

  return (
    <Card title="On Leave Today">
      {onLeaveToday && onLeaveToday.length > 0 ? (
        <div className="space-y-2">
          {onLeaveToday.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {person.employeeId}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(person.fromDate).toLocaleDateString('en-IN')} to{' '}
                  {new Date(person.toDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {person.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No one is on leave today</p>
      )}
    </Card>
  );
};

export default OnLeaveToday;
