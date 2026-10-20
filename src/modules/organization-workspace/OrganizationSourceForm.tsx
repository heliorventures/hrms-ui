import { useState, type FormEvent } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { organizationUserMessage } from './organizationDataError';

export interface SourceField {
  key: string;
  label: string;
  type?: 'date' | 'email' | 'password';
  required?: boolean;
  minLength?: number;
  options?: { value: string; label: string }[];
  value?: string;
}

interface Props {
  fields: SourceField[];
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

const OrganizationSourceForm = ({ fields, label, busy, disabled, onSubmit }: Props) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.value ?? '']))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || busy || disabled) return;
    setError(null);
    setSubmitting(true);
    const request = { ...values };
    // Clear sensitive input as soon as the user submits it; it never enters form history.
    setValues((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, value]) => [
          key,
          fields.some((field) => field.key === key && field.type === 'password') ? '' : value,
        ])
      )
    );
    void onSubmit(request)
      .catch((cause: unknown) => setError(organizationUserMessage(cause)))
      .finally(() => setSubmitting(false));
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) =>
          field.options ? (
            <Select
              key={field.key}
              label={field.label}
              value={values[field.key]}
              required={field.required}
              options={field.options}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          ) : (
            <Input
              key={field.key}
              label={field.label}
              type={field.type ?? 'text'}
              required={field.required}
              minLength={field.minLength}
              value={values[field.key]}
              autoComplete={field.type === 'password' ? 'new-password' : 'off'}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          )
        )}
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit" busy={submitting || busy} disabled={disabled}>
        {label}
      </Button>
    </form>
  );
};

export default OrganizationSourceForm;
