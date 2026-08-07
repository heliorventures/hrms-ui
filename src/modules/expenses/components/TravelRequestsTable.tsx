import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { EXPENSE_BUSY_PREFIX, EXPENSE_STATUS } from '../constants';
import { expenseStatusVariant, formatCurrency, formatDate, shortId } from '../utils/formatters';
import type { TravelRequestRow } from '../types';

interface TravelRequestsTableProps {
  busyKey: string | null;
  canApprove: boolean;
  loading: boolean;
  rows: TravelRequestRow[];
  onApprove: (travelRequestId: string) => void;
  onReject: (travelRequestId: string) => void;
}

function tripLabel(row: TravelRequestRow): string {
  return [row.originLocation, row.destinationLocation].filter(Boolean).join(' -> ') || row.purpose;
}

const TravelRequestsTable = ({
  busyKey,
  canApprove,
  loading,
  rows,
  onApprove,
  onReject,
}: TravelRequestsTableProps) => {
  return (
    <Card title="Travel requests">
      <Table
        data={rows}
        loading={loading}
        emptyMessage="No travel requests yet."
        keyExtractor={(row) => row.id}
        columns={[
          {
            key: 'purpose',
            label: 'Trip',
            render: (row) => <span className="max-w-md truncate">{tripLabel(row)}</span>,
          },
          {
            key: 'dates',
            label: 'Dates',
            render: (row) => `${row.fromDate} - ${row.toDate}`,
          },
          {
            key: 'estimate',
            label: 'Estimate',
            render: (row) =>
              row.estimatedAmount ? formatCurrency(row.estimatedAmount, row.currency) : '-',
          },
          {
            key: 'workflow',
            label: 'Approval',
            render: (row) =>
              row.workflowInstanceId ? (
                <span className="font-mono text-xs text-teal-700 dark:text-teal-300">
                  WF {shortId(row.workflowInstanceId)}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <div className="flex flex-col gap-1">
                <Badge variant={expenseStatusVariant(row.status)}>{row.status}</Badge>
                {row.pendingApprovalStage ? (
                  <span className="max-w-[12rem] text-xs text-sky-800 dark:text-sky-200">
                    Awaiting: {row.pendingApprovalStage}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            key: 'submittedAt',
            label: 'Submitted',
            render: (row) => formatDate(row.submittedAt),
          },
          ...(canApprove
            ? [
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (row: TravelRequestRow) => {
                    const pending = row.status.toUpperCase() === EXPENSE_STATUS.pending;
                    if (!pending) return <span className="text-gray-400">-</span>;
                    if (!row.viewerMayApprove) {
                      return (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Awaiting another approver
                        </span>
                      );
                    }
                    return (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 !text-xs"
                          disabled={busyKey === `${EXPENSE_BUSY_PREFIX.travel}:${row.id}`}
                          onClick={() => onApprove(row.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="!px-2 !py-1 !text-xs"
                          disabled={busyKey === `${EXPENSE_BUSY_PREFIX.travel}:${row.id}`}
                          onClick={() => onReject(row.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    );
                  },
                },
              ]
            : []),
        ]}
      />
    </Card>
  );
};

export default TravelRequestsTable;
