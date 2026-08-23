import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import FormField, { mergeDescribedBy } from './FormField';
import { requireAccessibleName } from './accessibleName';

type AccessibleNameProps =
  | {
      label: string;
      'aria-label'?: string;
      'aria-labelledby'?: string;
    }
  | {
      label?: undefined;
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      label?: undefined;
      'aria-label'?: string;
      'aria-labelledby': string;
    };

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'aria-labelledby'
> &
  AccessibleNameProps & {
  description?: string;
  error?: string;
  optionalLabel?: string;
  fullWidth?: boolean;
};

const baseInputClasses =
  'min-h-11 rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary placeholder:text-content-muted transition-colors focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-content-muted disabled:opacity-70 read-only:bg-canvas md:min-h-9 md:text-sm';
const errorInputClasses =
  'border-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger/30';
const when = (condition: boolean, value: string) => (condition ? value : '');
const messageId = (message: string | undefined, inputId: string, suffix: string) =>
  message ? `${inputId}-${suffix}` : undefined;
const invalidValue = (
  invalid: boolean,
  callerInvalid: InputHTMLAttributes<HTMLInputElement>['aria-invalid']
) => (invalid ? true : callerInvalid);

const Input = forwardRef<HTMLInputElement, InputProps>(
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
    const visibleLabel = requireAccessibleName('Input', {
      label,
      ariaLabel: props['aria-label'],
      ariaLabelledBy: props['aria-labelledby'],
    });
    const controlClassName = `${baseInputClasses} ${when(Boolean(error), errorInputClasses)} ${when(
      fullWidth,
      'w-full'
    )} ${className}`;
    const renderInput = (describedBy?: string, invalid = false) => (
      <input
        {...props}
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={invalidValue(invalid, callerInvalid)}
        aria-describedby={mergeDescribedBy(callerDescribedBy, describedBy)}
        className={controlClassName}
      />
    );

    if (!visibleLabel) {
      const descriptionId = messageId(description, inputId, 'description');
      const errorId = messageId(error, inputId, 'error');
      return (
        <div className={`space-y-1.5 ${when(fullWidth, 'w-full')}`}>
          {renderInput(mergeDescribedBy(descriptionId, errorId), Boolean(error))}
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
    }

    return (
      <div className={when(fullWidth, 'w-full')}>
        <FormField
          id={inputId}
          label={visibleLabel}
          description={description}
          error={error}
          required={required}
          optionalLabel={optionalLabel || ''}
        >
          {({ describedBy, invalid }) => renderInput(describedBy, invalid)}
        </FormField>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
