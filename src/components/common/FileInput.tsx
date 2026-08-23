import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import FormField, { mergeDescribedBy } from './FormField';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  optionalLabel?: string;
  fullWidth?: boolean;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      description,
      error,
      optionalLabel,
      fullWidth = false,
      className = '',
      id,
      required,
      'aria-describedby': callerDescribedBy,
      'aria-invalid': callerInvalid,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <FormField
          id={inputId}
          label={label}
          description={description}
          error={error}
          required={required}
          optionalLabel={optionalLabel ?? ''}
        >
          {({ describedBy, invalid }) => (
            <input
              {...props}
              ref={ref}
              id={inputId}
              type="file"
              required={required}
              aria-invalid={invalid ? true : callerInvalid}
              aria-describedby={mergeDescribedBy(callerDescribedBy, describedBy)}
              className={`min-h-11 rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary file:mr-3 file:rounded-md file:border-0 file:bg-surface-selected file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-content-primary hover:file:bg-line-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:opacity-70 md:text-sm ${
                error
                  ? 'border-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger/30'
                  : ''
              } ${fullWidth ? 'w-full' : ''} ${className}`}
            />
          )}
        </FormField>
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export default FileInput;
