import type { PersonalLeaveModel } from '../hooks/usePersonalLeaveModel';

import AllHolidaysModal from './AllHolidaysModal';
import ApplyLeaveModal from './ApplyLeaveModal';
import LeaveRejectModal from './LeaveRejectModal';
import LeaveWorkflowTrailModal from './LeaveWorkflowTrailModal';

const PersonalLeaveDialogs = ({ model }: { model: PersonalLeaveModel }) => {
  const {
    canSubmitLeave,
    canApproveLeave,
    applyOpen,
    data,
    setApplyOpen,
    refreshBoard,
    rejectLeaveTarget,
    setRejectLeaveTarget,
    onRejected,
    workflowTrail,
    allHolidays,
    employeeLabel,
    leaveTypeNameById,
  } = model;
  return (
    <>
      {canSubmitLeave ? (
        <ApplyLeaveModal
          isOpen={applyOpen}
          leaveBalances={data?.leaveBalances ?? []}
          leavePolicies={data?.leavePolicies ?? []}
          leaveTypes={data?.leaveTypes ?? []}
          upcomingHolidays={data?.upcomingHolidays ?? []}
          onClose={() => setApplyOpen(false)}
          onSubmitted={() => {
            void refreshBoard();
          }}
        />
      ) : null}
      {canApproveLeave ? (
        <LeaveRejectModal
          isOpen={rejectLeaveTarget !== null}
          leaveRequestId={rejectLeaveTarget?.leaveRequestId ?? null}
          expectedWorkflowStepId={rejectLeaveTarget?.expectedWorkflowStepId ?? null}
          onClose={() => setRejectLeaveTarget(null)}
          onRejected={onRejected}
        />
      ) : null}
      <LeaveWorkflowTrailModal
        employeeLabel={employeeLabel}
        isOpen={workflowTrail.summaryRow !== null}
        leaveTypeNameById={leaveTypeNameById}
        loading={workflowTrail.loading}
        rows={workflowTrail.rows}
        summaryRow={workflowTrail.summaryRow}
        onClose={workflowTrail.close}
      />
      <AllHolidaysModal
        holidays={allHolidays.rows}
        failure={allHolidays.failure}
        isOpen={allHolidays.isOpen}
        loading={allHolidays.loading}
        onClose={allHolidays.close}
        onRetry={() => void allHolidays.retry()}
      />
    </>
  );
};
export default PersonalLeaveDialogs;
