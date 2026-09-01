import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { mergeDescribedBy } from './FormField';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      className = '',
      id,
      'aria-describedby': callerDescribedBy,
      'aria-invalid': callerInvalid,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2 text-content-primary focus-within:ring-2 focus-within:ring-focus/30 md:min-h-8 md:py-1">
          <input
            {...props}
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-labelledby={labelId}
            aria-invalid={error ? true : callerInvalid}
            aria-describedby={mergeDescribedBy(callerDescribedBy, descriptionId, errorId)}
            className={`mt-0.5 size-5 shrink-0 rounded border-line text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          />
          <span className="min-w-0">
            <span id={labelId} className="block text-base font-medium md:text-sm">
              {label}
            </span>
            {description ? (
              <span id={descriptionId} className="mt-0.5 block text-sm text-content-muted">
                {description}
              </span>
            ) : null}
          </span>
        </label>
        {error ? (
          <p id={errorId} role="alert" className="text-sm font-medium text-status-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
