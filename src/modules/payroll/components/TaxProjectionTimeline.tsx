import Card from '../../../components/common/Card';
import { formatTaxMoney, type TaxProjection, type Evidence } from '../projectionViewTypes';

const labels: Record<Evidence, string> = {
  IMPORTED_ACTUAL: 'Imported actual',
  FINALIZED_PAYROLL: 'Finalized payroll',
  HISTORICAL_ESTIMATE: 'Historical estimate',
  FUTURE_PROJECTION: 'Future projection',
};
const TaxProjectionTimeline = ({ projection }: { projection: TaxProjection }) => (
  <Card title="Month by month earnings and deductions">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {['Month', 'Evidence', 'Earnings', 'Recorded TDS', 'Estimated withholding'].map(
              (value) => (
                <th className="p-2" key={value}>
                  {value}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {projection.months.map((row) => (
            <tr key={`${row.year}-${row.month}`} className="border-t">
              <td className="p-2">
                {new Date(row.year, row.month - 1, 1).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="p-2">
                {row.aggregate_source ? `Covered by ${row.aggregate_source}` : labels[row.evidence]}
              </td>
              <td className="p-2">
                {row.aggregate_source ? 'See period total below' : formatTaxMoney(row.earnings)}
              </td>
              <td className="p-2">
                {row.aggregate_source ? 'See period total below' : formatTaxMoney(row.tds)}
              </td>
              <td className="p-2">
                {row.projected_withholding === null || row.projected_withholding === undefined
                  ? '—'
                  : formatTaxMoney(row.projected_withholding)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {projection.opening_history.map((row) => (
      <p className="mt-3 text-sm" key={row.source_key}>
        {row.source_key}: {row.period_start}–{row.period_end}, earnings{' '}
        {formatTaxMoney(row.earnings)}, recorded TDS {formatTaxMoney(row.tds)}. Monthly allocation
        was not supplied.
      </p>
    ))}
    <details className="mt-3">
      <summary className="cursor-pointer font-semibold">Salary component breakdown</summary>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Month</th>
              <th>Component</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {projection.months
              .filter((row) => !row.aggregate_source)
              .flatMap((row) =>
                Object.entries(row.components).map(([code, value]) => (
                  <tr key={`${row.year}-${row.month}-${code}`}>
                    <td>
                      {row.month}/{row.year}
                    </td>
                    <td>{code}</td>
                    <td>{formatTaxMoney(value)}</td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
    </details>
  </Card>
);
export default TaxProjectionTimeline;
