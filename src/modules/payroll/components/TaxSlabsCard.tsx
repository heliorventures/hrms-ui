import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatOptionalTaxAmount, formatTaxCurrency, type TaxSlabRow } from '../payrollTaxTypes';

interface TaxSlabsCardProps {
  loading: boolean;
  slabs: TaxSlabRow[];
}

const TaxSlabsCard = ({ loading, slabs }: TaxSlabsCardProps) => (
  <Card title="Tax Slabs">
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax slabs...</p>
    ) : slabs.length ? (
      <Table
        data={slabs}
        keyExtractor={(row) => row.id}
        columns={[
          {
            key: 'incomeFrom',
            label: 'Income from',
            render: (row) => formatTaxCurrency(Number(row.incomeFrom)),
          },
          { key: 'incomeTo', label: 'Income to', render: (row) => formatOptionalTaxAmount(row.incomeTo) },
          { key: 'taxRate', label: 'Tax rate', render: (row) => (row.taxRate ? `${row.taxRate}%` : '-') },
          {
            key: 'surchargeRate',
            label: 'Surcharge',
            render: (row) => (row.surchargeRate ? `${row.surchargeRate}%` : '-'),
          },
          { key: 'cessRate', label: 'Cess', render: (row) => (row.cessRate ? `${row.cessRate}%` : '-') },
        ]}
      />
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No tax slabs found for the selected configuration.
      </p>
    )}
  </Card>
);

export default TaxSlabsCard;
