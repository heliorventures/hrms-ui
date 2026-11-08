import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';

import type { LoanField, LoanValues } from './loanForm';

interface Props {
  fields: readonly LoanField[];
  values: LoanValues;
  onChange: (key: string, value: string) => void;
}
const LoanFields = ({ fields, values, onChange }: Props) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {fields.map((field) => {
      if (field.visibleWhen && !field.visibleWhen(values)) return null;
      if (field.type === 'multi')
        return (
          <fieldset key={field.key} className="space-y-2 rounded-lg border border-line-subtle p-3">
            <legend className="px-1 text-sm font-medium">{field.label}</legend>
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={field.readOnly}
                  checked={(values[field.key] ?? '').split(',').includes(option.value)}
                  onChange={(event) => {
                    const selected = new Set((values[field.key] ?? '').split(',').filter(Boolean));
                    if (event.target.checked) selected.add(option.value);
                    else selected.delete(option.value);
                    onChange(field.key, [...selected].join(','));
                  }}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        );
      const props = {
        label: field.label,
        value: values[field.key] ?? '',
        required: !field.optional,
        description: field.description,
        onChange: (
          event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        ) => onChange(field.key, event.target.value),
      };
      if (field.options)
        return (
          <Select key={field.key} {...props} disabled={field.readOnly} options={field.options} />
        );
      if (field.type === 'textarea')
        return <Textarea key={field.key} {...props} readOnly={field.readOnly} maxLength={2000} />;
      return (
        <Input
          key={field.key}
          {...props}
          readOnly={field.readOnly}
          type={field.type === 'date' ? 'date' : 'text'}
          inputMode={field.type === 'decimal' ? 'decimal' : undefined}
          maxLength={500}
        />
      );
    })}
  </div>
);
export default LoanFields;
