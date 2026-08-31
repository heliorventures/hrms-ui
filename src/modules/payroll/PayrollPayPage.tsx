import { useEffect, useMemo, useState } from 'react';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { PERMISSIONS } from '../../auth/permissions';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import PayrollIncomeTaxTab from './components/PayrollIncomeTaxTab';
import PayrollMigrationHint from './components/PayrollMigrationHint';
import PayrollPayslipTab from './components/PayrollPayslipTab';
import PayrollPayTabs from './components/PayrollPayTabs';
import PayrollSalaryTab from './components/PayrollSalaryTab';
import { usePayrollPayData } from './hooks/usePayrollPayData';
import type { PayrollTabId } from './payrollTypes';

const PayrollPayPage = () => {
  const client = useGraphClient('client');
  const { clientSession, user } = useAuth();
  const { currentTenant } = useTenant();
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const ownerKey = authorizationStateKey(clientSession);
  const canReadPayroll = permissions.canScopedPermission(PERMISSIONS.payrollRead);
  const canReadTax = permissions.canScopedPermission(PERMISSIONS.taxRead);
  const canSubmitTax = permissions.canCapability('action.tax.submit');
  const [activeTab, setActiveTab] = useState<PayrollTabId>('salary');
  const pay = usePayrollPayData(client, activeTab, {
    canReadPayroll,
    canReadTax,
    canSubmitTax,
    employeeId: clientSession?.employeeId ?? user?.employeeId,
    ownerKey,
  });

  useEffect(() => {
    if (activeTab === 'incometax' && !canReadTax) setActiveTab('salary');
  }, [activeTab, canReadTax]);

  if (!canReadPayroll) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay</h1>

      {pay.showMigrationHint && <PayrollMigrationHint tenantId={currentTenant?.id} />}

      {activeTab === 'incometax' && pay.errorShell && !pay.showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{pay.errorShell}</p>
        </Card>
      )}
      <PayrollPayTabs activeTab={activeTab} canReadTax={canReadTax} onChange={setActiveTab} />

      {activeTab === 'salary' && (
        <PayrollSalaryTab
          preview={pay.salaryPreview}
          loading={pay.loadingSalary}
          error={pay.errorSalary}
        />
      )}

      {activeTab === 'payslip' && (
        <PayrollPayslipTab
          activePayslip={pay.activePayslip}
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
          selectedCycleId={pay.selectedCycleId}
          tenantId={currentTenant?.id}
          tenantName={currentTenant?.name ?? 'Organization'}
          onSelectedCycleChange={pay.setSelectedCycleId}
        />
      )}

      {activeTab === 'incometax' && (
        <PayrollIncomeTaxTab
          activeTaxConfig={pay.activeTaxConfig}
          activeTaxSlabs={pay.activeTaxSlabs}
          canSubmitTax={canSubmitTax}
          declDed={pay.declDed}
          declFy={pay.declFy}
          declGross={pay.declGross}
          declMsg={pay.declMsg}
          declRegime={pay.declRegime}
          declSubmitting={pay.declSubmitting}
          employeeTaxError={pay.employeeTaxError}
          loadingEmployeeTax={pay.loadingEmployeeTax}
          loadingShell={pay.loadingShell}
          payslipError={pay.payslipError}
          payslipIndiaFyTotals={pay.payslipIndiaFyTotals}
          payslipsLoading={pay.payslipsLoading}
          proofActual={pay.proofActual}
          proofBusy={pay.proofBusy}
          proofDeclared={pay.proofDeclared}
          proofFile={pay.proofFile}
          proofMsg={pay.proofMsg}
          proofSectionCode={pay.proofSectionCode}
          taxComputationsSelf={pay.taxComputationsSelf}
          taxProofLinesSelf={pay.taxProofLinesSelf}
          taxSectionCatalog={pay.taxSectionCatalog}
          onDeclDedChange={pay.setDeclDed}
          onDeclFyChange={pay.setDeclFy}
          onDeclGrossChange={pay.setDeclGross}
          onDeclRegimeChange={pay.setDeclRegime}
          onDeclSubmit={pay.handleDeclUpsert}
          onProofActualChange={pay.setProofActual}
          onProofDeclaredChange={pay.setProofDeclared}
          onProofFileChange={pay.setProofFile}
          onProofSectionCodeChange={pay.setProofSectionCode}
          onProofSubmit={pay.handleProofSubmit}
        />
      )}
    </div>
  );
};

export default PayrollPayPage;
