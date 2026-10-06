import { useEffect, useState } from 'react';

import { PageTabPanel } from '../../../components/common/PageTabs';
import type { usePayrollBoard } from '../hooks/usePayrollBoard';
import type { usePayrollBoardActions } from '../hooks/usePayrollBoardActions';
import type { usePayrollExports } from '../hooks/usePayrollExports';
import type { PayrollWorkspaceTask } from '../payrollWorkspace';

import CompanyContributionRules from './CompanyContributionRules';
import CompanyPayslipComponents from './CompanyPayslipComponents';
import EmployeePayrollSettings from './EmployeePayrollSettings';
import ManagedPayslips from './ManagedPayslips';
import PayrollAdminNotice from './PayrollAdminNotice';
import PayrollArrearsCard from './PayrollArrearsCard';
import PayrollComplianceCard from './PayrollComplianceCard';
import PayrollExportsSection from './PayrollExportsSection';
import PayrollLwpRules from './PayrollLwpRules';
import PayrollPeriodInputs from './PayrollPeriodInputs';
import PayrollRunsSection from './PayrollRunsSection';
import PayrollSalaryComponentsCard from './PayrollSalaryComponentsCard';

interface Props {
  activeTask: string;
  tasks: PayrollWorkspaceTask[];
  ownerKey: string;
  board: ReturnType<typeof usePayrollBoard>;
  actions: ReturnType<typeof usePayrollBoardActions>;
  exports: ReturnType<typeof usePayrollExports>;
  client: Parameters<typeof CompanyContributionRules>[0]['client'];
}
const ExportPanel = ({ exports: data }: Pick<Props, 'exports'>) => (
  <>
    <PayrollAdminNotice />
    <PayrollExportsSection
      month={data.month}
      year={data.year}
      fyStartYear={data.fyStartYear}
      fyQuarter={data.fyQuarter}
      monthlyStatus={data.monthlyStatus}
      fyStatus={data.fyStatus}
      onMonthChange={data.setMonth}
      onYearChange={data.setYear}
      onFyStartYearChange={data.setFyStartYear}
      onFyQuarterChange={data.setFyQuarter}
      onMonthlyDownload={(key) => void data.downloadMonthly(key)}
      onFyDownload={(key) => void data.downloadFy(key)}
    />
  </>
);
const PayrollWorkspacePanels = ({
  activeTask,
  tasks,
  ownerKey,
  board,
  actions,
  exports: data,
  client,
}: Props) => {
  const [visited, setVisited] = useState<string[]>([activeTask]);
  useEffect(() => {
    setVisited((prior) => (prior.includes(activeTask) ? prior : [...prior, activeTask]));
  }, [activeTask]);
  const panels = {
    runs: <PayrollRunsSection board={board} actions={actions} />,
    'monthly-inputs': <PayrollPeriodInputs client={client} />,
    'employee-settings': <EmployeePayrollSettings client={client} />,
    'contribution-rules': <CompanyContributionRules client={client} />,
    'unpaid-leave': <PayrollLwpRules client={client} />,
    compliance: (
      <PayrollComplianceCard
        form={board.complianceForm}
        loading={board.loading}
        busy={actions.complianceSaveBusy}
        error={actions.complianceSaveError}
        ok={actions.complianceSaveOk}
        onChange={board.setComplianceField}
        onSave={() => void actions.savePayrollCompliance()}
      />
    ),
    arrears: (
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
    ),
    components: (
      <>
        <CompanyPayslipComponents client={client} />
        <PayrollSalaryComponentsCard
          rows={board.data?.salaryComponents ?? []}
          loading={board.loading}
        />
      </>
    ),
    payslips: <ManagedPayslips client={client} ownerKey={ownerKey} />,
    exports: <ExportPanel exports={data} />,
  };
  return (
    <div className="min-w-0 space-y-3">
      {tasks.map((task) => {
        const shouldMountPanel = task.id === activeTask || visited.includes(task.id);
        return (
          <PageTabPanel key={task.id} id={task.id} activeTab={activeTask} label={task.label}>
            {shouldMountPanel ? panels[task.id as keyof typeof panels] : null}
          </PageTabPanel>
        );
      })}
    </div>
  );
};
export default PayrollWorkspacePanels;
