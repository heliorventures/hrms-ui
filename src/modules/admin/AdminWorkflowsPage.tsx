import { FormEvent, useCallback, useEffect, useState } from 'react';
import Select from '../../components/common/Select';
import { WORKFLOW_TYPES, APPROVER_CHOICES, workflowType } from './workflowSetup';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  AdminWorkflowsDataDocument,
  AdminWorkflowsStepsDataDocument,
  AdminCreateWorkflowDocument,
  AdminCreateWorkflowStepDocument,
  AdminDeleteWorkflowStepDocument,
  AdminReorderWorkflowStepsDocument,
  type AdminWorkflowsDataQuery,
  type AdminWorkflowsStepsDataQuery,
} from '../../api/graphql/graphql';
import WorkflowDesignerSteps from './WorkflowDesignerSteps';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

const AdminWorkflowsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<AdminWorkflowsDataQuery | null>(null);
  const [stepsData, setStepsData] = useState<AdminWorkflowsStepsDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wName, setWName] = useState('Leave Approval');
  const [wEntity, setWEntity] = useState('LEAVE_REQUEST');
  const [firstApprover, setFirstApprover] = useState('PERMISSION');
  const [wBusy, setWBusy] = useState(false);
  const [wMsg, setWMsg] = useState<string | null>(null);
  const [sWorkflowId, setSWorkflowId] = useState('');
  const [sName, setSName] = useState('Approve');
  const [sApprover, setSApprover] = useState('PERMISSION');
  const [sSla, setSSla] = useState<number | null>(48);
  const [sBusy, setSBusy] = useState(false);
  const [sMsg, setSMsg] = useState<string | null>(null);
  const [delStepBusy, setDelStepBusy] = useState<string | null>(null);
  const [reorderBusyWfId, setReorderBusyWfId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const base = await client.request<AdminWorkflowsDataQuery>(AdminWorkflowsDataDocument, {
      wl: 30,
      il: 50,
    });
    try {
      const withSteps = await client.request<AdminWorkflowsStepsDataQuery>(
        AdminWorkflowsStepsDataDocument,
        { wl: 30 }
      );
      return { base, withSteps };
    } catch {
      return { base, withSteps: null as AdminWorkflowsStepsDataQuery | null };
    }
  }, [client]);

  const refresh = useCallback(async () => {
    const r = await load();
    setData(r.base);
    setStepsData(r.withSteps);
  }, [load]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (c) return;
        setData(r.base);
        setStepsData(r.withSteps);
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const selectedWorkflow = data?.workflows.find((workflow) => workflow.id === sWorkflowId);
  const selectedSteps =
    stepsData?.workflowsWithSteps.find((row) => row.workflow.id === sWorkflowId)?.steps ?? [];
  const nextOrder = Math.max(0, ...selectedSteps.map((step) => step.sequenceOrder)) + 1;
  const hasWorkflow = data?.workflows.some(
    (workflow) => workflow.entityType === wEntity && workflow.isActive
  );

  const onCreateWorkflow = async (e: FormEvent) => {
    e.preventDefault();
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
          entityType: wEntity.trim() || 'LEAVE_REQUEST',
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

  const onDeleteStep = async (stepId: string) => {
    if (!stepId.trim()) return;
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
    if (!orderedStepIds.length) return;
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
    if (
      !selectedWorkflow ||
      !workflowType(selectedWorkflow.entityType) ||
      !sName.trim() ||
      !stepsData
    ) {
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
          approverPermission: workflowType(selectedWorkflow!.entityType)!.permission,
          approverRoleId: null,
          canSkip: false,
          slaHours: sSla != null && sSla > 0 ? sSla : null,
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

  return (
    <div className="space-y-4">
      <PageHeader title="Workflows" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create Workflow">
          <form onSubmit={onCreateWorkflow} className="space-y-3">
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
              options={WORKFLOW_TYPES}
              value={wEntity}
              onChange={(event) => {
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
              Eligible approvers have approval access for this request type. Assign that access in
              Roles &amp; Permissions. Reporting-manager steps also require a manager to be assigned
              to the employee.
            </p>
            {hasWorkflow && (
              <p role="status" className="text-sm text-content-secondary">
                Already configured. Select the existing workflow under Add Step to manage it.
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={wBusy || loading || Boolean(hasWorkflow)}
            >
              {wBusy ? 'Creating...' : 'Create Approval Workflow'}
            </Button>
          </form>
        </Card>
        <Card title="Add Step">
          <form onSubmit={onCreateStep} className="space-y-3">
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
            <Button
              type="submit"
              variant="primary"
              disabled={sBusy || !selectedWorkflow || !stepsData}
            >
              {sBusy ? 'Saving...' : 'Add Step'}
            </Button>
          </form>
        </Card>
      </div>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Definitions & Steps">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : stepsData?.workflowsWithSteps && stepsData.workflowsWithSteps.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {stepsData.workflowsWithSteps.map((row) => (
              <li key={row.workflow.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{row.workflow.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {workflowType(row.workflow.entityType)?.label ?? 'Needs setup review'} ·{' '}
                  {row.workflow.isActive ? 'active' : 'inactive'}
                </p>
                {row.steps?.length > 0 ? (
                  <WorkflowDesignerSteps
                    workflowId={row.workflow.id}
                    steps={row.steps}
                    onReorder={onReorderSteps}
                    reorderBusy={reorderBusyWfId === row.workflow.id}
                    delStepBusy={delStepBusy}
                    onDeleteStep={onDeleteStep}
                  />
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Not ready: select this workflow above and add its first approval step.
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : data?.workflows && data.workflows.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {data.workflows.map((w) => (
              <li key={w.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{w.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {workflowType(w.entityType)?.label ?? 'Needs setup review'} ·{' '}
                  {w.isActive ? 'active' : 'inactive'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Approval steps could not be loaded. Reload this page before making changes.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No approval workflows yet. Start by choosing Leave or Expenses above.
          </p>
        )}
      </Card>
      <Card title="Approval requests">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.workflowInstances?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="rounded-tl-md py-2.5 pl-2 pr-3">Request type</th>
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="rounded-tr-md py-2.5 pr-2">Workflow</th>
                </tr>
              </thead>
              <tbody>
                {data.workflowInstances.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-700/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2.5 pl-2 pr-3 text-slate-800 dark:text-slate-200">
                      {workflowType(i.entityType)?.label ?? 'Needs setup review'}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200">{i.status}</td>
                    <td className="py-2.5 pr-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {data.workflows.find((workflow) => workflow.id === i.workflowId)?.name ??
                        'Workflow unavailable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No approval requests yet.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminWorkflowsPage;
