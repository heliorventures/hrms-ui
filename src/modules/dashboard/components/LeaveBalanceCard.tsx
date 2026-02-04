import { useMockApi } from '../../../hooks/useMockApi';
import { useTenant } from '../../../contexts/TenantContext';
import { mockLeaveBalances } from '../../../mocks/leaves';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const LeaveBalanceCard = () => {
  const { currentTenant } = useTenant();
  
  const { data: leaveBalances, loading } = useMockApi(
    () => mockLeaveBalances.filter((lb) => true), // Filter by tenant if needed
    { delay: 300 }
  );

  if (loading) {
    return (
      <Card title="Leave Balance">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card title="Leave Balance">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {leaveBalances?.map((balance) => (
          <div
            key={balance.leaveType}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              {balance.leaveType}
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {balance.available}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              of {balance.total} available
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LeaveBalanceCard;
