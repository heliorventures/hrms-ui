import type {
  AdminWorkflowsDataQuery,
  AdminWorkflowsStepsDataQuery,
} from '../../api/graphql/graphql';
import Card from '../../components/common/Card';

import WorkflowDesignerSteps from './WorkflowDesignerSteps';
import { workflowType } from './workflowSetup';

type Props = {
  data: AdminWorkflowsDataQuery | null;
  stepsData: AdminWorkflowsStepsDataQuery | null;
  loading: boolean;
  reorderBusyWfId: string | null;
  delStepBusy: string | null;
  onReorderSteps: (workflowId: string, ids: string[]) => Promise<void>;
  onDeleteStep: (stepId: string) => Promise<void>;
};

const Definitions = ({
  data,
  stepsData,
  loading,
  reorderBusyWfId,
  delStepBusy,
  onReorderSteps,
  onDeleteStep,
}: Props) => {
  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (stepsData && stepsData.workflowsWithSteps.length > 0)
    return (
      <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
        {stepsData.workflowsWithSteps.map((row) => (
          <li key={row.workflow.id} className="py-3 first:pt-0">
            <p className="font-medium text-slate-900 dark:text-white">{row.workflow.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {workflowType(row.workflow.entityType)?.label ?? 'Needs setup review'} ·{' '}
              {row.workflow.isActive ? 'active' : 'inactive'}
            </p>
            {row.steps.length > 0 ? (
              <WorkflowDesignerSteps
                workflowId={row.workflow.id}
                steps={row.steps}
                onReorder={onReorderSteps}
                reorderBusy={reorderBusyWfId === row.workflow.id}
                delStepBusy={delStepBusy}
                onDeleteStep={(id) => {
                  void onDeleteStep(id);
                }}
              />
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Not ready: select this workflow above and add its first approval step.
              </p>
            )}
          </li>
        ))}
      </ul>
    );
  if (data && data.workflows.length > 0)
    return (
      <ul className="divide-y divide-slate-200 dark:divide-slate-700/80">
        {data.workflows.map((workflow) => (
          <li key={workflow.id} className="py-3 first:pt-0">
            <p className="font-medium text-slate-900 dark:text-white">{workflow.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {workflowType(workflow.entityType)?.label ?? 'Needs setup review'} ·{' '}
              {workflow.isActive ? 'active' : 'inactive'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Approval steps could not be loaded. Reload this page before making changes.
            </p>
          </li>
        ))}
      </ul>
    );
  return (
    <p className="text-sm text-gray-500">No matching approval workflows in the loaded records.</p>
  );
};

const ApprovalRequests = ({ data, loading }: Pick<Props, 'data' | 'loading'>) => {
  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!data || data.workflowInstances.length === 0)
    return (
      <p className="text-sm text-gray-500">No matching approval requests in the loaded records.</p>
    );
  return (
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
          {data.workflowInstances.map((instance) => (
            <tr
              key={instance.id}
              className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-700/80 dark:hover:bg-slate-800/40"
            >
              <td className="py-2.5 pl-2 pr-3 text-slate-800 dark:text-slate-200">
                {workflowType(instance.entityType)?.label ?? 'Needs setup review'}
              </td>
              <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200">{instance.status}</td>
              <td className="py-2.5 pr-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                {data.workflows.find((workflow) => workflow.id === instance.workflowId)?.name ??
                  'Workflow unavailable'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WorkflowRecords = (props: Props) => {
  return (
    <>
      <p className="text-sm text-content-secondary">
        Showing matching records from up to 30 workflows and 50 approval requests loaded across all
        functions.
      </p>
      <Card title="Definitions & Steps">
        <Definitions {...props} />
      </Card>
      <Card title="Approval requests">
        <ApprovalRequests data={props.data} loading={props.loading} />
      </Card>
    </>
  );
};

export default WorkflowRecords;
