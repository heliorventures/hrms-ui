import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatTaxCurrency, type TaxComputationRow } from '../payrollTaxTypes';

interface TaxComputationsCardProps {
  computations: TaxComputationRow[] | null;
  error: string | null;
  loading: boolean;
}

const TaxComputationsCard = ({ computations, error, loading }: TaxComputationsCardProps) => (
  <Card title="Your Tax Computations">
    {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading Declarations...</p>}
    {error && !loading && <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>}
    {!loading && !error && computations && computations.length > 0 && (
      <Table
        data={computations}
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'fy', label: 'FY', render: (row) => row.fiscalYear },
          { key: 'regime', label: 'Regime', render: (row) => row.taxRegimeChosen ?? '-' },
          {
            key: 'gross',
            label: 'Gross',
            render: (row) => (row.grossIncome ? formatTaxCurrency(Number(row.grossIncome)) : '-'),
          },
          {
            key: 'final',
            label: 'Est. Tax',
            render: (row) => (row.finalTax ? formatTaxCurrency(Number(row.finalTax)) : '-'),
          },
        ]}
      />
    )}
    {!loading && !error && computations && computations.length === 0 && (
      <p className="text-sm text-gray-500 dark:text-gray-400">No Saved Computations Yet.</p>
    )}
  </Card>
);

export default TaxComputationsCard;
