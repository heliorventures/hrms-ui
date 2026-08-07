import Badge from '../../../components/common/Badge';
import type { TaxConfigurationRow } from '../payrollTaxTypes';

interface TaxConfigurationSelectorProps {
  configs: TaxConfigurationRow[];
  loading: boolean;
  selectedConfig: TaxConfigurationRow | null;
  selectedConfigId: string;
  onChange: (id: string) => void;
}

const TaxConfigurationSelector = ({
  configs,
  loading,
  selectedConfig,
  selectedConfigId,
  onChange,
}: TaxConfigurationSelectorProps) => (
  <div className="flex flex-wrap items-end gap-4">
    <div className="min-w-[220px]">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tax configuration
      </label>
      <select
        value={selectedConfigId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        disabled={loading || configs.length === 0}
      >
        {configs.map((config) => (
          <option key={config.id} value={config.id}>
            FY {config.fiscalYear} - {config.regime ?? 'N/A'} - {config.countryCode}
          </option>
        ))}
      </select>
    </div>
    {selectedConfig && (
      <div className="flex flex-wrap gap-2">
        <Badge variant={selectedConfig.isActive ? 'success' : 'neutral'}>
          {selectedConfig.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="info">{selectedConfig.regime ?? 'N/A'}</Badge>
        <Badge variant="neutral">{selectedConfig.countryCode}</Badge>
      </div>
    )}
  </div>
);

export default TaxConfigurationSelector;
