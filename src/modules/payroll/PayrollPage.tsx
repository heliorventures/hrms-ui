import { useEffect, useMemo } from 'react';

import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Card from '../../components/common/Card';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { usePageTabs } from '../../hooks/usePageTabs';

import CompanyContributionRules from './components/CompanyContributionRules';
import CompanyPayslipComponents from './components/CompanyPayslipComponents';
import PayrollAdminNotice from './components/PayrollAdminNotice';
import PayrollArrearsCard from './components/PayrollArrearsCard';
import PayrollComplianceCard from './components/PayrollComplianceCard';
import PayrollExportsSection from './components/PayrollExportsSection';
import PayrollPeriodInputs from './components/PayrollPeriodInputs';
import PayrollRunsSection from './components/PayrollRunsSection';
import PayrollSalaryComponentsCard from './components/PayrollSalaryComponentsCard';
import UnpaidLeavePolicyCard from './components/UnpaidLeavePolicyCard';
import { usePayrollBoard } from './hooks/usePayrollBoard';
import { usePayrollBoardActions } from './hooks/usePayrollBoardActions';
import { usePayrollExports } from './hooks/usePayrollExports';

const PayrollPage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const ownerKey = authorizationStateKey(clientSession);
  const canManagePayroll = permissions.canCapability('action.payroll.manage');
  const canExportPayroll = permissions.canCapability('action.payroll.export');
  const board = usePayrollBoard(client, { enabled: canManagePayroll, ownerKey });
  const actions = usePayrollBoardActions({
    client,
    complianceForm: board.complianceForm,
    enabled: canManagePayroll,
    ownerKey,
    reload: board.loadData,
  });
  const payrollExports = usePayrollExports(client, { enabled: canExportPayroll, ownerKey });
  const { setLatestCyclePeriod } = payrollExports;

  useEffect(() => {
    setLatestCyclePeriod(board.data?.payrollCycles[0]);
  }, [board.data?.payrollCycles, setLatestCyclePeriod]);

  const tabs = [
    { id: 'runs', label: 'Payroll Runs' },
    { id: 'monthly-inputs', label: 'Monthly Inputs' },
    { id: 'contribution-rules', label: 'Contribution Rules' },
    { id: 'arrears', label: 'Arrears' },
    { id: 'compliance', label: 'Employer & Statutory Details' },
    { id: 'unpaid-leave', label: 'Unpaid Leave Rules' },
    { id: 'components', label: 'Salary Components' },
    ...(canExportPayroll ? [{ id: 'exports', label: 'Payroll Exports' }] : []),
  ];
  const { tab, setTab } = usePageTabs(tabs);
  if (!canManagePayroll) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="sr-only">Payroll</h1>
      </div>

      <div data-tour-anchor="payroll.process.sections">
        <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>
      <PayrollAdminNotice />

      {board.error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{board.error}</p>
        </Card>
      )}

      <PageTabPanel id="unpaid-leave" activeTab={tab}>
        <UnpaidLeavePolicyCard client={client} ownerKey={ownerKey} />
      </PageTabPanel>
      <PageTabPanel id="monthly-inputs" activeTab={tab}>
        <PayrollPeriodInputs key={ownerKey} client={client} />
      </PageTabPanel>
      <PageTabPanel id="contribution-rules" activeTab={tab}>
        <CompanyContributionRules key={ownerKey} client={client} />
      </PageTabPanel>
      <PageTabPanel id="compliance" activeTab={tab}>
        <PayrollComplianceCard
          form={board.complianceForm}
          loading={board.loading}
          busy={actions.complianceSaveBusy}
          error={actions.complianceSaveError}
          ok={actions.complianceSaveOk}
          onChange={board.setComplianceField}
          onSave={() => void actions.savePayrollCompliance()}
        />
      </PageTabPanel>
      <PageTabPanel id="arrears" activeTab={tab}>
        <PayrollArrearsCard
          arrears={board.data?.payrollArrears ?? []}
          form={actions.arrearForm}
          loading={board.loading}
          busy={actions.arrearBusy}
          error={actions.arrearError}
          ok={actions.arrearOk}
          onChange={actions.setArrearField}
          onCreate={() => void actions.createArrear()}
        />
      </PageTabPanel>
      <PageTabPanel id="components" activeTab={tab}>
        <CompanyPayslipComponents key={ownerKey} client={client} />
        <PayrollSalaryComponentsCard
          rows={board.data?.salaryComponents ?? []}
          loading={board.loading}
        />
      </PageTabPanel>
      <PageTabPanel id="runs" activeTab={tab}>
        <PayrollRunsSection board={board} actions={actions} />
      </PageTabPanel>
      {canExportPayroll ? (
        <PageTabPanel id="exports" activeTab={tab}>
          <PayrollExportsSection
            month={payrollExports.month}
            year={payrollExports.year}
            fyStartYear={payrollExports.fyStartYear}
            fyQuarter={payrollExports.fyQuarter}
            monthlyStatus={payrollExports.monthlyStatus}
            fyStatus={payrollExports.fyStatus}
            onMonthChange={payrollExports.setMonth}
            onYearChange={payrollExports.setYear}
            onFyStartYearChange={payrollExports.setFyStartYear}
            onFyQuarterChange={payrollExports.setFyQuarter}
            onMonthlyDownload={(key) => void payrollExports.downloadMonthly(key)}
            onFyDownload={(key) => void payrollExports.downloadFy(key)}
          />
        </PageTabPanel>
      ) : null}
    </div>
  );
};

export default PayrollPage;
