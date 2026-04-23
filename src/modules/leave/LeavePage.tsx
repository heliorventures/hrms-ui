import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import ApplyLeaveModal from './components/ApplyLeaveModal';

interface LeaveTypeRow {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
  carryForward: boolean;
  requiresDocument: boolean;
}

interface LeaveRequestRow {
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  daysRequested: string;
  status: string;
  reason?: string | null;
}

interface LeaveBoardData {
  leaveTypes: LeaveTypeRow[];
  leaveRequests: LeaveRequestRow[];
}

const LEAVE_BOARD = gql`
  query LeaveBoard($limit: Int! = 20) {
    leaveTypes(limit: $limit) {
      id
      name
      code
      isPaid
      carryForward
      requiresDocument
    }
    leaveRequests(limit: $limit) {
      id
      employeeId
      fromDate
      toDate
      daysRequested
      status
      reason
    }
  }
`;

const LeavePage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<LeaveBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    return client.request<LeaveBoardData>(LEAVE_BOARD, { limit: 20 });
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadBoard();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load leave data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const statusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live data from the leave subgraph through the gateway.
          </p>
        </div>
        <Button variant="primary" onClick={() => setApplyOpen(true)} disabled={loading}>
          Apply for leave
        </Button>
      </div>

      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        leaveTypes={data?.leaveTypes ?? []}
        onSubmitted={async () => {
          try {
            setLoading(true);
            setData(await loadBoard());
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to refresh');
          } finally {
            setLoading(false);
          }
        }}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Leave Types">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave types…</p>
        ) : data?.leaveTypes?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.leaveTypes.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {item.code}
                    </p>
                  </div>
                  <Badge variant={item.isPaid ? 'success' : 'neutral'}>
                    {item.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant={item.carryForward ? 'info' : 'neutral'}>
                    {item.carryForward ? 'Carry forward' : 'No carry forward'}
                  </Badge>
                  <Badge variant={item.requiresDocument ? 'warning' : 'neutral'}>
                    {item.requiresDocument ? 'Document required' : 'No document'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No leave types found.</p>
        )}
      </Card>

      <Card title="Recent Leave Requests">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave requests…</p>
        ) : data?.leaveRequests?.length ? (
          <Table
            data={data.leaveRequests}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'employeeId',
                label: 'Employee',
                render: (row: LeaveRequestRow) => row.employeeId,
              },
              {
                key: 'fromDate',
                label: 'From',
                render: (row: LeaveRequestRow) =>
                  new Date(row.fromDate).toLocaleDateString('en-IN'),
              },
              {
                key: 'toDate',
                label: 'To',
                render: (row: LeaveRequestRow) => new Date(row.toDate).toLocaleDateString('en-IN'),
              },
              {
                key: 'daysRequested',
                label: 'Days',
                render: (row: LeaveRequestRow) => row.daysRequested,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: LeaveRequestRow) => (
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                ),
              },
              {
                key: 'reason',
                label: 'Reason',
                render: (row: LeaveRequestRow) => row.reason ?? '—',
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests found.</p>
        )}
      </Card>
    </div>
  );
};

export default LeavePage;
