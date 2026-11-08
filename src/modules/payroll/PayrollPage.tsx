import { useEffect, useMemo } from 'react';

import { PERMISSIONS } from '../../auth/permissions';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import FeedbackToast from '../../components/common/FeedbackToast';
import PageHeader from '../../components/common/PageHeader';
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
    complianceReady: board.complianceReady,
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
      <PageHeader
        title={workspace.workspace.label}
        retainTitle
        description="Salary and payroll settings carry forward. Monthly adjustments are for exceptions only."
        actions={<PayrollWorkspaceTaskMenu state={workspace} />}
      />
      <PayrollWorkspaceNavigation state={workspace} />
      {board.error && (
        <>
          <FeedbackToast variant={'error'} messageKey={board.error}>
            {board.error}
          </FeedbackToast>
        </>
      )}
      <div className="space-y-2">
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
