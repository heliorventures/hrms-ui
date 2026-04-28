import { FormEvent, useCallback, useEffect, useState } from 'react';
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

const AdminWorkflowsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<AdminWorkflowsDataQuery | null>(null);
  const [stepsData, setStepsData] = useState<AdminWorkflowsStepsDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wName, setWName] = useState('');
  const [wEntity, setWEntity] = useState('LEAVE_REQUEST');
  const [wActive, setWActive] = useState(true);
  const [wBusy, setWBusy] = useState(false);
  const [wMsg, setWMsg] = useState<string | null>(null);
  const [sWorkflowId, setSWorkflowId] = useState('');
  const [sOrder, setSOrder] = useState(1);
  const [sName, setSName] = useState('Approve');
  const [sApprover, setSApprover] = useState('MANAGER');
  const [sSla, setSSla] = useState<number | null>(48);
  const [sSkip, setSSkip] = useState(false);
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
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load workflows');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const onCreateWorkflow = async (e: FormEvent) => {
    e.preventDefault();
    if (!wName.trim()) {
      setWMsg('Name is required');
      return;
    }
    setWMsg(null);
    setWBusy(true);
    try {
      await client.request(AdminCreateWorkflowDocument, {
        input: {
          name: wName.trim(),
          entityType: wEntity.trim() || 'LEAVE_REQUEST',
          isActive: wActive,
        },
      });
      setWName('');
      await refresh();
      setWMsg('Workflow created.');
    } catch (err) {
      setWMsg(err instanceof Error ? err.message : 'Create failed');
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
      setSMsg(err instanceof Error ? err.message : 'Delete failed');
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
      setSMsg(err instanceof Error ? err.message : 'Reorder failed');
      throw err;
    } finally {
      setReorderBusyWfId(null);
    }
  };

  const onCreateStep = async (e: FormEvent) => {
    e.preventDefault();
    if (!sWorkflowId.trim() || !sName.trim()) {
      setSMsg('Workflow id and step name are required');
      return;
    }
    setSMsg(null);
    setSBusy(true);
    try {
      await client.request(AdminCreateWorkflowStepDocument, {
        input: {
          workflowId: sWorkflowId.trim(),
          sequenceOrder: sOrder,
          stepName: sName.trim(),
          approverType: sApprover.trim() || null,
          approverRoleId: null,
          canSkip: sSkip,
          slaHours: sSla != null && sSla > 0 ? sSla : null,
        },
      });
      await refresh();
      setSMsg('Step created.');
    } catch (err) {
      setSMsg(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Definitions, steps, and in-flight instances. Create definitions and drag steps to reorder (requires HR / tenant admin or workflow:manage). Leave workflows use entity type LEAVE_REQUEST; runtime still lives in kabipay-leave."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create workflow">
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
            <Input
              label="Entity type"
              value={wEntity}
              onChange={(e) => setWEntity(e.target.value)}
              fullWidth
              placeholder="e.g. LEAVE_REQUEST"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={wActive}
                onChange={(e) => setWActive(e.target.checked)}
              />
              Active
            </label>
            <Button type="submit" variant="primary" disabled={wBusy}>
              {wBusy ? 'Creating…' : 'Create workflow'}
            </Button>
          </form>
        </Card>
        <Card title="Add step">
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
            <Input
              label="Workflow id (UUID)"
              value={sWorkflowId}
              onChange={(e) => setSWorkflowId(e.target.value)}
              fullWidth
              required
              className="font-mono text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sequence"
                type="number"
                value={String(sOrder)}
                onChange={(e) => setSOrder(parseInt(e.target.value, 10) || 1)}
                fullWidth
                min={1}
              />
              <Input
                label="SLA (hours, optional)"
                type="number"
                value={sSla == null ? '' : String(sSla)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') setSSla(null);
                  else {
                    const n = parseInt(v, 10);
                    setSSla(Number.isFinite(n) ? n : null);
                  }
                }}
                fullWidth
              />
            </div>
            <Input
              label="Step name"
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              fullWidth
              required
            />
            <Input
              label="Approver type"
              value={sApprover}
              onChange={(e) => setSApprover(e.target.value)}
              fullWidth
              placeholder="e.g. MANAGER, HR"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={sSkip} onChange={(e) => setSSkip(e.target.checked)} />
              Can skip
            </label>
            <Button type="submit" variant="primary" disabled={sBusy}>
              {sBusy ? 'Saving…' : 'Add step'}
            </Button>
          </form>
        </Card>
      </div>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Definitions & steps">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : stepsData?.workflowsWithSteps && stepsData.workflowsWithSteps.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {stepsData.workflowsWithSteps.map((row) => (
              <li key={row.workflow.id} className="py-3 first:pt-0">
                <p className="font-medium text-slate-900 dark:text-white">{row.workflow.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {row.workflow.entityType ?? '—'} · {row.workflow.isActive ? 'active' : 'inactive'}
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
                  <p className="mt-1 text-xs text-slate-500">No steps in graph.</p>
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
                  {w.entityType ?? '—'} · {w.isActive ? 'active' : 'inactive'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Step list requires a gateway with{' '}
                  <span className="font-mono">workflowsWithSteps</span> from kabipay-workflow.
                  Restart the gateway / subgraph after upgrade.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No workflows.</p>
        )}
      </Card>
      <Card title="Instances">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data?.workflowInstances?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="rounded-tl-md py-2.5 pl-2 pr-3">Entity</th>
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="rounded-tr-md py-2.5 pr-2">Entity id</th>
                </tr>
              </thead>
              <tbody>
                {data.workflowInstances.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-700/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2.5 pl-2 pr-3 text-slate-800 dark:text-slate-200">
                      {i.entityType ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200">{i.status}</td>
                    <td className="py-2.5 pr-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {i.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No instances.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminWorkflowsPage;
