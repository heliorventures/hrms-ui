import Card from '../../../components/common/Card';
import { formatTaxMoney, type AnnualTax } from '../projectionViewTypes';

const TaxSlabBreakdown = ({ tax }: { tax: AnnualTax }) => (
  <Card title="Projected income tax calculation">
    <dl className="grid gap-2 sm:grid-cols-2">
      {[
        ['Salary considered', tax.gross],
        ['Standard deduction', tax.standard_deduction],
        ['Permitted deductions', tax.permitted_deductions],
        ['Taxable income', tax.taxable_income],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{formatTaxMoney(value)}</dd>
        </div>
      ))}
    </dl>
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Taxable income band</th>
            <th>Rate</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          {tax.slabs
            .filter((row) => Number(row.tax) > 0 || Number(row.from) === 0)
            .map((row) => (
              <tr key={row.from} className="border-t">
                <td className="p-2">
                  {formatTaxMoney(row.from)}–{formatTaxMoney(row.to)}
                </td>
                <td>{Number(row.rate) * 100}%</td>
                <td>{formatTaxMoney(row.tax)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
      {[
        ['Gross income tax', tax.slab_tax],
        ['Rebate', tax.rebate],
        ['Marginal relief', tax.marginal_relief],
        ['Surcharge', tax.surcharge],
        ['Health and education cess', tax.cess],
        ['Annual tax after statutory rounding', tax.statutory_tax],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{formatTaxMoney(value)}</dd>
        </div>
      ))}
    </dl>
    <p className="mt-3 text-xs">
      Calculation version: {tax.rule_version}.{' '}
      <a className="underline" href={tax.source} target="_blank" rel="noreferrer">
        Published tax rules
      </a>
    </p>
  </Card>
);
export default TaxSlabBreakdown;
