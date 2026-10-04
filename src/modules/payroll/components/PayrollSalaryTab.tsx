import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatAmountString } from '../payrollFormatters';
import type { EmployeeSalaryPreview } from '../payrollTypes';

interface PayrollSalaryTabProps {
  preview: EmployeeSalaryPreview;
  loading: boolean;
  error: string | null;
}

const SalaryDetails = ({ preview }: { preview: NonNullable<EmployeeSalaryPreview> }) => (
  <div className="space-y-6">
    <dl className="grid gap-4 sm:grid-cols-3">
      {[
        [
          'Annual CTC',
          preview.financials
            ? (preview.financials.annual_ctc ?? 'Pending employer PF configuration')
            : preview.annualCtc,
        ],
        ['Monthly Gross', preview.monthlyGross],
        [
          'Annual Gross',
          preview.financials?.annual_gross ?? String(Number(preview.monthlyGross) * 12),
        ],
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
    {preview.financials && (
      <p className="text-sm text-content-secondary">
        Annual gross (monthly gross × 12): {formatAmountString(preview.financials.annual_gross)}.
        Annual employer PF:{' '}
        {preview.financials.annual_employer_pf === null
          ? 'Awaiting configuration'
          : formatAmountString(preview.financials.annual_employer_pf)}
        .
      </p>
    )}

    <Table
      ariaLabel="Your salary breakup"
      data={preview.lines.filter((line) => line.componentType === 'EARNING')}
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
);

const PayrollSalaryTab = ({ preview, loading, error }: PayrollSalaryTabProps) => {
  let content;
  if (loading) content = <p className="text-sm text-content-secondary">Loading your salary...</p>;
  else if (error) content = <p className="text-sm text-danger">{error}</p>;
  else if (preview) content = <SalaryDetails preview={preview} />;
  else
    content = (
      <p className="text-sm text-content-secondary">
        No salary structure is currently effective for your employee record. Contact HR if your
        salary assignment should already be active.
      </p>
    );
  return <Card title="Your Salary">{content}</Card>;
};

export default PayrollSalaryTab;
