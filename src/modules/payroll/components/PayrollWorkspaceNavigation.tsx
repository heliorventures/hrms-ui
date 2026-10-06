import { Link } from 'react-router-dom';

import Select from '../../../components/common/Select';
import { TAB_LIST_CLASS, tabClassName } from '../../../components/common/tabStyles';
import type { usePayrollWorkspace } from '../hooks/usePayrollWorkspace';

const PayrollWorkspaceNavigation = ({
  state,
}: {
  state: ReturnType<typeof usePayrollWorkspace>;
}) => (
  <div data-tour-anchor="payroll.process.sections" className="space-y-3">
    <nav aria-label="Payroll workspaces" className={TAB_LIST_CLASS}>
      {state.workspaces.map((item) => (
        <Link
          key={item.id}
          to={state.taskUrl(state.tasks.find((task) => task.workspace === item.id)?.id ?? 'runs')}
          preventScrollReset
          aria-current={state.workspace.id === item.id ? 'page' : undefined}
          className={tabClassName(state.workspace.id === item.id)}
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
    <Select
      aria-label="Payroll section"
      value={state.task.id}
      onChange={(event) => state.setTask(event.target.value)}
      options={state.visibleTasks.map((task) => ({ value: task.id, label: task.label }))}
      className="max-w-full sm:w-60"
    />
  ) : null;
export default PayrollWorkspaceNavigation;
