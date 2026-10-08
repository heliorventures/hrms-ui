import { useSearchParams } from 'react-router-dom';

import { PAYROLL_WORKSPACES, type PayrollWorkspaceTask } from '../payrollWorkspace';

export const usePayrollWorkspace = (tasks: PayrollWorkspaceTask[]) => {
  const [search, setSearch] = useSearchParams();
  const requestedTask = tasks.find((item) => item.id === search.get('tab'));
  const workspaces = PAYROLL_WORKSPACES.filter((item) =>
    tasks.some((task) => task.workspace === item.id)
  );
  const workspace =
    workspaces.find((item) => item.id === search.get('section')) ??
    workspaces.find((item) => item.id === requestedTask?.workspace) ??
    workspaces[0];
  const visibleTasks = tasks.filter((item) => item.workspace === workspace.id);
  const task = visibleTasks.find((item) => item.id === requestedTask?.id) ?? visibleTasks[0];
  const taskUrl = (id: string) => {
    const destination = tasks.find((item) => item.id === id);
    const next = new URLSearchParams(search);
    if (destination) {
      next.set('section', destination.workspace);
      next.set('tab', id);
    }
    return `/payroll/pay?${next.toString()}`;
  };
  const setTask = (id: string) => {
    if (!visibleTasks.some((item) => item.id === id)) return;
    const next = new URLSearchParams(search);
    next.set('section', workspace.id);
    next.set('tab', id);
    setSearch(next, { preventScrollReset: true });
  };
  return { workspace, task, tasks, visibleTasks, workspaces, taskUrl, setTask };
};
