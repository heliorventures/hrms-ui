import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import type { TaxConfigurationRow } from '../payrollTaxTypes';

interface TaxConfigurationsCardProps {
  configs: TaxConfigurationRow[];
  loading: boolean;
}

const TaxConfigurationsCard = ({ configs, loading }: TaxConfigurationsCardProps) => (
  <Card title="Tax Configurations">
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax configurations...</p>
    ) : configs.length ? (
      <Table
        data={configs}
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'fiscalYear', label: 'Fiscal year', render: (row) => `FY ${row.fiscalYear}` },
          { key: 'regime', label: 'Regime', render: (row) => row.regime ?? '-' },
          { key: 'countryCode', label: 'Country', render: (row) => row.countryCode },
          {
            key: 'isActive',
            label: 'Status',
            render: (row) => (
              <Badge variant={row.isActive ? 'success' : 'neutral'}>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
        ]}
      />
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No tax configurations found.</p>
    )}
  </Card>
);

export default TaxConfigurationsCard;
