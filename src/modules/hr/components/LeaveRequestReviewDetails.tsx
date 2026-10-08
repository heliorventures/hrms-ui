import { Link } from 'react-router-dom';

import Button from '../../../components/common/Button';
import {
  ApprovalActions,
  OwnRequestAction,
  RequestDetails,
  RequestStatus,
  type LeaveRequestsTableSectionProps,
  type LeaveRequestRow,
} from '../../leave/components/LeaveRequestsTableSection';

interface Props extends LeaveRequestsTableSectionProps {
  row: LeaveRequestRow;
  onBack: () => void;
}
const LeaveRequestReviewDetails = (props: Props) => {
  const { row, employeeLabel, leaveTypeNameById, onOpenTrail, onBack } = props;
  return (
    <div className="space-y-4">
      <Button variant="quiet" className="xl:hidden" onClick={onBack}>
        Back to requests
      </Button>
      <h3 className="break-words text-xl font-semibold">
        {employeeLabel?.(row.employeeId) ?? row.employeeName ?? 'Employee'}
      </h3>
      <RequestStatus row={row} />
      <p className="text-base font-medium">
        {row.fromDate} – {row.toDate}
      </p>
      <p className="text-sm text-content-secondary">
        {leaveTypeNameById.get(row.leaveTypeId) ?? 'Leave'} · {row.daysRequested} days
        {row.isHalfDay ? ` · ${row.halfDaySession ?? 'Half day'}` : ''}
      </p>
      <div className="border-y border-line py-4">
        <h4 className="text-xs font-semibold text-content-muted">Reason</h4>
        <p className="mt-2 break-words text-sm">{row.reason || 'No reason provided.'}</p>
      </div>
      <RequestDetails row={row} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => onOpenTrail(row)}>
          View history
        </Button>
        <Link
          to="/leave/team-calendar"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-accent focus-visible:ring-2 focus-visible:ring-focus"
        >
          Open leave calendar
        </Link>
      </div>
      {props.showApprovalColumn ? <ApprovalActions {...props} row={row} /> : null}
      <OwnRequestAction {...props} row={row} />
    </div>
  );
};
export default LeaveRequestReviewDetails;
