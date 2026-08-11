import Modal from '../../../components/common/Modal';
import { formatDisplayDate, formatDisplayDateTime } from '../../../utils/dateDisplay';
import type { LeaveBoardQuery, LeaveWorkflowTrailQueryQuery } from '../../../api/graphql/graphql';

interface LeaveWorkflowTrailModalProps {
  employeeLabel: (employeeId: string) => string;
  isOpen: boolean;
  leaveTypeNameById: Map<string, string>;
  loading: boolean;
  rows: LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
  summaryRow: LeaveBoardQuery['leaveRequests'][number] | null;
  onClose: () => void;
}

const LeaveWorkflowTrailModal = ({
  employeeLabel,
  isOpen,
  leaveTypeNameById,
  loading,
  rows,
  summaryRow,
  onClose,
}: LeaveWorkflowTrailModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Leave Request History" size="lg">
    {summaryRow && (
      <div className="mb-4 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">
          {employeeLabel(summaryRow.employeeId)} - {leaveTypeNameById.get(summaryRow.leaveTypeId) ?? 'Leave'}
        </p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {formatDisplayDate(summaryRow.fromDate)} to {formatDisplayDate(summaryRow.toDate)} -{' '}
          {summaryRow.daysRequested} day(s) - <span className="capitalize">{summaryRow.status}</span>
        </p>
        {summaryRow.reason ? (
          <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Reason:</span> {summaryRow.reason}
          </p>
        ) : null}
        {summaryRow.rejectionReason ? (
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            <span className="font-semibold">Rejection:</span> {summaryRow.rejectionReason}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {summaryRow.workflowInstanceId
            ? 'Workflow instance attached. Steps appear below when recorded.'
            : 'No Workflow Instance On This Request. Approval Is Still Enforced By The Server.'}
        </p>
      </div>
    )}
    {loading ? (
      <p className="text-sm text-gray-500">Loading Workflow Steps...</p>
    ) : rows.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Workflow Step Actions Recorded Yet.
      </p>
    ) : (
      <ul className="space-y-3 text-sm">
        {rows.map((step, index) => (
          <li
            key={`${step.actedAt}-${index}`}
            className="rounded border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="font-medium text-gray-900 dark:text-white">{step.workflowStepName}</div>
            <div className="text-xs text-gray-500">
              {step.action}
              {step.performedByUserId ? ` - user ${step.performedByUserId.slice(0, 8)}...` : ''}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {formatDisplayDateTime(step.actedAt)}
            </div>
            {step.remarks ? (
              <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">{step.remarks}</p>
            ) : null}
          </li>
        ))}
      </ul>
    )}
  </Modal>
);

export default LeaveWorkflowTrailModal;
