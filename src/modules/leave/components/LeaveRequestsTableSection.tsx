import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import { LEAVE_APPROVAL_REFRESH_MESSAGE } from '../leaveApproval';

export type LeaveRequestRow = LeaveBoardQuery['leaveRequests'][number];

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
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
}

export interface LeaveRequestsTableSectionProps {
  actionsDisabled?: boolean;
  rows: LeaveRequestRow[];
  leaveTypeNameById: Map<string, string>;
  employeeLabel?: (employeeId: string) => string;
  hideEmployeeColumn?: boolean;
  showApprovalColumn: boolean;
  viewerId?: string;
  approveBusyId: string | null;
  cancelBusyId: string | null;
  onApprove: (leaveRequestId: string, pendingApprovalStepId?: string | null) => void;
  onRejectClick: (leaveRequestId: string, pendingApprovalStepId?: string | null) => void;
  onCancelOwn: (leaveRequestId: string) => void;
  onOpenTrail: (row: LeaveRequestRow) => void;
  emptyLabel?: string;
}

type RowProps = Omit<LeaveRequestsTableSectionProps, 'rows' | 'emptyLabel'> & {
  row: LeaveRequestRow;
};

export const ApprovalActions = ({
  row,
  approveBusyId,
  cancelBusyId,
  onApprove,
  onRejectClick,
  viewerId,
  actionsDisabled = false,
}: RowProps) => {
  if (
    row.status.toLowerCase() !== 'pending' ||
    row.viewerMayApprove !== true ||
    viewerId === row.employeeId
  )
    return null;
  if (!row.pendingApprovalStepId?.trim()) {
    return (
      <p role="status" className="max-w-56 text-xs text-amber-700 dark:text-amber-300">
        {LEAVE_APPROVAL_REFRESH_MESSAGE}
      </p>
    );
  }
  const busy = actionsDisabled || approveBusyId === row.id || cancelBusyId === row.id;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        data-tour-anchor="leave.approve-trigger"
        variant="primary"
        type="button"
        className="!py-1 !text-xs"
        disabled={busy}
        onClick={() => onApprove(row.id, row.pendingApprovalStepId)}
      >
        {approveBusyId === row.id ? 'Approving...' : 'Approve'}
      </Button>
      <Button
        data-tour-anchor="leave.reject-trigger"
        variant="outline"
        type="button"
        className="!py-1 !text-xs"
        disabled={busy}
        onClick={() => onRejectClick(row.id, row.pendingApprovalStepId)}
      >
        Reject
      </Button>
    </div>
  );
};

export const OwnRequestAction = ({
  row,
  viewerId,
  approveBusyId,
  cancelBusyId,
  onCancelOwn,
  actionsDisabled = false,
}: RowProps) => {
  if (viewerId !== row.employeeId || row.status.toLowerCase() !== 'pending') return null;
  return (
    <Button
      variant="outline"
      type="button"
      className="!py-1 !text-xs"
      disabled={actionsDisabled || cancelBusyId === row.id || approveBusyId === row.id}
      onClick={() => onCancelOwn(row.id)}
    >
      {cancelBusyId === row.id ? 'Cancelling...' : 'Cancel'}
    </Button>
  );
};

export const RequestStatus = ({ row }: { row: LeaveRequestRow }) => (
  <div className="space-y-1">
    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
    {row.pendingApprovalStage ? (
      <p className="text-xs text-content-secondary">Awaiting {row.pendingApprovalStage}</p>
    ) : null}
  </div>
);

function appliedAtLabel(value: unknown): string {
  if (typeof value !== 'string') return 'Unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString('en-IN');
}

export const RequestDetails = ({ row }: { row: LeaveRequestRow }) => (
  <details className="max-w-64 break-words text-sm">
    <summary className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      Details
    </summary>
    <p>Applied: {appliedAtLabel(row.appliedAt)}</p>
    {row.rejectionReason ? <p>Rejection: {row.rejectionReason}</p> : null}
    <p>Document: {row.supportingDocumentFileName ?? row.supportingDocumentReference ?? '-'}</p>
  </details>
);

const employeeName = ({ row, employeeLabel }: RowProps) =>
  employeeLabel?.(row.employeeId) ?? row.employeeName ?? 'Employee details unavailable';
const duration = (row: LeaveRequestRow) =>
  `${row.daysRequested}${row.isHalfDay ? ` - ${row.halfDaySession ?? 'Half day'}` : ''}`;

const MobileRequest = (props: RowProps) => {
  const { row, hideEmployeeColumn, leaveTypeNameById, showApprovalColumn, onOpenTrail } = props;
  return (
    <div className="space-y-3">
      {!hideEmployeeColumn ? (
        <p className="break-words font-semibold">{employeeName(props)}</p>
      ) : null}
      <p>
        {leaveTypeNameById.get(row.leaveTypeId) ?? 'Leave'} - {duration(row)} days
      </p>
      <p className="text-sm">
        {row.fromDate} - {row.toDate}
      </p>
      <RequestStatus row={row} />
      {row.reason ? <p className="break-words text-sm">{row.reason}</p> : null}
      {showApprovalColumn ? <ApprovalActions {...props} /> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          data-tour-anchor="leave.workflow-trigger"
          onClick={() => onOpenTrail(row)}
        >
          History
        </Button>
        <OwnRequestAction {...props} />
      </div>
      <RequestDetails row={row} />
    </div>
  );
};

function requestColumns(props: LeaveRequestsTableSectionProps) {
  const { hideEmployeeColumn, leaveTypeNameById, showApprovalColumn, viewerId, onOpenTrail } =
    props;
  return [
    ...(hideEmployeeColumn
      ? []
      : [
          {
            key: 'employeeId',
            label: 'Employee',
            render: (row: LeaveRequestRow) => (
              <p className="max-w-48 break-words">{employeeName({ ...props, row })}</p>
            ),
          },
        ]),
    {
      key: 'leaveTypeId',
      label: 'Type',
      render: (row: LeaveRequestRow) => leaveTypeNameById.get(row.leaveTypeId) ?? 'Leave',
    },
    {
      key: 'fromDate',
      label: 'Dates',
      render: (row: LeaveRequestRow) => `${row.fromDate} - ${row.toDate}`,
    },
    { key: 'daysRequested', label: 'Days', render: duration },
    {
      key: 'status',
      label: 'Status',
      render: (row: LeaveRequestRow) => <RequestStatus row={row} />,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row: LeaveRequestRow) => <p className="max-w-64 break-words">{row.reason ?? '-'}</p>,
    },
    ...(showApprovalColumn
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row: LeaveRequestRow) => <ApprovalActions {...props} row={row} />,
          },
        ]
      : []),
    ...(viewerId
      ? [
          {
            key: 'selfService',
            label: 'My Request',
            render: (row: LeaveRequestRow) => <OwnRequestAction {...props} row={row} />,
          },
        ]
      : []),
    {
      key: 'details',
      label: 'Details',
      render: (row: LeaveRequestRow) => <RequestDetails row={row} />,
    },
    {
      key: 'trail',
      label: 'History',
      render: (row: LeaveRequestRow) => (
        <Button
          type="button"
          variant="outline"
          className="!py-1 !text-xs"
          data-tour-anchor="leave.workflow-trigger"
          onClick={() => onOpenTrail(row)}
        >
          View
        </Button>
      ),
    },
  ];
}

const LeaveRequestsTableSection = (props: LeaveRequestsTableSectionProps) => {
  const { rows, emptyLabel = 'No Leave Requests Match This Filter.' } = props;
  if (!rows.length) return <p className="text-sm text-content-secondary">{emptyLabel}</p>;
  return (
    <Table
      ariaLabel="Leave requests"
      data={rows}
      keyExtractor={(row) => row.id}
      columns={requestColumns(props)}
      renderMobileRow={(row) => <MobileRequest {...props} row={row} />}
    />
  );
};

export default LeaveRequestsTableSection;
