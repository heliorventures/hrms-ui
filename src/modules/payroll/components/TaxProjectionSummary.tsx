import Card from '../../../components/common/Card';
import { formatTaxMoney, type TaxProjection } from '../projectionViewTypes';

function selectedWithholdingLabel(selected: TaxProjection['selected_month']): string {
  if (!selected) return 'Selected monthly withholding';
  const recorded =
    selected.evidence === 'IMPORTED_ACTUAL' || selected.evidence === 'FINALIZED_PAYROLL';
  const period = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(selected.year, selected.month - 1, 1)));
  return `${recorded ? 'Recorded' : 'Projected'} monthly withholding · ${period}`;
}

const TaxProjectionSummary = ({ projection }: { projection: TaxProjection }) => {
  const entries = [
    ['Annual earnings', formatTaxMoney(projection.annual_earnings)],
    ['Net taxable income', formatTaxMoney(projection.tax?.taxable_income)],
    ['Projected annual income tax', formatTaxMoney(projection.tax?.statutory_tax)],
    [
      projection.history_complete ? 'Recorded TDS' : 'Recorded TDS (partial history)',
      formatTaxMoney(projection.recorded_tds),
    ],
    [
      'Remaining projected liability',
      projection.history_complete
        ? formatTaxMoney(projection.withholding?.remaining)
        : 'Not available until history is complete',
    ],
    [
      selectedWithholdingLabel(projection.selected_month),
      formatTaxMoney(projection.selected_monthly_tds),
    ],
  ];
  return (
    <Card
      title={`Tax projection · April ${projection.fiscal_year}–March ${projection.fiscal_year + 1}`}
    >
      <div data-tour-anchor="payroll.pay.tax-projection">
        {projection.configuration && (
          <p className="mb-3 rounded-lg bg-surface-raised p-2 text-sm">
            {projection.configuration.regime === 'NEW' ? 'New tax regime' : 'Old tax regime'} ·
            Effective {projection.configuration.effective_from}. Withholding:{' '}
            {projection.configuration.method === 'PERCENTAGE_OVERRIDE'
              ? `${Number(projection.configuration.percentage) * 100}% of ${projection.configuration.basis_components.join(' + ')} earned for the month`
              : 'Projected annual liability adjusted for recorded deductions and remaining months'}
            .
          </p>
        )}
        <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {entries.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-600">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!projection.history_complete && (
          <p className="mt-3 rounded bg-amber-50 p-2 text-sm text-amber-900">
            Earlier deduction history is incomplete. Estimates are not recorded deductions. HR must
            review provisional withholding.
          </p>
        )}
        {projection.limitations.length > 0 && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Projection assumptions and limitations</summary>
            {projection.limitations.map((value) => (
              <p className="mt-2" key={value}>
                {value}
              </p>
            ))}
          </details>
        )}
        <p className="mt-3 text-xs text-content-secondary">{projection.note}</p>
      </div>
    </Card>
  );
};
export default TaxProjectionSummary;
