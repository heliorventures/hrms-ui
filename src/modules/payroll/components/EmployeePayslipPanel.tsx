import type { GraphQLClient } from 'graphql-request';

import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import type { usePayrollPayData } from '../hooks/usePayrollPayData';
import { usePayslipPresentation } from '../hooks/usePayslipPresentation';
import { usePayslipUnpaidLeave } from '../hooks/usePayslipUnpaidLeave';

import PayrollPayslipTab from './PayrollPayslipTab';

const EmployeePayslipPanel = ({
  client,
  ownerKey,
  pay,
}: {
  client: GraphQLClient;
  ownerKey: string;
  pay: ReturnType<typeof usePayrollPayData>;
}) => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const unpaidLeave = usePayslipUnpaidLeave(client, ownerKey, pay.activePayslip?.id ?? null);
  const presentation = usePayslipPresentation(client, ownerKey, pay.activePayslip?.id ?? null);
  return (
    <div data-tour-anchor="payroll.pay.payslip-period">
      <PayrollPayslipTab
        activePayslip={pay.activePayslip}
        presentation={presentation.data}
        presentationLoading={presentation.loading}
        presentationError={presentation.error}
        onRetryPresentation={presentation.retry}
        unpaidLeave={unpaidLeave.data}
        unpaidLeaveLoading={unpaidLeave.loading}
        unpaidLeaveError={unpaidLeave.error}
        onRetryUnpaidLeave={unpaidLeave.retry}
        employeeCode={user?.employeeId ?? ''}
        employeeName={user?.name ?? 'Employee'}
        labelForLine={pay.labelForLine}
        payslipBranding={pay.payslipBranding}
        payslipError={pay.payslipError}
        payslipLogoReadUrl={pay.payslipLogoReadUrl}
        payslipMigrationRequired={pay.payslipMigrationRequired}
        payslipPeriodOptions={pay.payslipPeriodOptions}
        payslips={pay.payslips}
        payslipsLoading={pay.payslipsLoading}
        selectedPeriodKey={pay.selectedPeriodKey}
        tenantId={currentTenant.id}
        tenantName={currentTenant.name}
        onSelectedPeriodChange={pay.setSelectedPeriodKey}
      />
    </div>
  );
};
export default EmployeePayslipPanel;
