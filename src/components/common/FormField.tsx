import { useId } from 'react';
import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  id?: string;
  children: (field: { inputId: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

// Shared by the field primitives in this task; keeping one merger prevents ID-contract drift.
// eslint-disable-next-line react-refresh/only-export-components
export const mergeDescribedBy = (...values: Array<string | undefined>) => {
  const ids = values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []);
  const merged = [...new Set(ids)].join(' ');
  return merged || undefined;
};

const FieldRequirementHint = ({
  required,
  optionalLabel,
}: Pick<FormFieldProps, 'required' | 'optionalLabel'>) => {
  if (required) {
    return (
      <span className="text-status-danger" aria-hidden="true">
        *
      </span>
    );
  }
  if (optionalLabel) {
    return (
      <span className="text-sm font-normal text-content-muted">
        (<span>{optionalLabel}</span>)
      </span>
    );
  }
  return null;
};

const FormField = ({
  label,
  description,
  error,
  required = false,
  optionalLabel = 'Optional',
  id,
  children,
}: FormFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = mergeDescribedBy(descriptionId, errorId);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-content-secondary">
          {label}
        </label>
        <FieldRequirementHint required={required} optionalLabel={optionalLabel} />
      </div>
      {children({ inputId, describedBy, invalid: Boolean(error) })}
      {description ? (
        <p id={descriptionId} className="text-sm text-content-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-status-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
