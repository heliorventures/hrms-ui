import { useId } from 'react';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  options: readonly ChoiceOption[];
  onChange: (value: string) => void;
  error?: string;
}

const RadioOption = ({
  name,
  selectedValue,
  option,
  onChange,
}: {
  name: string;
  selectedValue: string;
  option: ChoiceOption;
  onChange: (value: string) => void;
}) => {
  const generatedId = useId();
  const optionId = `${generatedId}-option`;
  const optionLabelId = `${generatedId}-label`;
  const optionDescriptionId = option.description ? `${generatedId}-description` : undefined;

  return (
    <label
      className={`flex min-h-11 items-start gap-3 rounded-md py-2 text-content-primary focus-within:ring-2 focus-within:ring-focus/30 md:min-h-8 md:py-1 ${
        option.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <input
        id={optionId}
        type="radio"
        name={name}
        value={option.value}
        checked={selectedValue === option.value}
        disabled={option.disabled}
        aria-labelledby={optionLabelId}
        aria-describedby={optionDescriptionId}
        onChange={(event) => {
          if (event.currentTarget.checked) onChange(option.value);
        }}
        className="mt-0.5 size-5 shrink-0 border-line text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      <span className="min-w-0">
        <span id={optionLabelId} className="block text-base font-medium md:text-sm">
          {option.label}
        </span>
        {option.description ? (
          <span id={optionDescriptionId} className="mt-0.5 block text-sm text-content-muted">
            {option.description}
          </span>
        ) : null}
      </span>
    </label>
  );
};

const RadioGroup = ({ label, name, value, options, onChange, error }: RadioGroupProps) => {
  const generatedId = useId();
  const legendId = `${generatedId}-legend`;
  const errorId = error ? `${generatedId}-error` : undefined;

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      className="space-y-1.5"
    >
      <legend id={legendId} className="mb-1 text-sm font-medium text-content-secondary">
        {label}
      </legend>
      <div className="space-y-1">
        {options.map((option) => (
          <RadioOption
            key={option.value}
            name={name}
            selectedValue={value}
            option={option}
            onChange={onChange}
          />
        ))}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-status-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
};

export default RadioGroup;
