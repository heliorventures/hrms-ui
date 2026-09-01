import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatAmountString } from '../payrollFormatters';
import type { EmployeeSalaryPreview } from '../payrollTypes';

interface PayrollSalaryTabProps {
  preview: EmployeeSalaryPreview;
  loading: boolean;
  error: string | null;
}

const PayrollSalaryTab = ({ preview, loading, error }: PayrollSalaryTabProps) => (
  <Card title="Your Salary">
    {loading ? <p className="text-sm text-content-secondary">Loading your salary...</p> : null}

    {!loading && error ? <p className="text-sm text-danger">{error}</p> : null}

    {!loading && !error && !preview ? (
      <p className="text-sm text-content-secondary">
        No salary structure is currently effective for your employee record. Contact HR if your
        salary assignment should already be active.
      </p>
    ) : null}

    {!loading && !error && preview ? (
      <div className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Annual CTC', preview.annualCtc],
            ['Monthly Gross', preview.monthlyGross],
            ['Monthly Deductions', preview.monthlyDeductions],
            ['Net Before Statutory', preview.monthlyNetBeforeStatutory],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-surface-raised p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-content-secondary">
                {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-content-primary">
                {formatAmountString(value)}
              </dd>
            </div>
          ))}
        </dl>

        <Table
          ariaLabel="Your salary breakup"
          data={preview.lines}
          emptyMessage="No salary breakup lines are available."
          keyExtractor={(line) => line.salaryComponentId}
          columns={[
            { key: 'componentName', label: 'Component' },
            { key: 'componentCode', label: 'Code' },
            { key: 'componentType', label: 'Type' },
            {
              key: 'monthlyAmount',
              label: 'Monthly Amount',
              render: (line) => formatAmountString(line.monthlyAmount),
            },
            {
              key: 'annualAmount',
              label: 'Annual Amount',
              render: (line) => formatAmountString(line.annualAmount),
            },
          ]}
        />
      </div>
    ) : null}
  </Card>
);

export default PayrollSalaryTab;
