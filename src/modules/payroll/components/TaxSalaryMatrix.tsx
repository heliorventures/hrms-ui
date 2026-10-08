import Card from '../../../components/common/Card';
import { formatTaxMoney, type TaxProjection } from '../projectionViewTypes';

const TaxSalaryMatrix = ({ projection }: { projection: TaxProjection }) => {
  const codes = [
    ...new Set(projection.months.flatMap((month) => Object.keys(month.components))),
  ].sort();
  return (
    <Card title="Gross earnings from employment">
      <p className="mb-3 text-sm text-content-secondary">
        Imported and finalized amounts replace estimates. Missing earlier months remain projections,
        not recorded payments.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm" aria-label="Financial year salary components">
          <thead>
            <tr>
              <th className="p-2 text-left">Salary component</th>
              {projection.months.map((month) => (
                <th className="whitespace-nowrap p-2" key={`${month.year}-${month.month}`}>
                  {new Date(month.year, month.month - 1, 1).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: '2-digit',
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr className="border-t border-line" key={code}>
                <th className="p-2 text-left font-medium">{code}</th>
                {projection.months.map((month) => (
                  <td className="whitespace-nowrap p-2" key={`${month.year}-${month.month}`}>
                    {month.aggregate_source
                      ? 'Period total supplied'
                      : formatTaxMoney(month.components[code] ?? '0')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-semibold">
              <th className="p-2 text-left">Total earnings</th>
              {projection.months.map((month) => (
                <td className="whitespace-nowrap p-2" key={`${month.year}-${month.month}`}>
                  {month.aggregate_source
                    ? 'Period total supplied'
                    : formatTaxMoney(month.earnings)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};
export default TaxSalaryMatrix;
