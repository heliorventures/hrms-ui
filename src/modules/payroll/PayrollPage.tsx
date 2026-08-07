import { useEffect } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import PayrollAdminNotice from './components/PayrollAdminNotice';
import PayrollArrearsCard from './components/PayrollArrearsCard';
import PayrollComplianceCard from './components/PayrollComplianceCard';
import PayrollCyclesCard from './components/PayrollCyclesCard';
import PayrollExportsSection from './components/PayrollExportsSection';
import PayrollSalaryComponentsCard from './components/PayrollSalaryComponentsCard';
import { usePayrollBoard } from './hooks/usePayrollBoard';
import { usePayrollBoardActions } from './hooks/usePayrollBoardActions';
import { usePayrollExports } from './hooks/usePayrollExports';

const PAYROLL_ADMIN_CAPABILITIES = ['employee:write', 'payroll:statutory_export'];

const PayrollPage = () => {
  const client = useGraphClient('client');
  const { canAny } = useAuth();
  const isPayrollAdmin = canAny(PAYROLL_ADMIN_CAPABILITIES);
  const board = usePayrollBoard(client);
  const actions = usePayrollBoardActions({
    client,
    complianceForm: board.complianceForm,
    reload: board.loadData,
  });
  const payrollExports = usePayrollExports(client);
  const { setLatestCyclePeriod } = payrollExports;

  useEffect(() => {
    setLatestCyclePeriod(board.data?.payrollCycles?.[0]);
  }, [board.data?.payrollCycles, setLatestCyclePeriod]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live salary components and payroll cycles from the payroll subgraph.
        </p>
      </div>

      {isPayrollAdmin && <PayrollAdminNotice />}

      {board.error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{board.error}</p>
        </Card>
      )}

      {isPayrollAdmin && (
        <>
          <PayrollComplianceCard
            form={board.complianceForm}
            loading={board.loading}
            busy={actions.complianceSaveBusy}
            error={actions.complianceSaveError}
            ok={actions.complianceSaveOk}
            onChange={board.setComplianceField}
            onSave={() => void actions.savePayrollCompliance()}
          />
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
          <PayrollSalaryComponentsCard
            rows={board.data?.salaryComponents ?? []}
            loading={board.loading}
          />
          <PayrollCyclesCard
            rows={board.data?.payrollCycles ?? []}
            form={actions.cycleForm}
            loading={board.loading}
            createBusy={actions.createBusy}
            createError={actions.createError}
            createOk={actions.createOk}
            runBusy={actions.runBusy}
            runError={actions.runError}
            runOk={actions.runOk}
            onChange={actions.setCycleField}
            onCreate={() => void actions.createCycle()}
            onRun={(payrollCycleId) => void actions.runPayroll(payrollCycleId)}
          />
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
        </>
      )}
    </div>
  );
};

export default PayrollPage;
