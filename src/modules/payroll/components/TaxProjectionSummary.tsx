import Card from '../../../components/common/Card';
import { formatTaxMoney, type TaxProjection } from '../projectionViewTypes';

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
    ['Selected month withholding', formatTaxMoney(projection.selected_monthly_tds)],
  ];
  return (
    <Card
      title={`Tax projection · April ${projection.fiscal_year}–March ${projection.fiscal_year + 1}`}
    >
      <div data-tour-anchor="payroll.pay.tax-projection">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-600">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!projection.history_complete && (
          <p className="mt-3 rounded bg-amber-50 p-3 text-amber-900">
            Earlier deduction history is incomplete. Estimates are not recorded deductions. HR must
            review provisional withholding.
          </p>
        )}
        {projection.limitations.map((value) => (
          <p className="mt-2 text-sm" key={value}>
            {value}
          </p>
        ))}
        <p className="mt-4 text-sm text-slate-600">{projection.note}</p>
      </div>
    </Card>
  );
};
export default TaxProjectionSummary;
