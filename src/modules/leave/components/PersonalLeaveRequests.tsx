import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import type { PersonalLeaveModel } from '../hooks/usePersonalLeaveModel';

import LeaveRequestsTableSection from './LeaveRequestsTableSection';

const PersonalLeaveRequests = ({ model }: { model: PersonalLeaveModel }) => {
  const {
    loading,
    cancelBusyId,
    leaveTypeNameById,
    requests,
    canSubmitLeave,
    viewerId,
    handleCancelOwn,
    openWorkflowTrail,
    leaveRequestCount,
    firstVisibleRequest,
    lastVisibleRequest,
    requestPage,
    updateView,
  } = model;
  return (
    <Card id="leave-requests-section" title="My Leave Requests">
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading Leave Requests...</p>
      ) : (
        <LeaveRequestsTableSection
          approveBusyId={null}
          cancelBusyId={cancelBusyId}
          emptyLabel="You have no leave requests for this year."
          hideEmployeeColumn
          leaveTypeNameById={leaveTypeNameById}
          rows={requests}
          showApprovalColumn={false}
          viewerId={canSubmitLeave ? viewerId : undefined}
          onCancelOwn={handleCancelOwn}
          onOpenTrail={openWorkflowTrail}
        />
      )}
      {!loading && leaveRequestCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-sm text-content-secondary">
            Showing {firstVisibleRequest}-{lastVisibleRequest} of {leaveRequestCount} leave requests
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => updateView({ page: String(Math.max(0, requestPage - 1)) })}
              disabled={requestPage === 0}
              aria-label="Previous leave requests"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateView({ page: String(requestPage + 1) })}
              disabled={lastVisibleRequest >= leaveRequestCount}
              aria-label="Next leave requests"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
export default PersonalLeaveRequests;
