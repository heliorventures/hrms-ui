import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

export type LeaveRequestRow = LeaveBoardQuery['leaveRequests'][number];

export function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  switch (status.toLowerCase()) {
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
}

interface LeaveRequestsTableSectionProps {
  rows: LeaveRequestRow[];
  leaveTypeNameById: Map<string, string>;
  /** When set, replaces raw employee UUID in the Employee column. */
  employeeLabel?: (employeeId: string) => string;
  /** Hide Employee column when the viewer only sees their own requests. */
  hideEmployeeColumn?: boolean;
  /** Show Approvals column when true (still gated per-row by `canApproveRow`). */
  showApprovalColumn: boolean;
  /** Optional per-row gate (e.g. direct manager vs plain employee). Defaults to true. */
  canApproveRow?: (row: LeaveRequestRow) => boolean;
  viewerId?: string;
  approveBusyId: string | null;
  cancelBusyId: string | null;
  onApprove: (leaveRequestId: string) => void;
  onRejectClick: (leaveRequestId: string) => void;
  onCancelOwn: (leaveRequestId: string) => void;
  onOpenTrail: (row: LeaveRequestRow) => void;
  /** Shown when `rows` is empty (differs for HR queue vs employee board). */
  emptyLabel?: string;
}

const LeaveRequestsTableSection = ({
  rows,
  leaveTypeNameById,
  employeeLabel,
  hideEmployeeColumn = false,
  showApprovalColumn,
  canApproveRow = () => true,
  viewerId,
  approveBusyId,
  cancelBusyId,
  onApprove,
  onRejectClick,
  onCancelOwn,
  onOpenTrail,
  emptyLabel = 'No Leave Requests Match This Filter.',
}: LeaveRequestsTableSectionProps) => {
  if (!rows.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>;
  }

  return (
    <Table
      data={rows}
      keyExtractor={(row) => row.id}
      columns={[
        ...(hideEmployeeColumn
          ? []
          : [
              {
                key: 'employeeId',
                label: 'Employee',
                render: (row: LeaveRequestRow) =>
                  employeeLabel ? employeeLabel(row.employeeId) : row.employeeId,
              },
            ]),
        {
          key: 'leaveTypeId',
          label: 'Type',
          render: (row: LeaveRequestRow) =>
            leaveTypeNameById.get(row.leaveTypeId) ?? row.leaveTypeId.slice(0, 8),
        },
        {
          key: 'appliedAt',
          label: 'Applied',
          render: (row: LeaveRequestRow) =>
            new Date(row.appliedAt).toLocaleString('en-IN', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
        },
        {
          key: 'fromDate',
          label: 'From',
          render: (row: LeaveRequestRow) => new Date(row.fromDate).toLocaleDateString('en-IN'),
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
          key: 'halfDay',
          label: 'Session',
          render: (row: LeaveRequestRow) =>
            row.isHalfDay ? (row.halfDaySession ?? 'Half day') : 'Full day',
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
        {
          key: 'rejectionReason',
          label: 'Rejection',
          render: (row: LeaveRequestRow) => row.rejectionReason ?? '—',
        },
        {
          key: 'supportingDocumentReference',
          label: 'Doc Ref.',
          render: (row: LeaveRequestRow) => row.supportingDocumentReference ?? '—',
        },
        {
          key: 'trail',
          label: 'History',
          render: (row: LeaveRequestRow) => (
            <Button
              type="button"
              variant="outline"
              className="!py-1 !text-xs"
              onClick={() => void onOpenTrail(row)}
            >
              View
            </Button>
          ),
        },
        ...(showApprovalColumn
          ? [
              {
                key: 'actions',
                label: 'Actions',
                render: (row: LeaveRequestRow) =>
                  row.status.toLowerCase() === 'pending' && canApproveRow(row) ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        type="button"
                        className="!py-1 !text-xs"
                        disabled={approveBusyId === row.id || cancelBusyId === row.id}
                        onClick={() => void onApprove(row.id)}
                      >
                        {approveBusyId === row.id ? 'Approving…' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        className="!py-1 !text-xs"
                        disabled={approveBusyId === row.id || cancelBusyId === row.id}
                        onClick={() => onRejectClick(row.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]
          : []),
        ...(viewerId
          ? [
              {
                key: 'selfService',
                label: 'My Request',
                render: (row: LeaveRequestRow) =>
                  row.status.toLowerCase() === 'pending' && row.employeeId === viewerId ? (
                    <Button
                      variant="outline"
                      type="button"
                      className="!py-1 !text-xs"
                      disabled={approveBusyId === row.id || cancelBusyId === row.id}
                      onClick={() => void onCancelOwn(row.id)}
                    >
                      {cancelBusyId === row.id ? 'Cancelling…' : 'Cancel'}
                    </Button>
                  ) : (
                    '—'
                  ),
              },
            ]
          : []),
      ]}
    />
  );
};

export default LeaveRequestsTableSection;
