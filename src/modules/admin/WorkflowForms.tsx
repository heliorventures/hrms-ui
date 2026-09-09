import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import type { useWorkflowData } from './useWorkflowData';
import type { useWorkflowCreation, useWorkflowSteps } from './useWorkflowEditor';
import {
  APPROVER_CHOICES,
  workflowType,
  workflowBelongsToDomain,
  type WorkflowDomain,
} from './workflowSetup';

export const CreateWorkflowForm = ({
  creation,
  loading,
  domain,
}: {
  creation: ReturnType<typeof useWorkflowCreation>;
  loading: boolean;
  domain: WorkflowDomain;
}) => {
  const {
    workflowTypes,
    wName,
    setWName,
    wEntity,
    setWEntity,
    firstApprover,
    setFirstApprover,
    wBusy,
    wMsg,
    setWMsg,
    hasWorkflow,
    onCreateWorkflow,
  } = creation;
  return (
    <Card title="Create Workflow">
      <form
        onSubmit={(event) => {
          void onCreateWorkflow(event);
        }}
        className="space-y-3"
      >
        {wMsg && (
          <p
            className={
              wMsg.startsWith('Workflow') ? 'text-sm text-emerald-600' : 'text-sm text-red-600'
            }
          >
            {wMsg}
          </p>
        )}
        <Input
          label="Name"
          value={wName}
          onChange={(e) => setWName(e.target.value)}
          fullWidth
          required
        />
        <Select
          label="Approval for"
          fullWidth
          options={workflowTypes}
          value={wEntity}
          onChange={(event) => {
            if (!workflowBelongsToDomain(event.target.value, domain)) return;
            setWEntity(event.target.value);
            setWName((workflowType(event.target.value)?.label ?? '') + ' Approval');
            setWMsg(null);
          }}
        />
        <p className="text-sm text-content-secondary">{workflowType(wEntity)?.description}</p>
        <Select
          label="First approver"
          fullWidth
          options={APPROVER_CHOICES}
          value={firstApprover}
          onChange={(event) => setFirstApprover(event.target.value)}
        />
        <p className="text-sm text-content-secondary">
          Eligible approvers have approval access for this request type. Assign that access in Roles
          &amp; Permissions. Reporting-manager steps also require a manager to be assigned to the
          employee.
        </p>
        {hasWorkflow && (
          <p role="status" className="text-sm text-content-secondary">
            Already configured. Select the existing workflow under Add Step to manage it.
          </p>
        )}
        <Button type="submit" variant="primary" disabled={wBusy || loading || Boolean(hasWorkflow)}>
          {wBusy ? 'Creating...' : 'Create Approval Workflow'}
        </Button>
      </form>
    </Card>
  );
};

export const AddWorkflowStepForm = ({
  editor,
  workspace,
}: {
  editor: ReturnType<typeof useWorkflowSteps>;
  workspace: ReturnType<typeof useWorkflowData>;
}) => {
  const {
    sWorkflowId,
    setSWorkflowId,
    sName,
    setSName,
    sApprover,
    setSApprover,
    sSla,
    setSSla,
    sBusy,
    sMsg,
    setSMsg,
    selectedWorkflow,
    nextOrder,
    onCreateStep,
  } = editor;
  const { data, stepsData } = workspace;
  return (
    <Card title="Add Step">
      <form
        onSubmit={(event) => {
          void onCreateStep(event);
        }}
        className="space-y-3"
      >
        {sMsg && (
          <p
            className={
              sMsg.startsWith('Step') ? 'text-sm text-emerald-600' : 'text-sm text-red-600'
            }
          >
            {sMsg}
          </p>
        )}
        <Select
          label="Workflow"
          value={sWorkflowId}
          fullWidth
          required
          options={[
            { value: '', label: 'Choose a workflow' },
            ...(data?.workflows ?? []).map((workflow) => ({
              value: workflow.id,
              label:
                workflow.name +
                ' (' +
                (workflowType(workflow.entityType)?.label ?? 'Needs review') +
                ')',
            })),
          ]}
          onChange={(event) => {
            setSWorkflowId(event.target.value);
            setSMsg(null);
          }}
        />
        <p className="text-sm text-content-secondary">
          {selectedWorkflow
            ? 'This will be approval step ' + nextOrder + '.'
            : 'Create an approval workflow first, or choose an existing one.'}
        </p>
        <Input
          label="Expected response time (hours)"
          type="number"
          min={1}
          fullWidth
          value={sSla ?? ''}
          onChange={(event) => setSSla(event.target.value ? Number(event.target.value) : null)}
        />
        <Input
          label="Step Name"
          value={sName}
          onChange={(e) => setSName(e.target.value)}
          fullWidth
          required
        />
        <Select
          label="Who approves this step?"
          fullWidth
          options={APPROVER_CHOICES}
          value={sApprover}
          onChange={(event) => setSApprover(event.target.value)}
        />
        <Button type="submit" variant="primary" disabled={sBusy || !selectedWorkflow || !stepsData}>
          {sBusy ? 'Saving...' : 'Add Step'}
        </Button>
      </form>
    </Card>
  );
};
