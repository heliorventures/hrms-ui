import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

import FormField, { mergeDescribedBy } from './FormField';
import { requireAccessibleName } from './accessibleName';

export interface SelectOption {
  value: string;
  label: string;
}

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

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'aria-label' | 'aria-labelledby'
> &
  AccessibleNameProps & {
  description?: string;
  error?: string;
  optionalLabel?: string;
  options: readonly SelectOption[];
  fullWidth?: boolean;
};

const baseSelectClasses =
  'min-h-11 rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary transition-colors focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-content-muted disabled:opacity-70 md:min-h-9 md:text-sm';
const when = (condition: boolean, value: string) => (condition ? value : '');
const messageId = (message: string | undefined, selectId: string, suffix: string) =>
  message ? `${selectId}-${suffix}` : undefined;
const invalidValue = (
  invalid: boolean,
  callerInvalid: SelectHTMLAttributes<HTMLSelectElement>['aria-invalid']
) => (invalid ? true : callerInvalid);

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      description,
      error,
      optionalLabel,
      options,
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
    const selectId = id ?? generatedId;
    const visibleLabel = requireAccessibleName('Select', {
      label,
      ariaLabel: props['aria-label'],
      ariaLabelledBy: props['aria-labelledby'],
    });
    const controlClassName = `${baseSelectClasses} ${when(
      Boolean(error),
      'border-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger/30'
    )} ${when(fullWidth, 'w-full')} ${className}`;
    const renderSelect = (describedBy?: string, invalid = false) => (
      <select
        {...props}
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={invalidValue(invalid, callerInvalid)}
        aria-describedby={mergeDescribedBy(callerDescribedBy, describedBy)}
        className={controlClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );

    if (!visibleLabel) {
      const descriptionId = messageId(description, selectId, 'description');
      const errorId = messageId(error, selectId, 'error');
      return (
        <div className={`space-y-1.5 ${when(fullWidth, 'w-full')}`}>
          {renderSelect(mergeDescribedBy(descriptionId, errorId), Boolean(error))}
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
          id={selectId}
          label={visibleLabel}
          description={description}
          error={error}
          required={required}
          optionalLabel={optionalLabel || ''}
        >
          {({ describedBy, invalid }) => renderSelect(describedBy, invalid)}
        </FormField>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
