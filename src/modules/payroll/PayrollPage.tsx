import { useEffect, useMemo } from 'react';

import { PERMISSIONS } from '../../auth/permissions';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';

import PayrollWorkspaceNavigation, {
  PayrollWorkspaceTaskMenu,
} from './components/PayrollWorkspaceNavigation';
import PayrollWorkspacePanels from './components/PayrollWorkspacePanels';
import { usePayrollBoard } from './hooks/usePayrollBoard';
import { usePayrollBoardActions } from './hooks/usePayrollBoardActions';
import { usePayrollExports } from './hooks/usePayrollExports';
import { usePayrollWorkspace } from './hooks/usePayrollWorkspace';
import { payrollWorkspaceTasks } from './payrollWorkspace';

const PayrollPage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const ownerKey = authorizationStateKey(clientSession);
  const canManagePayroll = permissions.canCapability('action.payroll.manage');
  const canExportPayroll = permissions.canCapability('action.payroll.export');
  const canReadAllPayslips = permissions.canScopedPermission(PERMISSIONS.payrollRead, ['ALL']);
  const board = usePayrollBoard(client, { enabled: canManagePayroll, ownerKey });
  const actions = usePayrollBoardActions({
    client,
    complianceForm: board.complianceForm,
    enabled: canManagePayroll,
    ownerKey,
    reload: board.loadData,
  });
  const payrollExports = usePayrollExports(client, {
    enabled: canExportPayroll && canManagePayroll,
    ownerKey,
  });
  const { setLatestCyclePeriod } = payrollExports;

  useEffect(() => {
    setLatestCyclePeriod(board.data?.payrollCycles[0]);
  }, [board.data?.payrollCycles, setLatestCyclePeriod]);

  const workspace = usePayrollWorkspace(
    payrollWorkspaceTasks(canReadAllPayslips, canExportPayroll)
  );
  if (!canManagePayroll) return null;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{workspace.workspace.label}</h1>
      <p className="text-sm text-content-secondary">
        Salary and payroll settings carry forward. Monthly adjustments are for exceptions only.
      </p>
      <PayrollWorkspaceNavigation state={workspace} />
      {board.error && (
        <Card>
          <p role="alert" className="text-sm text-danger">
            {board.error}
          </p>
        </Card>
      )}
      <div
        className={
          workspace.visibleTasks.length > 1
            ? 'grid items-start gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]'
            : ''
        }
      >
        <PayrollWorkspaceTaskMenu state={workspace} />
        <PayrollWorkspacePanels
          key={ownerKey}
          activeTask={workspace.task.id}
          tasks={workspace.tasks}
          ownerKey={ownerKey}
          client={client}
          board={board}
          actions={actions}
          exports={payrollExports}
        />
      </div>
    </div>
  );
};
export default PayrollPage;
