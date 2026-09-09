import { useState, type FormEvent } from 'react';

import {
  AdminCreateWorkflowDocument,
  AdminCreateWorkflowStepDocument,
  AdminDeleteWorkflowStepDocument,
  AdminReorderWorkflowStepsDocument,
} from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import type { useWorkflowData } from './useWorkflowData';
import {
  workflowTypesForDomain,
  workflowBelongsToDomain,
  workflowType,
  type WorkflowDomain,
} from './workflowSetup';

type WorkspaceData = ReturnType<typeof useWorkflowData>;

export function useWorkflowCreation(
  domain: WorkflowDomain,
  { client, data, refresh }: WorkspaceData,
  setSWorkflowId: (id: string) => void
) {
  const workflowTypes = workflowTypesForDomain(domain);
  const [wName, setWName] = useState(`${workflowTypes[0].label} Approval`);
  const [wEntity, setWEntity] = useState<string>(workflowTypes[0].value);
  const [firstApprover, setFirstApprover] = useState('PERMISSION');
  const [wBusy, setWBusy] = useState(false);
  const [wMsg, setWMsg] = useState<string | null>(null);
  const hasWorkflow = data?.workflows.some(
    (workflow) => workflow.entityType === wEntity && workflow.isActive
  );

  const onCreateWorkflow = async (e: FormEvent) => {
    e.preventDefault();
    if (!workflowBelongsToDomain(wEntity, domain)) return;
    if (!wName.trim()) {
      setWMsg('Name is required');
      return;
    }
    setWMsg(null);
    setWBusy(true);
    try {
      const created = await client.request(AdminCreateWorkflowDocument, {
        input: {
          name: wName.trim(),
          entityType: wEntity,
          isActive: true,
          initialApproverType: firstApprover,
        },
      });
      setSWorkflowId(created.createWorkflow.id);
      await refresh();
      setWMsg('Workflow ready. Its first approval step has been added.');
    } catch (err) {
      setWMsg(graphQlUserMessage(err));
    } finally {
      setWBusy(false);
    }
  };

  return {
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
  };
}

export function useWorkflowSteps({ client, data, stepsData, refresh }: WorkspaceData) {
  const [sWorkflowId, setSWorkflowId] = useState('');
  const [sName, setSName] = useState('Approve');
  const [sApprover, setSApprover] = useState('PERMISSION');
  const [sSla, setSSla] = useState<number | null>(48);
  const [sBusy, setSBusy] = useState(false);
  const [sMsg, setSMsg] = useState<string | null>(null);
  const [delStepBusy, setDelStepBusy] = useState<string | null>(null);
  const [reorderBusyWfId, setReorderBusyWfId] = useState<string | null>(null);

  const selectedWorkflow = data?.workflows.find((workflow) => workflow.id === sWorkflowId);
  const selectedSteps =
    stepsData?.workflowsWithSteps.find((row) => row.workflow.id === sWorkflowId)?.steps ?? [];
  const nextOrder = Math.max(0, ...selectedSteps.map((step) => step.sequenceOrder)) + 1;
  const onDeleteStep = async (stepId: string) => {
    if (!stepsData?.workflowsWithSteps.some((row) => row.steps.some((step) => step.id === stepId)))
      return;
    setDelStepBusy(stepId);
    setSMsg(null);
    try {
      await client.request(AdminDeleteWorkflowStepDocument, { stepId: stepId.trim() });
      await refresh();
      setSMsg('Step removed.');
    } catch (err) {
      setSMsg(graphQlUserMessage(err));
    } finally {
      setDelStepBusy(null);
    }
  };

  const onReorderSteps = async (workflowId: string, orderedStepIds: string[]) => {
    const row = stepsData?.workflowsWithSteps.find(
      (workflow) => workflow.workflow.id === workflowId
    );
    if (
      !row ||
      !orderedStepIds.length ||
      orderedStepIds.length !== row.steps.length ||
      new Set(orderedStepIds).size !== orderedStepIds.length ||
      orderedStepIds.some((id) => !row.steps.some((step) => step.id === id))
    )
      return;
    setReorderBusyWfId(workflowId);
    setSMsg(null);
    try {
      await client.request(AdminReorderWorkflowStepsDocument, {
        workflowId,
        stepIdsOrdered: orderedStepIds,
      });
      await refresh();
      setSMsg('Steps reordered.');
    } catch (err) {
      setSMsg(graphQlUserMessage(err));
      throw err;
    } finally {
      setReorderBusyWfId(null);
    }
  };

  const onCreateStep = async (e: FormEvent) => {
    e.preventDefault();
    const selectedType = selectedWorkflow && workflowType(selectedWorkflow.entityType);
    if (!selectedWorkflow || !selectedType || !sName.trim() || !stepsData) {
      setSMsg(
        'Select a workflow and enter a step name. Reload the page if steps could not be loaded.'
      );
      return;
    }
    setSMsg(null);
    setSBusy(true);
    try {
      await client.request(AdminCreateWorkflowStepDocument, {
        input: {
          workflowId: sWorkflowId.trim(),
          sequenceOrder: nextOrder,
          stepName: sName.trim(),
          approverType: sApprover,
          approverPermission: selectedType.permission,
          approverRoleId: null,
          canSkip: false,
          slaHours: sSla !== null && sSla > 0 ? sSla : null,
        },
      });
      await refresh();
      setSMsg('Step created.');
    } catch (err) {
      setSMsg(graphQlUserMessage(err));
    } finally {
      setSBusy(false);
    }
  };

  return {
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
    delStepBusy,
    reorderBusyWfId,
    selectedWorkflow,
    nextOrder,
    onDeleteStep,
    onReorderSteps,
    onCreateStep,
  };
}
