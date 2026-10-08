import { useContext } from 'react';

import Select from '../components/common/Select';

import { PageWorkspaceContext } from './pageWorkspaceContext';

const WorkspaceTaskSelector = () => {
  const workspace = useContext(PageWorkspaceContext);
  if (!workspace || workspace.tasks.length < 2) return null;
  return (
    <Select
      aria-label="Workspace task"
      value={workspace.activePath}
      onChange={(event) => workspace.select(event.target.value)}
      options={workspace.tasks.map((task) => ({ value: task.path, label: task.label }))}
      className="max-w-full sm:w-52"
    />
  );
};
export default WorkspaceTaskSelector;
