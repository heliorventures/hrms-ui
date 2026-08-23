import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import FormField, { mergeDescribedBy } from './FormField';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  optionalLabel?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
    const textareaId = id ?? generatedId;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <FormField
          id={textareaId}
          label={label}
          description={description}
          error={error}
          required={required}
          optionalLabel={optionalLabel ?? ''}
        >
          {({ describedBy, invalid }) => (
            <textarea
              {...props}
              ref={ref}
              id={textareaId}
              required={required}
              aria-invalid={invalid ? true : callerInvalid}
              aria-describedby={mergeDescribedBy(callerDescribedBy, describedBy)}
              className={`min-h-11 rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-content-muted disabled:opacity-70 read-only:bg-canvas md:text-sm ${
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

Textarea.displayName = 'Textarea';

export default Textarea;
