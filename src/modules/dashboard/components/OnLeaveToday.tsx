import { useMockApi } from '../../../hooks/useMockApi';
import { useTenant } from '../../../contexts/TenantContext';
import { mockLeaveApplications } from '../../../mocks/leaves';
import { mockUsers } from '../../../mocks/users';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const OnLeaveToday = () => {
  const { currentTenant } = useTenant();
  const today = new Date().toISOString().split('T')[0];

  const { data: onLeaveToday, loading } = useMockApi(
    () => {
      const todayLeaves = mockLeaveApplications.filter(
        (leave) =>
          leave.tenantId === currentTenant.id &&
          leave.status === 'approved' &&
          leave.fromDate <= today &&
          leave.toDate >= today
      );

      return todayLeaves.map((leave) => {
        const user = mockUsers.find((u) => u.id === leave.userId);
        return {
          name: user?.name || 'Unknown',
          department: user?.department || 'N/A',
          leaveType: leave.leaveType,
        };
      });
    },
    { delay: 300 }
  );

  if (loading) {
    return (
      <Card title="On Leave Today">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card title="On Leave Today">
      {onLeaveToday && onLeaveToday.length > 0 ? (
        <div className="space-y-2">
          {onLeaveToday.map((person, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {person.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {person.department}
                </p>
              </div>
              <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {person.leaveType}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No one is on leave today
        </p>
      )}
    </Card>
  );
};

export default OnLeaveToday;
