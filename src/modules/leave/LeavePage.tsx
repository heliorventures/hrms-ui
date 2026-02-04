import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { mockLeaveApplications, mockLeaveBalances } from '../../mocks/leaves';
import { LeaveApplication, LeaveStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ApplyLeaveModal from './components/ApplyLeaveModal';

const LeavePage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: leaveBalance, loading: balanceLoading } = useMockApi(
    () => mockLeaveBalances,
    { delay: 300 }
  );

  const { data: leaveApplications, loading: applicationsLoading } = useMockApi(
    () =>
      mockLeaveApplications
        .filter(
          (leave) =>
            leave.tenantId === currentTenant.id && leave.userId === user?.id
        )
        .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)),
    { delay: 400 }
  );

  const getStatusVariant = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const columns = [
    {
      key: 'leaveType',
      label: 'Leave Type',
      render: (leave: LeaveApplication) => (
        <span className="capitalize">{leave.leaveType}</span>
      ),
    },
    {
      key: 'fromDate',
      label: 'From Date',
      render: (leave: LeaveApplication) =>
        new Date(leave.fromDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'toDate',
      label: 'To Date',
      render: (leave: LeaveApplication) =>
        new Date(leave.toDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'days',
      label: 'Days',
      render: (leave: LeaveApplication) => `${leave.days} day(s)`,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (leave: LeaveApplication) => (
        <span className="max-w-xs truncate">{leave.reason}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (leave: LeaveApplication) => (
        <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
      ),
    },
    {
      key: 'appliedOn',
      label: 'Applied On',
      render: (leave: LeaveApplication) =>
        new Date(leave.appliedOn).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leave Management
        </h1>
        <Button onClick={() => setShowApplyModal(true)}>Apply for Leave</Button>
      </div>

      <Card title="Leave Balance">
        {balanceLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {leaveBalance?.map((balance) => (
              <div
                key={balance.leaveType}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  {balance.leaveType}
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {balance.available}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  of {balance.total} available
                </div>
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-primary-600 dark:bg-primary-500"
                      style={{
                        width: `${(balance.available / balance.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Leave History">
        {applicationsLoading ? (
          <LoadingSpinner />
        ) : leaveApplications && leaveApplications.length > 0 ? (
          <Table
            data={leaveApplications}
            columns={columns}
            keyExtractor={(leave) => leave.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No leave applications found
          </p>
        )}
      </Card>

      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        leaveBalances={leaveBalance || []}
      />
    </div>
  );
};

export default LeavePage;
