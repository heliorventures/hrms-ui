import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatPayrollPaymentDate, formatPayrollPeriod } from '../payrollFormatters';
import type { PayrollCycleRow, SalaryComponentRow } from '../payrollTypes';

interface PayrollSalaryTabProps {
  salaryComponents: SalaryComponentRow[] | null;
  payrollCycles: PayrollCycleRow[] | null;
  loadingSalary: boolean;
  loadingShell: boolean;
  errorSalary: string | null;
}

const PayrollSalaryTab = ({
  salaryComponents,
  payrollCycles,
  loadingSalary,
  loadingShell,
  errorSalary,
}: PayrollSalaryTabProps) => (
  <div className="space-y-6">
    <Card title="Salary Components">
      <Table
        data={salaryComponents ?? []}
        loading={loadingSalary}
        errorMessage={errorSalary ? 'Could not load this section.' : null}
        loadingMessage="Loading Salary Components..."
        emptyMessage="No Salary Components Found."
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Component' },
          { key: 'code', label: 'Code' },
          { key: 'componentType', label: 'Type' },
          {
            key: 'flags',
            label: 'Flags',
            render: (row: SalaryComponentRow) => (
              <div className="flex flex-wrap gap-2">
                <Badge variant={row.isActive ? 'success' : 'neutral'}>
                  {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={row.isFixed ? 'info' : 'neutral'}>
                  {row.isFixed ? 'Fixed' : 'Variable'}
                </Badge>
                <Badge variant={row.isTaxable ? 'warning' : 'neutral'}>
                  {row.isTaxable ? 'Taxable' : 'Non-taxable'}
                </Badge>
              </div>
            ),
          },
        ]}
      />
    </Card>

    <Card title="Payroll Cycles">
      <Table
        data={payrollCycles ?? []}
        loading={loadingShell}
        loadingMessage="Loading Payroll Cycles..."
        emptyMessage="No Payroll Cycles Found."
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Cycle' },
          {
            key: 'period',
            label: 'Period',
            render: (row: PayrollCycleRow) => formatPayrollPeriod(row),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row: PayrollCycleRow) => <Badge variant="info">{row.status}</Badge>,
          },
          {
            key: 'paymentDate',
            label: 'Payment Date',
            render: (row: PayrollCycleRow) => formatPayrollPaymentDate(row.paymentDate),
          },
        ]}
      />
    </Card>
  </div>
);

export default PayrollSalaryTab;
