import Card from '../../../components/common/Card';
import FlashToastBar from '../../../components/common/FlashToastBar';
import { useImportedLeaveHistory } from '../hooks/useImportedLeaveHistory';
import { usePersonalLeaveModel, type PersonalLeaveOptions } from '../hooks/usePersonalLeaveModel';

import CompOffPanel from './CompOffPanel';
import ImportedLeaveHistoryCard from './ImportedLeaveHistoryCard';
import LeaveBalancesCard from './LeaveBalancesCard';
import LeaveRecoveryNotice from './LeaveRecoveryNotice';
import PersonalLeaveDialogs from './PersonalLeaveDialogs';
import PersonalLeaveReferences from './PersonalLeaveReferences';
import PersonalLeaveRequests from './PersonalLeaveRequests';
import PersonalLeaveToolbar from './PersonalLeaveToolbar';

const PersonalLeaveContent = (options: PersonalLeaveOptions) => {
  const model = usePersonalLeaveModel(options);
  const history = useImportedLeaveHistory(options.client, options.balanceYear);
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
      <div data-tour-anchor="leave.balances">
        <LeaveBalancesCard
          balanceYear={balanceYear}
          importedHistory={history.data}
          balances={data?.leaveBalances ?? []}
          leaveTypes={data?.leaveTypes ?? []}
          leaveTypeNameById={leaveTypeNameById}
          loading={loading}
          yearChoices={yearChoices}
          onYearChange={(year) => {
            updateView({ page: '0', year: String(year) });
          }}
        />
      </div>
      <ImportedLeaveHistoryCard data={history.data} error={history.error} onRetry={history.retry} />
      <div data-tour-anchor="leave.comp-off-panel">
        <CompOffPanel canSubmit={canSubmitLeave} />
      </div>
      <div data-tour-anchor="leave.requests">
        <PersonalLeaveRequests model={model} />
      </div>
      <div data-tour-anchor="leave.holiday-summary">
        <PersonalLeaveReferences model={model} />
      </div>
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};
export default PersonalLeaveContent;
