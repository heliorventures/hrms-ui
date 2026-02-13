import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { LeaveApplication, LeaveStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import ApplyLeaveModal from './components/ApplyLeaveModal';

const LeavePage = () => {
  const { user, role } = useAuth();
  const { currentTenant } = useTenant();
  const {
    getLeaveApplications,
    getAllLeaveApplications,
    getLeaveBalances,
    updateLeaveStatus,
    deleteLeaveApplication,
    getEmployees,
  } = useDataStore();

  const [showApplyModal, setShowApplyModal] = useState(false);

  const leaveBalance = user ? getLeaveBalances(currentTenant.id, user.id) : [];
  const leaveApplications = user
    ? role === 'admin'
      ? getAllLeaveApplications(currentTenant.id)
      : getLeaveApplications(user.id, currentTenant.id)
    : [];
  const employees = getEmployees(currentTenant.id);

  const getEmployeeName = (userId: string) =>
    employees.find((e) => e.id === userId)?.name ?? userId;

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
    ...(role === 'admin'
      ? [
          {
            key: 'userName',
            label: 'Employee',
            render: (leave: LeaveApplication) => getEmployeeName(leave.userId),
          },
        ]
      : []),
    {
      key: 'leaveType',
      label: 'Leave Type',
      render: (leave: LeaveApplication) => (
        <span className="capitalize">{leave.leaveType}</span>
      ),
    },
    {
      key: 'fromDate',
      label: 'From',
      render: (leave: LeaveApplication) =>
        new Date(leave.fromDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'toDate',
      label: 'To',
      render: (leave: LeaveApplication) =>
        new Date(leave.toDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'days',
      label: 'Days',
      render: (leave: LeaveApplication) => `${leave.days} day(s)`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (leave: LeaveApplication) => (
        <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (leave: LeaveApplication) => (
        <div className="flex gap-2">
          {leave.status === 'pending' && (
            <>
              {role === 'admin' ? (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      updateLeaveStatus(leave.id, 'approved', user?.id)
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      updateLeaveStatus(leave.id, 'rejected', user?.id)
                    }
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteLeaveApplication(leave.id)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leave Management
        </h1>
        {role !== 'admin' && (
          <Button onClick={() => setShowApplyModal(true)}>Apply for Leave</Button>
        )}
      </div>

      <Card title="Leave Balance">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {leaveBalance.map((balance) => (
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
      </Card>

      <Card title={role === 'admin' ? 'All Leave Applications' : 'Leave History'}>
        {leaveApplications.length > 0 ? (
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
      />
    </div>
  );
};

export default LeavePage;
