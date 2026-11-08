import { useSearchParams } from 'react-router-dom';

import { authorizationStateKey } from '../../auth/permissionService';
import FeedbackToast from '../../components/common/FeedbackToast';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

import { useWorkflowData } from './useWorkflowData';
import { useWorkflowCreation, useWorkflowSteps } from './useWorkflowEditor';
import { AddWorkflowStepForm, CreateWorkflowForm } from './WorkflowForms';
import WorkflowRecords from './WorkflowRecords';
import { WORKFLOW_DOMAINS, parseWorkflowDomain, type WorkflowDomain } from './workflowSetup';

const WorkflowWorkspace = ({ domain }: { domain: WorkflowDomain }) => {
  const workspace = useWorkflowData(domain);
  const editor = useWorkflowSteps(workspace);
  const creation = useWorkflowCreation(domain, workspace, editor.setSWorkflowId);
  return (
    <div className="space-y-4">
      <PageHeader title={`${WORKFLOW_DOMAINS[domain].label} Approval Rules`} retainTitle />
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateWorkflowForm creation={creation} loading={workspace.loading} domain={domain} />
        <AddWorkflowStepForm editor={editor} workspace={workspace} />
      </div>
      {workspace.error && (
        <>
          <FeedbackToast variant={'error'} messageKey={workspace.error}>
            {workspace.error}
          </FeedbackToast>
        </>
      )}
      <div data-tour-anchor="workflows.records">
        <WorkflowRecords
          data={workspace.data}
          stepsData={workspace.stepsData}
          loading={workspace.loading}
          reorderBusyWfId={editor.reorderBusyWfId}
          delStepBusy={editor.delStepBusy}
          onReorderSteps={editor.onReorderSteps}
          onDeleteStep={editor.onDeleteStep}
        />
      </div>
    </div>
  );
};

const AdminWorkflowsPage = () => {
  const [params] = useSearchParams();
  const { currentTenant } = useTenant();
  const { clientSession } = useAuth();
  const domain = parseWorkflowDomain(params);
  if (!domain) return <FeedbackToast variant={'error'}>Invalid approval rules view.</FeedbackToast>;
  return (
    <WorkflowWorkspace
      key={`${domain}|${currentTenant.id}|${authorizationStateKey(clientSession)}`}
      domain={domain}
    />
  );
};

export default AdminWorkflowsPage;
