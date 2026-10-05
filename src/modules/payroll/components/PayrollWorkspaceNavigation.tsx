import { Link } from 'react-router-dom';

import Tabs from '../../../components/common/Tabs';
import type { usePayrollWorkspace } from '../hooks/usePayrollWorkspace';

const PayrollWorkspaceNavigation = ({
  state,
}: {
  state: ReturnType<typeof usePayrollWorkspace>;
}) => (
  <div data-tour-anchor="payroll.process.sections" className="space-y-3">
    <nav aria-label="Payroll workspaces" className="flex flex-wrap gap-2 border-b border-line pb-3">
      {state.workspaces.map((item) => (
        <Link
          key={item.id}
          to={state.taskUrl(state.tasks.find((task) => task.workspace === item.id)?.id ?? 'runs')}
          preventScrollReset
          aria-current={state.workspace.id === item.id ? 'page' : undefined}
          className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${state.workspace.id === item.id ? 'bg-indigo-600 text-white' : 'text-content-secondary hover:bg-surface-raised'}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  </div>
);
export const PayrollWorkspaceTaskMenu = ({
  state,
}: {
  state: ReturnType<typeof usePayrollWorkspace>;
}) =>
  state.visibleTasks.length > 1 ? (
    <Tabs
      orientation="vertical"
      value={state.task.id}
      onValueChange={state.setTask}
      tabs={state.visibleTasks.map((task) => ({ ...task, panelId: `page-feature-${task.id}` }))}
    />
  ) : null;
export default PayrollWorkspaceNavigation;
