import Card from '../../../components/common/Card';
import { formatAmountString } from '../payrollFormatters';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

const EmployeeTaxDeclarationCard = ({
  context,
  loading,
}: {
  context: TaxSubmissionContext | null;
  loading: boolean;
}) => {
  const saved = context?.declaration;
  if (loading)
    return (
      <Card title="Your Tax Declaration">
        <p role="status">Loading your declaration...</p>
      </Card>
    );
  if (!context || !saved)
    return (
      <Card title="Your Tax Declaration">
        <p>No saved declaration for this financial year.</p>
      </Card>
    );
  const entries = [
    ['Assigned regime', context.settings.regime === 'NEW' ? 'New tax regime' : 'Old tax regime'],
    ['Gross income estimate', formatAmountString(saved.input.gross_income)],
    ['Deduction estimate', formatAmountString(saved.input.declared_deductions)],
  ];
  return (
    <Card title={`Saved declaration · FY ${context.fiscal_year}–${context.fiscal_year + 1}`}>
      <dl className="grid gap-4 sm:grid-cols-3">
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-content-secondary">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-content-secondary">
        These are your saved estimates. Payroll withholding uses HR&apos;s assigned settings and
        approved evidence, not these estimates.
      </p>
    </Card>
  );
};
export default EmployeeTaxDeclarationCard;
