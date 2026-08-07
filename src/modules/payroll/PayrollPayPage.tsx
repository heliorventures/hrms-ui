import { useState } from 'react';
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
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<PayrollTabId>('salary');
  const pay = usePayrollPayData(client, activeTab);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay</h1>

      {pay.showMigrationHint && <PayrollMigrationHint tenantId={currentTenant?.id} />}

      {pay.errorShell && !pay.showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{pay.errorShell}</p>
        </Card>
      )}
      {pay.errorSalary && !pay.showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{pay.errorSalary}</p>
        </Card>
      )}

      <PayrollPayTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'salary' && (
        <PayrollSalaryTab
          salaryComponents={pay.salaryComponents}
          payrollCycles={pay.payrollCycles}
          loadingSalary={pay.loadingSalary}
          loadingShell={pay.loadingShell}
          errorSalary={pay.errorSalary}
        />
      )}

      {activeTab === 'payslip' && (
        <PayrollPayslipTab
          activePayslip={pay.activePayslip}
          cycleById={pay.cycleById}
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
          onProofSectionCodeChange={pay.setProofSectionCode}
          onProofSubmit={pay.handleProofSubmit}
        />
      )}
    </div>
  );
};

export default PayrollPayPage;
