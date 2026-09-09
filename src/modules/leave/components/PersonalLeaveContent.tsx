import Card from '../../../components/common/Card';
import FlashToastBar from '../../../components/common/FlashToastBar';
import { usePersonalLeaveModel, type PersonalLeaveOptions } from '../hooks/usePersonalLeaveModel';

import CompOffPanel from './CompOffPanel';
import LeaveBalancesCard from './LeaveBalancesCard';
import LeaveRecoveryNotice from './LeaveRecoveryNotice';
import PersonalLeaveDialogs from './PersonalLeaveDialogs';
import PersonalLeaveReferences from './PersonalLeaveReferences';
import PersonalLeaveRequests from './PersonalLeaveRequests';
import PersonalLeaveToolbar from './PersonalLeaveToolbar';

const PersonalLeaveContent = (options: PersonalLeaveOptions) => {
  const model = usePersonalLeaveModel(options);
  const {
    activeFailure,
    retryBoard,
    retryWorkflowTrail,
    loading,
    workflowTrail,
    approveWorkflowNotice,
    balanceYear,
    data,
    leaveTypeNameById,
    yearChoices,
    updateView,
    canSubmitLeave,
    flash,
  } = model;
  return (
    <div className="space-y-4">
      <PersonalLeaveToolbar model={model} />
      <PersonalLeaveDialogs model={model} />
      {activeFailure && (
        <LeaveRecoveryNotice
          message={activeFailure.message}
          operation={activeFailure.operation}
          onRefreshBoard={retryBoard}
          onRetryWorkflowTrail={retryWorkflowTrail}
          refreshing={loading || workflowTrail.loading}
        />
      )}
      {approveWorkflowNotice && (
        <Card>
          <p className="text-sm text-sky-800 dark:text-sky-200">{approveWorkflowNotice}</p>
        </Card>
      )}
      <LeaveBalancesCard
        balanceYear={balanceYear}
        balances={data?.leaveBalances ?? []}
        leaveTypes={data?.leaveTypes ?? []}
        leaveTypeNameById={leaveTypeNameById}
        loading={loading}
        yearChoices={yearChoices}
        onYearChange={(year) => {
          updateView({ page: '0', year: String(year) });
        }}
      />
      <CompOffPanel canSubmit={canSubmitLeave} />
      <PersonalLeaveRequests model={model} />
      <PersonalLeaveReferences model={model} />
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};
export default PersonalLeaveContent;
