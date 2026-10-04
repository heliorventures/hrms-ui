import Input from '../../../components/common/Input';
import type { ComponentFormula } from '../contributionTypes';

const ContributionFormulaFields = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ComponentFormula;
  onChange: (value: ComponentFormula) => void;
}) => (
  <fieldset className="space-y-3 rounded border p-3">
    <legend className="font-semibold">{label}</legend>
    <p className="text-sm">
      Enter component codes and wage shares, such as BASIC=1 and HRA=0.5, separated by commas.
      Shares range from 0 to 1.
    </p>
    <Input
      required
      label={`${label} component shares`}
      defaultValue={Object.entries(value.weights)
        .map(([code, weight]) => `${code}=${weight}`)
        .join(', ')}
      onChange={(e) => {
        const entries = e.target.value
          .split(',')
          .filter((item) => item.trim())
          .map((item) => item.split('=').map((part) => part.trim()) as [string, string?]);
        const seen = new Set<string>();
        const valid = entries.every(([code, weight], index) => {
          const original = e.target.value.split(',').filter((item) => item.trim())[index];
          const accepted =
            original.split('=').length === 2 &&
            /^[A-Z][A-Z0-9_]{0,63}$/.test(code) &&
            !seen.has(code) &&
            /^(0(\.\d+)?|1(\.0+)?)$/.test(weight ?? '');
          seen.add(code);
          return accepted;
        });
        e.target.setCustomValidity(
          valid ? '' : 'Enter each component once with a share between zero and one.'
        );
        if (!valid) return;
        onChange({
          ...value,
          weights: Object.fromEntries(entries.map(([code, weight]) => [code, weight ?? ''])),
        });
      }}
    />
    <Input
      required
      label={`${label} fractional rate`}
      value={value.rate}
      onChange={(e) => onChange({ ...value, rate: e.target.value })}
    />
    <Input
      label={`${label} wage ceiling (blank for none)`}
      value={value.ceiling ?? ''}
      onChange={(e) => onChange({ ...value, ceiling: e.target.value || null })}
    />
    <label>
      Rounding
      <select
        className="block rounded border p-2"
        value={value.rounding}
        onChange={(e) => onChange({ ...value, rounding: e.target.value })}
      >
        <option value="HALF_UP_2DP">Two decimal places</option>
        <option value="HALF_UP_RUPEE">Nearest rupee</option>
        <option value="CEIL_RUPEE">Round up to rupee</option>
      </select>
    </label>
  </fieldset>
);
export default ContributionFormulaFields;
