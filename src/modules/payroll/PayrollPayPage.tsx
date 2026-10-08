import { useMemo } from 'react';

import { PERMISSIONS } from '../../auth/permissions';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { usePageTabs } from '../../hooks/usePageTabs';

import EmployeePayslipPanel from './components/EmployeePayslipPanel';
import EmployeeTaxFormsPanel from './components/EmployeeTaxFormsPanel';
import EmployeeTaxProjection from './components/EmployeeTaxProjection';
import PayrollMigrationHint from './components/PayrollMigrationHint';
import PayrollPayTabs from './components/PayrollPayTabs';
import PayrollSalaryTab from './components/PayrollSalaryTab';
import { usePayrollPayData } from './hooks/usePayrollPayData';
import type { PayrollTabId } from './payrollTypes';

const PayrollPayPage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const ownerKey = authorizationStateKey(clientSession);
  const canReadPayroll = permissions.canScopedPermission(PERMISSIONS.payrollRead);
  const canReadTax = permissions.canScopedPermission(PERMISSIONS.taxRead);
  const canSubmitTax = permissions.canCapability('action.tax.submit');
  const tabs = [
    { id: 'salary', label: 'Salary' },
    { id: 'payslip', label: 'Payslips' },
    ...(canReadTax ? [{ id: 'incometax', label: 'Income tax' }] : []),
  ];
  const { tab, setTab: setActiveTab } = usePageTabs(tabs);
  const activeTab: PayrollTabId = tab === 'payslip' || tab === 'incometax' ? tab : 'salary';
  const pay = usePayrollPayData(client, activeTab, {
    canReadPayroll,
    canReadTax,
    canSubmitTax,
    ownerKey,
    tenantTimezone: currentTenant.timezone,
  });

  if (!canReadPayroll) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`My pay — ${tabs.find((item) => item.id === activeTab)?.label ?? 'Salary'}`}
        retainTitle
      />

      {pay.showMigrationHint && <PayrollMigrationHint tenantId={currentTenant.id} />}

      {activeTab === 'incometax' && pay.errorShell && !pay.showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{pay.errorShell}</p>
        </Card>
      )}
      <PayrollPayTabs activeTab={activeTab} canReadTax={canReadTax} onChange={setActiveTab} />

      {activeTab === 'salary' && (
        <div data-tour-anchor="payroll.pay.salary-preview">
          <PayrollSalaryTab
            preview={pay.salaryPreview}
            loading={pay.loadingSalary}
            error={pay.errorSalary}
          />
        </div>
      )}

      {activeTab === 'payslip' && (
        <EmployeePayslipPanel client={client} ownerKey={ownerKey} pay={pay} />
      )}

      {activeTab === 'incometax' && (
        <div data-tour-anchor="payroll.pay.income-tax-actions">
          <EmployeeTaxProjection
            key={ownerKey}
            client={client}
            ownerKey={ownerKey}
            fiscalYear={pay.taxFiscalYear}
            onFiscalYearChange={pay.setTaxFiscalYear}
          />
          <details className="mt-4 rounded-lg border border-line p-4">
            <summary className="cursor-pointer font-semibold">
              Declarations, proofs and recorded payslip totals
            </summary>
            <EmployeeTaxFormsPanel pay={pay} canSubmitTax={canSubmitTax} />
          </details>
        </div>
      )}
    </div>
  );
};

export default PayrollPayPage;
