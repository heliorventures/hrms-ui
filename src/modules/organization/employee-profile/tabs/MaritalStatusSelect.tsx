import Select from '../../../../components/common/Select';

interface Props {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const MaritalStatusSelect = ({ value, disabled, onChange }: Props) => (
  <Select
    label="Marital Status"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled}
    fullWidth
    options={[
      { value: '', label: 'Not specified' },
      { value: 'SINGLE', label: 'Single' },
      { value: 'MARRIED', label: 'Married' },
      { value: 'DIVORCED', label: 'Divorced' },
      { value: 'WIDOWED', label: 'Widowed' },
      { value: 'SEPARATED', label: 'Separated' },
      { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
    ]}
  />
);

export default MaritalStatusSelect;
